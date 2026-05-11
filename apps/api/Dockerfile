FROM python:3.12-slim AS builder

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-dev --no-install-project

COPY src/ ./src/

FROM python:3.12-slim AS runner

WORKDIR /app

RUN groupadd --system app && useradd --system --no-log-init --gid app app

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src
COPY .env.example .env

RUN mkdir -p /app/data && chown -R app:app /app

USER app

EXPOSE 8000

CMD ["/app/.venv/bin/uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
