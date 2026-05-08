from .schemas import CKDInput, PredictionResponse
from .clinical_text import build_clinical_text

def run_prediction(data: CKDInput) -> PredictionResponse:
    # 1. Build the text prompt
    text_prompt = build_clinical_text(data)
    
    # 2. Mock prediction (until DistilBERT is loaded)
    if data.sc > 1.2 or data.bu > 40:
        prediction = "ckd"
        risk_probability = 0.85
        risk_level = "High"
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
