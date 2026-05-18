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

# Install CPU-only torch first (avoids pulling 2GB CUDA build from PyPI)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
        torch==2.11.0 \
        --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt \
        --extra-index-url https://download.pytorch.org/whl/cpu

# ─── Stage 3: Runtime ────────────────────────────────────────────────────────
FROM deps AS runtime

COPY app/ ./app/

# models/ dir — weights are downloaded from HuggingFace Hub at startup
# via HF_MODEL_REPO env var (see app/predict.py)
RUN mkdir -p models

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/.cache/huggingface

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
