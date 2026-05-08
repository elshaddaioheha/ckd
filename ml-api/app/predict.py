import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from .schemas import CKDInput, PredictionResponse
from .clinical_text import build_clinical_text

# ─── Model Loading ────────────────────────────────────────────────────────────

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "ckd-distilbert")
model = None
tokenizer = None

def load_model():
    global model, tokenizer
    if os.path.exists(MODEL_PATH):
        try:
            print(f"Loading fine-tuned DistilBERT model from {MODEL_PATH}...")
            tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
            model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
            model.eval()
        except Exception as e:
            print(f"Error loading model: {e}. Falling back to mock prediction.")
    else:
        print(f"Model not found at {MODEL_PATH}. Using mock prediction logic.")

# Initialize on module load
load_model()

# ─── Prediction Logic ─────────────────────────────────────────────────────────

def run_prediction(data: CKDInput) -> PredictionResponse:
    # 1. Build the text prompt
    text_prompt = build_clinical_text(data)
    
    # 2. Inference
    if model and tokenizer:
        try:
            inputs = tokenizer(text_prompt, return_tensors="pt", truncation=True, padding=True)
            with torch.no_grad():
                outputs = model(**inputs)
                probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
                
                # Get the 'ckd' class (index 1)
                risk_probability = probabilities[0][1].item()
                prediction_idx = torch.argmax(probabilities, dim=-1).item()
                prediction = "ckd" if prediction_idx == 1 else "not_ckd"
        except Exception as e:
            print(f"Inference error: {e}")
            return mock_prediction(data, text_prompt)
    else:
        return mock_prediction(data, text_prompt)

    # 3. Determine risk level based on probability
    if risk_probability > 0.7:
        risk_level = "High"
    elif risk_probability > 0.3:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    return PredictionResponse(
        prediction=prediction,
        risk_probability=risk_probability,
        risk_level=risk_level,
        clinical_text=text_prompt
    )

def mock_prediction(data: CKDInput, text_prompt: str) -> PredictionResponse:
    """
    Fallback logic for when the model is not available.
    """
    # Simple heuristic based on Serum Creatinine (sc) and Blood Urea (bu)
    if data.sc > 1.2 or data.bu > 40 or data.hemo < 12:
        prediction = "ckd"
        risk_probability = 0.85 if data.sc > 2.0 else 0.65
        risk_level = "High" if risk_probability > 0.7 else "Moderate"
    else:
        prediction = "not_ckd"
        risk_probability = 0.12
        risk_level = "Low"
        
    return PredictionResponse(
        prediction=prediction,
        risk_probability=risk_probability,
        risk_level=risk_level,
        clinical_text=text_prompt
    )
