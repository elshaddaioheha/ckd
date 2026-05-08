from pydantic import BaseModel
from typing import Literal

class CKDInput(BaseModel):
    age: float
    bp: float
    sg: float
    al: float
    su: float
    bgr: float
    bu: float
    sc: float
    sod: float
    pot: float
    hemo: float
    pcv: float
    wc: float
    rc: float
    htn: Literal["yes", "no"]
    dm: Literal["yes", "no"]
    cad: Literal["yes", "no"]
    appet: Literal["good", "poor"]
    pe: Literal["yes", "no"]
    ane: Literal["yes", "no"]

class PredictionResponse(BaseModel):
    prediction: Literal["ckd", "not_ckd"]
    risk_probability: float
    risk_level: Literal["Low", "Moderate", "High"]
    clinical_text: str
    disclaimer: str = "This is an AI-generated risk estimate for educational purposes only. It is not a medical diagnosis."
