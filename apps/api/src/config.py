from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Server ---
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: Literal["debug", "info", "warning", "error"] = "info"
    environment: Literal["development", "staging", "production"] = "development"

    # --- LLM: OpenAI ---
    openai_api_key: SecretStr = SecretStr("")
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str | None = None

    # --- LLM: Anthropic ---
    anthropic_api_key: SecretStr = SecretStr("")
    anthropic_model: str = "claude-3-5-haiku-latest"

    # --- LLM: Default provider ---
    llm_provider: Literal["openai", "anthropic"] = "openai"

    # --- LLM: Common ---
    llm_temperature: float = 0.0
    llm_max_tokens: int = 4096

    # --- Database ---
    database_url: str = "sqlite+aiosqlite:///./data/ragmark.db"

    # --- ChromaDB ---
    chroma_persist_dir: str = "./data/chroma"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def data_dir(self) -> Path:
        p = Path("data")
        p.mkdir(parents=True, exist_ok=True)
        return p


@lru_cache
def get_settings() -> Settings:
    return Settings()
