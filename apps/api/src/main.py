from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.router import api_router
from src.config import get_settings
from src.db.session import create_db_and_tables
from src.middleware.correlation import CorrelationMiddleware
from src.middleware.error_handler import register_exception_handlers
from src.middleware.logging import LoggingMiddleware
from src.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI) -> Any:  # noqa: ARG001
    settings = get_settings()
    logger.info("starting_up", environment=settings.environment)
    await create_db_and_tables()
    yield
    logger.info("shutting_down")


def create_app() -> FastAPI:
    app = FastAPI(
        title="RAGMark API",
        version="0.1.0",
        description="FastAPI + LangChain engineered starter for RAG applications",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(CorrelationMiddleware)
    app.add_middleware(LoggingMiddleware)

    register_exception_handlers(app)

    app.include_router(api_router, prefix="/api")

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
