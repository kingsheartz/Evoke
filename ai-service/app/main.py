from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import settings
from app.services.rag import RAGService

app = FastAPI(
    title="Evoke AI Service",
    description="RAG-powered AI assistant for Evoke Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_service = RAGService()


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    module: str = Field(default="general", pattern="^(academy|shop|tours|general)$")
    session_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    module: str


class IndexRequest(BaseModel):
    source_type: str
    source_id: int
    module: str
    content: str
    metadata: dict | None = None


@app.get("/health")
async def health():
    return {"status": "ok", "model": settings.ollama_model}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = await rag_service.chat(request.message, request.module)
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            module=request.module,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/index")
async def index_content(request: IndexRequest):
    chunk_id = await rag_service.index_content(
        source_type=request.source_type,
        source_id=request.source_id,
        module=request.module,
        content=request.content,
        metadata=request.metadata,
    )
    return {"chunk_id": chunk_id, "status": "indexed"}


@app.post("/reindex")
async def reindex_module(module: str):
    count = await rag_service.reindex_module(module)
    return {"module": module, "chunks_indexed": count}
