import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from .schemas import CKDInput, PredictionResponse
from .clinical_text import build_clinical_text

# ─── Model Loading ────────────────────────────────────────────────────────────

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "ckd-distilbert")
# Cloud deployment: set HF_MODEL_REPO=yourname/ckd-distilbert to load from HuggingFace Hub
HF_MODEL_REPO = os.environ.get("HF_MODEL_REPO", "")

model = None
tokenizer = None

def load_model():
    global model, tokenizer
    source = None

    if os.path.exists(MODEL_PATH) and os.path.exists(os.path.join(MODEL_PATH, "model.safetensors")):
        source = MODEL_PATH
        print(f"Loading fine-tuned DistilBERT model from {MODEL_PATH}...")
    elif HF_MODEL_REPO:
        source = HF_MODEL_REPO
        print(f"Loading fine-tuned DistilBERT model from HuggingFace Hub: {HF_MODEL_REPO}...")
    else:
        print("No model found locally and HF_MODEL_REPO not set. Using mock prediction logic.")
        return

    try:
        tokenizer = AutoTokenizer.from_pretrained(source)
        model = AutoModelForSequenceClassification.from_pretrained(source)
        model.eval()
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}. Falling back to mock prediction.")

# Initialize on module load
load_model()

# ─── Clinical Reasoning Engine ────────────────────────────────────────────────

# Each rule: (field_value_fn, condition_fn, finding_string, is_risk_flag)
# is_risk_flag=True means this finding supports CKD risk
# is_risk_flag=False means this finding is protective / normal

