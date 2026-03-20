FROM python:3.12-slim AS base

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --system

COPY . .

FROM base AS dev
RUN uv sync --frozen --system

FROM base AS prod
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
