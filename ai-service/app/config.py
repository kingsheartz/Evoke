from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://evoke:evoke_secret@localhost:5432/evoke"
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "qwen3"
    embedding_model: str = "nomic-embed-text"
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k: int = 5

    class Config:
        env_file = ".env"


settings = Settings()
