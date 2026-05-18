"""
prepare_dataset.py  (rewritten)
Loads the UCI CKD CSV, cleans it, converts each row to a clinical text prompt
(matching app/clinical_text.py), and saves train/test CSVs to data/processed/.

Run from ml-api/ directory:
    python -m training.prepare_dataset
    -- or --
    python training/prepare_dataset.py
"""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import pandas as pd
from sklearn.model_selection import train_test_split

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
INPUT_CSV  = os.path.join(BASE_DIR, "..", "data", "raw",  "kidney_disease.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "..", "data", "processed")

# ── Clinical text builder (mirrors app/clinical_text.py) ──────────────────────
def num_str(val, unit=""):
    if pd.isna(val):
        return "unknown"
    try:
        v = float(val)
        val_str = str(int(v)) if v == int(v) else str(round(v, 4))
        return f"{val_str} {unit}".strip() if unit else val_str
    except (ValueError, TypeError):
        return "unknown"

def build_clinical_text(row):
    sentences = [
        f"Patient is {num_str(row.get('age'))} years old.",
        f"Blood pressure is {num_str(row.get('bp'), 'mmHg')}.",
        f"Specific gravity is {num_str(row.get('sg'))}.",
        f"Albumin is {num_str(row.get('al'))}.",
        f"Sugar is {num_str(row.get('su'))}.",
        f"Blood glucose random is {num_str(row.get('bgr'), 'mg/dL')}.",
        f"Blood urea is {num_str(row.get('bu'), 'mg/dL')}.",
        f"Serum creatinine is {num_str(row.get('sc'), 'mg/dL')}.",
        f"Sodium is {num_str(row.get('sod'), 'mEq/L')}.",
        f"Potassium is {num_str(row.get('pot'), 'mEq/L')}.",
        f"Haemoglobin is {num_str(row.get('hemo'), 'g/dL')}.",
        f"Packed cell volume is {num_str(row.get('pcv'), '%')}.",
        f"White blood cell count is {num_str(row.get('wc'), 'cells/cumm')}.",
        f"Red blood cell count is {num_str(row.get('rc'), 'millions/cmm')}.",
        f"Hypertension is {str(row.get('htn', 'unknown')).strip()}.",
        f"Diabetes mellitus is {str(row.get('dm', 'unknown')).strip()}.",
        f"Coronary artery disease is {str(row.get('cad', 'unknown')).strip()}.",
        f"Appetite is {str(row.get('appet', 'unknown')).strip()}.",
        f"Pedal oedema is {str(row.get('pe', 'unknown')).strip()}.",
        f"Anaemia is {str(row.get('ane', 'unknown')).strip()}.",
    ]
    return " ".join(sentences)

# ── Cleaning ──────────────────────────────────────────────────────────────────
def clean_df(df: pd.DataFrame) -> pd.DataFrame:
    # Strip whitespace from all string columns
    str_cols = df.select_dtypes(include="object").columns
    df[str_cols] = df[str_cols].apply(lambda c: c.str.strip())

    # Replace common missing-value markers
    df = df.replace({"?": pd.NA, "\t": pd.NA, "": pd.NA})

    # Normalize label column
    if "classification" in df.columns:
        df["classification"] = df["classification"].str.lower().str.strip()
        # UCI uses 'ckd\t' sometimes
        df["classification"] = df["classification"].str.replace(r"\t", "", regex=True)
        df["label"] = df["classification"].map({"ckd": 1, "notckd": 0})
    elif "label" in df.columns:
        pass  # already present
    else:
        raise ValueError("Could not find 'classification' or 'label' column in CSV.")

    return df

# ── Main ──────────────────────────────────────────────────────────────────────
def prepare_data(input_csv=INPUT_CSV, output_dir=OUTPUT_DIR):
    if not os.path.exists(input_csv):
        print(f"ERROR: Dataset not found at {input_csv}")
        print("Run:  python training/download_dataset.py  first.")
        sys.exit(1)

    print(f"Loading: {input_csv}")
    df = pd.read_csv(input_csv)
    print(f"  Raw rows: {len(df)}  |  columns: {list(df.columns)}")

    df = clean_df(df)

    missing_labels = df["label"].isna().sum()
    if missing_labels:
        print(f"  Dropping {missing_labels} rows with unrecognised label values.")
    df = df.dropna(subset=["label"])
    df["label"] = df["label"].astype(int)

    print(f"  Usable rows: {len(df)}")
    print(f"  Class distribution:\n{df['label'].value_counts().to_string()}")

    print("Generating clinical text prompts...")
    df["text"] = df.apply(build_clinical_text, axis=1)

    # Validate text generation
    empty_texts = (df["text"].str.strip() == "").sum()
    if empty_texts:
        print(f"  WARNING: {empty_texts} empty text prompts generated.")

    processed = df[["text", "label"]].copy()

    train_df, test_df = train_test_split(
        processed, test_size=0.2, random_state=42, stratify=processed["label"]
    )

    os.makedirs(output_dir, exist_ok=True)
    train_path = os.path.join(output_dir, "train.csv")
    test_path  = os.path.join(output_dir, "test.csv")
    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

    print(f"\nProcessed dataset saved:")
    print(f"  Train : {train_path}  ({len(train_df)} samples)")
    print(f"  Test  : {test_path}  ({len(test_df)} samples)")
    print("\nSample text prompt:")
    print(f"  {train_df.iloc[0]['text'][:200]}...")

if __name__ == "__main__":
    prepare_data()
