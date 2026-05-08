import pandas as pd
from sklearn.model_selection import train_test_split
import os

def build_clinical_text(row):
    """
    Converts a row of the UCI CKD dataset into a clinical summary string.
    Matches the logic in ml-api/app/clinical_text.py and frontend/src/lib/clinicalText.ts
    """
    def num_str(val, unit=""):
        if pd.isna(val):
            return "unknown"
        # Check if it's float or int
        try:
            v = float(val)
            val_str = f"{int(v)}" if v.is_integer() else f"{v}"
            return f"{val_str} {unit}".strip() if unit else val_str
        except:
            return "unknown"

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
        f"Hypertension is {row.get('htn', 'unknown')}.",
        f"Diabetes mellitus is {row.get('dm', 'unknown')}.",
        f"Coronary artery disease is {row.get('cad', 'unknown')}.",
        f"Appetite is {row.get('appet', 'unknown')}.",
        f"Pedal oedema is {row.get('pe', 'unknown')}.",
        f"Anaemia is {row.get('ane', 'unknown')}."
    ]
    return " ".join(sentences)

def prepare_data(input_csv="data/kidney_disease.csv", output_dir="data/processed"):
    if not os.path.exists(input_csv):
        print(f"Error: {input_csv} not found. Please place the UCI CKD dataset at this location.")
        return

    print(f"Loading dataset from {input_csv}...")
    df = pd.read_csv(input_csv)

    # Basic cleaning
    # UCI dataset often has trailing spaces or '?' for missing values
    df = df.replace('\t', '', regex=True).replace('?', pd.NA)
    
    # Map class to binary labels
    # 'ckd' -> 1, 'notckd' -> 0
    df['classification'] = df['classification'].str.strip().str.lower()
    df['label'] = df['classification'].map({'ckd': 1, 'notckd': 0})
    
    # Generate clinical text
    print("Generating clinical text prompts...")
    df['text'] = df.apply(build_clinical_text, axis=1)
    
    # Keep only text and label
    processed_df = df[['text', 'label']].dropna()
    
    # Split
    train_df, test_df = train_test_split(processed_df, test_size=0.2, random_state=42, stratify=processed_df['label'])
    
    os.makedirs(output_dir, exist_ok=True)
    train_df.to_csv(os.path.join(output_dir, "train.csv"), index=False)
    test_df.to_csv(os.path.join(output_dir, "test.csv"), index=False)
    
    print(f"Processed dataset saved to {output_dir}")
    print(f"Total samples: {len(processed_df)} (Train: {len(train_df)}, Test: {len(test_df)})")

if __name__ == "__main__":
    prepare_data()
