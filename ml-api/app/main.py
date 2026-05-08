"""
CKD AI Risk Screener — ML API entry point.
Placeholder — full implementation pending.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CKD AI Risk Screener API",
    description="Predict Chronic Kidney Disease risk from clinical input features using DistilBERT.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "CKD AI Risk Screener API is running."}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}


# TODO: Register routers
# from app.routers import predict
# app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
