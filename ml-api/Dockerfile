# ─── Stage 1: Base ───────────────────────────────────────────────────────────
FROM python:3.11-slim AS base

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# ─── Stage 2: Dependencies ───────────────────────────────────────────────────
FROM base AS deps

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ─── Stage 3: Runtime ────────────────────────────────────────────────────────
FROM deps AS runtime

COPY app/ ./app/
COPY models/.gitkeep ./models/.gitkeep

# Model weights are mounted at runtime via Railway volume or downloaded on boot
# See scripts/download_model.py for CI/CD model download pattern

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
