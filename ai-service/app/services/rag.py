import httpx
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.config import settings


class RAGService:
    def __init__(self):
        self.engine = create_engine(settings.database_url)
        self.Session = sessionmaker(bind=self.engine)

    async def _embed(self, text_content: str) -> list[float]:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.ollama_host}/api/embeddings",
                json={"model": settings.embedding_model, "prompt": text_content},
            )
            response.raise_for_status()
            return response.json()["embedding"]

    async def _generate(self, prompt: str) -> str:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{settings.ollama_host}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                },
            )
            response.raise_for_status()
            return response.json()["response"]

    def _chunk_text(self, content: str) -> list[str]:
        words = content.split()
        chunks = []
        size = settings.chunk_size
        overlap = settings.chunk_overlap

        for i in range(0, len(words), size - overlap):
            chunk = " ".join(words[i : i + size])
            if chunk:
                chunks.append(chunk)

        return chunks or [content]

    async def index_content(
        self,
        source_type: str,
        source_id: int,
        module: str,
        content: str,
        metadata: dict | None = None,
    ) -> int:
        chunks = self._chunk_text(content)
        last_id = 0

        with self.Session() as session:
            session.execute(
                text(
                    "DELETE FROM ai_knowledge_chunks WHERE source_type = :st AND source_id = :sid"
                ),
                {"st": source_type, "sid": source_id},
            )

            for chunk in chunks:
                embedding = await self._embed(chunk)
                embedding_str = "[" + ",".join(str(v) for v in embedding) + "]"

                result = session.execute(
                    text("""
                        INSERT INTO ai_knowledge_chunks
                            (source_type, source_id, module, content, metadata, embedding, created_at, updated_at)
                        VALUES
                            (:st, :sid, :mod, :content, :meta, :emb::vector, NOW(), NOW())
                        RETURNING id
                    """),
                    {
                        "st": source_type,
                        "sid": source_id,
                        "mod": module,
                        "content": chunk,
                        "meta": str(metadata or {}),
                        "emb": embedding_str,
                    },
                )
                last_id = result.scalar()

            session.commit()

        return last_id

    async def chat(self, message: str, module: str) -> dict:
        query_embedding = await self._embed(message)
        embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

        with self.Session() as session:
            rows = session.execute(
                text("""
                    SELECT id, content, metadata, module,
                           1 - (embedding <=> :query::vector) AS similarity
                    FROM ai_knowledge_chunks
                    WHERE (:mod = 'general' OR module = :mod)
                    ORDER BY embedding <=> :query::vector
                    LIMIT :top_k
                """),
                {"query": embedding_str, "mod": module, "top_k": settings.top_k},
            ).fetchall()

        context = "\n\n".join([row.content for row in rows])
        sources = [
            {"id": row.id, "module": row.module, "similarity": float(row.similarity)}
            for row in rows
        ]

        system_prompt = f"""You are the Evoke Platform AI assistant for the {module} module.
Answer questions using ONLY the provided context. If unsure, say you don't have that information.
Be helpful, concise, and professional.

Context:
{context}

User question: {message}

Answer:"""

        answer = await self._generate(system_prompt)

        return {"answer": answer.strip(), "sources": sources}

    async def reindex_module(self, module: str) -> int:
        # Placeholder — Laravel artisan command will push content here
        return 0
