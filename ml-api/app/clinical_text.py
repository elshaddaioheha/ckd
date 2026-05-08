from .schemas import CKDInput

def build_clinical_text(data: CKDInput) -> str:
    """
    Converts CKD input values into a clinical summary string.
    This mirrors the frontend logic and produces the text prompt for DistilBERT.
    """
    def num_str(val, unit=""):
        if val is None:
            return "unknown"
        val_str = f"{int(val)}" if val.is_integer() else f"{val}"
        return f"{val_str} {unit}".strip() if unit else val_str

    sentences = [
        f"Patient is {num_str(data.age)} years old.",
        f"Blood pressure is {num_str(data.bp, 'mmHg')}.",
        f"Specific gravity is {num_str(data.sg)}.",
        f"Albumin is {num_str(data.al)}.",
        f"Sugar is {num_str(data.su)}.",
        f"Blood glucose random is {num_str(data.bgr, 'mg/dL')}.",
        f"Blood urea is {num_str(data.bu, 'mg/dL')}.",
        f"Serum creatinine is {num_str(data.sc, 'mg/dL')}.",
        f"Sodium is {num_str(data.sod, 'mEq/L')}.",
        f"Potassium is {num_str(data.pot, 'mEq/L')}.",
        f"Haemoglobin is {num_str(data.hemo, 'g/dL')}.",
        f"Packed cell volume is {num_str(data.pcv, '%')}.",
        f"White blood cell count is {num_str(data.wc, 'cells/cumm')}.",
        f"Red blood cell count is {num_str(data.rc, 'millions/cmm')}.",
        f"Hypertension is {data.htn}.",
        f"Diabetes mellitus is {data.dm}.",
        f"Coronary artery disease is {data.cad}.",
        f"Appetite is {data.appet}.",
        f"Pedal oedema is {data.pe}.",
        f"Anaemia is {data.ane}."
    ]
    return " ".join(sentences)
