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

# Allow CORS for local frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
