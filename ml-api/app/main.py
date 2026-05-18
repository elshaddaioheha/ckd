import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .schemas import CKDInput, PredictionResponse
from .predict import run_prediction
from .settings import settings

app = FastAPI(
    title=settings.app_name,
    description="FastAPI backend for predicting Chronic Kidney Disease risk from clinical text.",
    version="0.1.0"
)

# CORS — reads from env var ALLOWED_ORIGINS (comma-separated) or falls back to local dev defaults
_raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "app": settings.app_name,
        "status": "online",
        "version": "0.1.0"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictionResponse)
def predict(data: CKDInput):
    """
    Accepts clinical values, generates a text prompt, 
    and returns a risk prediction (currently mocked).
    """
    return run_prediction(data)