def generate_reasoning(data: CKDInput, prediction: str, risk_probability: float) -> tuple[list[str], str]:
    """
    Analyses the clinical input values against established normal ranges and
    returns a list of key findings and a narrative reasoning string.
    """
    risk_findings = []    # abnormal values supporting CKD risk
    normal_findings = []  # values within normal range

    # ── Renal Function ──────────────────────────────────────────────────────
    if data.sc > 1.2:
        severity = "severely" if data.sc > 2.0 else "moderately" if data.sc > 1.5 else "mildly"
        risk_findings.append(
            f"Elevated serum creatinine ({data.sc} mg/dL) — {severity} above the normal range (0.6–1.2 mg/dL), "
            f"indicating reduced kidney filtration capacity."
        )
    else:
        normal_findings.append(f"Serum creatinine within normal range ({data.sc} mg/dL).")

    if data.bu > 25:
        severity = "severely" if data.bu > 60 else "moderately" if data.bu > 40 else "mildly"
        risk_findings.append(
            f"Elevated blood urea ({data.bu} mg/dL) — {severity} above the normal range (7–25 mg/dL), "
            f"suggesting impaired renal waste clearance."
        )
    else:
        normal_findings.append(f"Blood urea within normal range ({data.bu} mg/dL).")

    # ── Urine Analysis ──────────────────────────────────────────────────────
    if data.al > 0:
        level = {1: "trace", 2: "mild", 3: "moderate", 4: "heavy", 5: "severe"}.get(int(data.al), "elevated")
        risk_findings.append(
            f"Proteinuria detected (albumin level: {int(data.al)}/5) — {level} protein leakage in urine, "
            f"a hallmark indicator of glomerular damage."
        )
    else:
        normal_findings.append("No proteinuria detected (albumin: 0).")

    if data.su > 0:
        risk_findings.append(
            f"Glycosuria present (sugar level: {int(data.su)}/5) — glucose in urine can indicate "
            f"diabetic nephropathy or tubular dysfunction."
        )

    if data.sg < 1.010:
        risk_findings.append(
            f"Low urine specific gravity ({data.sg}) — below 1.010 indicates reduced kidney concentration "
            f"ability, consistent with tubular damage."
        )
    elif data.sg > 1.025:
        risk_findings.append(
            f"High urine specific gravity ({data.sg}) — may indicate dehydration or early renal stress."
        )
    else:
        normal_findings.append(f"Urine specific gravity within normal range ({data.sg}).")

    # ── Blood Count / Haematology ───────────────────────────────────────────
    if data.hemo < 12.0:
        severity = "severe" if data.hemo < 8.0 else "moderate" if data.hemo < 10.0 else "mild"
        risk_findings.append(
            f"Low haemoglobin ({data.hemo} g/dL) — {severity} anaemia, a common complication of CKD "
            f"due to reduced erythropoietin production by damaged kidneys."
        )
    else:
        normal_findings.append(f"Haemoglobin within acceptable range ({data.hemo} g/dL).")

    if data.pcv < 36:
        risk_findings.append(
            f"Low packed cell volume ({data.pcv}%) — reduced haematocrit consistent with CKD-related anaemia."
        )

    if data.rc < 3.5:
        risk_findings.append(
            f"Low red blood cell count ({data.rc} million/cmm) — supports diagnosis of renal anaemia."
        )

    # ── Electrolytes ────────────────────────────────────────────────────────
    if data.pot > 5.0:
        severity = "dangerously" if data.pot > 6.0 else "mildly"
        risk_findings.append(
            f"Elevated potassium ({data.pot} mEq/L) — {severity} above normal (3.5–5.0 mEq/L). "
            f"Hyperkalaemia is a serious complication of reduced kidney excretion."
        )
    elif data.pot < 3.5:
        risk_findings.append(
            f"Low potassium ({data.pot} mEq/L) — hypokalaemia can indicate tubular disorders."
        )
    else:
        normal_findings.append(f"Potassium within normal range ({data.pot} mEq/L).")

    if data.sod < 136:
        risk_findings.append(
            f"Low sodium ({data.sod} mEq/L) — hyponatraemia may reflect fluid retention or impaired "
            f"renal regulation, common in advanced CKD."
        )
    elif data.sod > 145:
        risk_findings.append(
            f"Elevated sodium ({data.sod} mEq/L) — hypernatraemia may indicate impaired fluid balance."
        )
    else:
        normal_findings.append(f"Sodium within normal range ({data.sod} mEq/L).")

    # ── Blood Pressure ──────────────────────────────────────────────────────
    if data.bp >= 90:
        risk_findings.append(
            f"Elevated blood pressure ({data.bp} mmHg diastolic) — hypertension is both a cause and "
            f"a consequence of CKD, accelerating kidney damage."
        )

    # ── Blood Glucose ───────────────────────────────────────────────────────
    if data.bgr >= 140:
        severity = "severely" if data.bgr > 200 else "mildly"
        risk_findings.append(
            f"Elevated blood glucose ({data.bgr} mg/dL) — {severity} above normal (<140 mg/dL). "
            f"Uncontrolled blood sugar is a leading cause of diabetic nephropathy."
        )
    else:
        normal_findings.append(f"Blood glucose within acceptable range ({data.bgr} mg/dL).")

    # ── Comorbidities ───────────────────────────────────────────────────────
    if data.htn == "yes":
        risk_findings.append(
            "Hypertension confirmed — a major independent risk factor for CKD progression."
        )
    if data.dm == "yes":
        risk_findings.append(
            "Diabetes mellitus confirmed — the most common cause of CKD worldwide."
        )
    if data.cad == "yes":
        risk_findings.append(
            "Coronary artery disease present — cardiovascular-renal syndrome increases CKD risk."
        )

    # ── Symptoms ────────────────────────────────────────────────────────────
    if data.pe == "yes":
        risk_findings.append(
            "Pedal oedema present — ankle/foot swelling is a clinical sign of fluid retention "
            "associated with reduced kidney function."
        )
    if data.ane == "yes":
        risk_findings.append(
            "Anaemia confirmed — kidney disease impairs erythropoietin synthesis, causing anaemia."
        )
    if data.appet == "poor":
        risk_findings.append(
            "Poor appetite reported — uraemia and metabolic changes in CKD commonly suppress appetite."
        )

    # ── Compose Narrative ───────────────────────────────────────────────────
    prob_pct = round(risk_probability * 100, 1)

    if prediction == "ckd":
        n = len(risk_findings)
        intro = (
            f"The AI model assigned a {prob_pct}% CKD risk probability based on {n} clinically "
            f"significant abnormal finding{'s' if n != 1 else ''}. "
        )
        if n >= 5:
            intro += (
                "Multiple critical markers across renal function, haematology, and electrolytes are "
                "outside normal ranges, forming a pattern strongly consistent with CKD. "
            )
        elif n >= 2:
            intro += (
                "Several markers are outside normal ranges, collectively pointing toward compromised kidney function. "
            )
        else:
            intro += "While findings are limited, the identified marker(s) warrant clinical follow-up. "

        if normal_findings:
            intro += (
                f"{len(normal_findings)} parameter(s) remain within normal limits, which may moderate overall severity."
            )
    else:
        n_risk = len(risk_findings)
        n_normal = len(normal_findings)
        intro = (
            f"The AI model assigned a {prob_pct}% CKD risk probability. "
            f"The majority of laboratory values ({n_normal} parameter(s)) are within normal ranges. "
        )
        if n_risk > 0:
            intro += (
                f"However, {n_risk} finding(s) were noted as borderline or slightly abnormal — "
                f"continued monitoring is recommended, particularly for patients with underlying risk factors."
            )
        else:
            intro += "No significant clinical abnormalities were identified."

    return risk_findings, intro


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

                risk_probability = probabilities[0][1].item()
                prediction_idx = torch.argmax(probabilities, dim=-1).item()
                prediction = "ckd" if prediction_idx == 1 else "not_ckd"
        except Exception as e:
            print(f"Inference error: {e}")
            return mock_prediction(data, text_prompt)
    else:
        return mock_prediction(data, text_prompt)

    # 3. Risk level
    if risk_probability > 0.7:
        risk_level = "High"
    elif risk_probability > 0.3:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    # 4. Reasoning
    key_findings, reasoning = generate_reasoning(data, prediction, risk_probability)

    return PredictionResponse(
        prediction=prediction,
        risk_probability=risk_probability,
        risk_level=risk_level,
        clinical_text=text_prompt,
        key_findings=key_findings,
        reasoning=reasoning,
    )


def mock_prediction(data: CKDInput, text_prompt: str) -> PredictionResponse:
    """Fallback logic for when the model is not available."""
    if data.sc > 1.2 or data.bu > 40 or data.hemo < 12:
        prediction = "ckd"
        risk_probability = 0.85 if data.sc > 2.0 else 0.65
        risk_level = "High" if risk_probability > 0.7 else "Moderate"
    else:
        prediction = "not_ckd"
        risk_probability = 0.12
        risk_level = "Low"

    key_findings, reasoning = generate_reasoning(data, prediction, risk_probability)

    return PredictionResponse(
        prediction=prediction,
        risk_probability=risk_probability,
        risk_level=risk_level,
        clinical_text=text_prompt,
        key_findings=key_findings,
        reasoning=reasoning,
    )
