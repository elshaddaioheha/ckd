"""
evaluate_model.py
Loads the saved ckd-distilbert model and runs a full evaluation on the test set.
Prints accuracy, F1, precision, recall, and a confusion matrix.

Run from ml-api/ directory:
    python training/evaluate_model.py
"""
import sys, io, os, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import torch
import numpy as np
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score,
    recall_score, confusion_matrix, classification_report
)

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "ckd-distilbert")
TEST_CSV   = os.path.join(BASE_DIR, "..", "data", "processed", "test.csv")
RESULTS_PATH = os.path.join(BASE_DIR, "..", "models", "eval_results.json")

def evaluate():
    # Guard checks
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model not found at {MODEL_PATH}")
        print("Run:  python training/train_distilbert.py  first.")
        sys.exit(1)

    if not os.path.exists(TEST_CSV):
        print(f"ERROR: Test CSV not found at {TEST_CSV}")
        print("Run:  python training/prepare_dataset.py  first.")
        sys.exit(1)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print("=" * 60)
    print("  CKD DistilBERT - Model Evaluation")
    print("=" * 60)
    print(f"  Model  : {os.path.abspath(MODEL_PATH)}")
    print(f"  Device : {device}")
    print("=" * 60)

    # Load model and tokenizer
    print("\nLoading model and tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.to(device)
    model.eval()

    # Load test data
    print("Loading test data...")
    df = pd.read_csv(TEST_CSV)
    texts  = df["text"].tolist()
    labels = df["label"].tolist()
    print(f"  Test samples: {len(texts)}")

    # Run inference in batches
    BATCH = 16
    all_preds = []
    all_probs = []

    print("Running inference...")
    for i in range(0, len(texts), BATCH):
        batch_texts = texts[i:i+BATCH]
        inputs = tokenizer(
            batch_texts, truncation=True, padding=True,
            max_length=512, return_tensors="pt"
        ).to(device)

        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            preds = torch.argmax(probs, dim=-1)

        all_preds.extend(preds.cpu().tolist())
        all_probs.extend(probs[:, 1].cpu().tolist())  # P(ckd)

    labels_arr = np.array(labels)
    preds_arr  = np.array(all_preds)

    # Compute metrics
    acc  = accuracy_score(labels_arr, preds_arr)
    f1   = f1_score(labels_arr, preds_arr)
    prec = precision_score(labels_arr, preds_arr)
    rec  = recall_score(labels_arr, preds_arr)
    cm   = confusion_matrix(labels_arr, preds_arr)

    print("\n--- Results ---")
    print(f"  Accuracy : {acc:.4f}  ({acc*100:.1f}%)")
    print(f"  F1 Score : {f1:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall   : {rec:.4f}")

    print("\nConfusion Matrix:")
    print(f"               Predicted")
    print(f"               not_ckd   ckd")
    print(f"  Actual not_ckd  {cm[0][0]:>5}   {cm[0][1]:>5}")
    print(f"  Actual ckd      {cm[1][0]:>5}   {cm[1][1]:>5}")

    print("\nClassification Report:")
    print(classification_report(labels_arr, preds_arr, target_names=["not_ckd", "ckd"]))

    # Save results to JSON
    results = {
        "accuracy":  round(acc,  4),
        "f1_score":  round(f1,   4),
        "precision": round(prec, 4),
        "recall":    round(rec,  4),
        "confusion_matrix": cm.tolist(),
        "n_test_samples": len(labels),
    }
    with open(RESULTS_PATH, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to: {os.path.abspath(RESULTS_PATH)}")

if __name__ == "__main__":
    evaluate()
