"""
compare_baselines.py
Trains classical ML baselines (Logistic Regression, Random Forest, SVM)
on TF-IDF features from the clinical text, then compares them against
the fine-tuned DistilBERT model.

Run from ml-api/ directory:
    python training/compare_baselines.py
"""
import sys, io, os, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score
)
from sklearn.pipeline import Pipeline

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
TRAIN_CSV     = os.path.join(BASE_DIR, "..", "data", "processed", "train.csv")
TEST_CSV      = os.path.join(BASE_DIR, "..", "data", "processed", "test.csv")
DISTILBERT_RESULTS = os.path.join(BASE_DIR, "..", "models", "eval_results.json")

# ── Helpers ───────────────────────────────────────────────────────────────────
def build_pipeline(classifier):
    return Pipeline([
        ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
        ("clf",   classifier),
    ])

def evaluate_model(name, pipeline, X_train, y_train, X_test, y_test):
    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)
    return {
        "model":     name,
        "accuracy":  round(accuracy_score(y_test, preds),  4),
        "f1_score":  round(f1_score(y_test, preds),        4),
        "precision": round(precision_score(y_test, preds), 4),
        "recall":    round(recall_score(y_test, preds),    4),
    }

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    for path, label in [(TRAIN_CSV, "Train CSV"), (TEST_CSV, "Test CSV")]:
        if not os.path.exists(path):
            print(f"ERROR: {label} not found at {path}")
            print("Run:  python training/prepare_dataset.py  first.")
            sys.exit(1)

    print("=" * 62)
    print("  CKD Baseline Comparison")
    print("=" * 62)

    train_df = pd.read_csv(TRAIN_CSV)
    test_df  = pd.read_csv(TEST_CSV)

    X_train, y_train = train_df["text"].tolist(), train_df["label"].tolist()
    X_test,  y_test  = test_df["text"].tolist(),  test_df["label"].tolist()

    print(f"  Train: {len(X_train)} samples  |  Test: {len(X_test)} samples\n")

    baselines = [
        ("Logistic Regression",
         build_pipeline(LogisticRegression(max_iter=1000, C=1.0))),
        ("Random Forest",
         build_pipeline(RandomForestClassifier(n_estimators=200, random_state=42))),
        ("Linear SVM",
         build_pipeline(LinearSVC(max_iter=2000, C=1.0))),
    ]

    results = []
    for name, pipeline in baselines:
        print(f"Training {name}...")
        r = evaluate_model(name, pipeline, X_train, y_train, X_test, y_test)
        results.append(r)
        print(f"  Accuracy={r['accuracy']:.4f}  F1={r['f1_score']:.4f}  "
              f"Precision={r['precision']:.4f}  Recall={r['recall']:.4f}")

    # Load DistilBERT results if available
    distilbert_row = None
    if os.path.exists(DISTILBERT_RESULTS):
        with open(DISTILBERT_RESULTS) as f:
            db = json.load(f)
        distilbert_row = {
            "model":     "DistilBERT (fine-tuned)",
            "accuracy":  db.get("accuracy",  "N/A"),
            "f1_score":  db.get("f1_score",  "N/A"),
            "precision": db.get("precision", "N/A"),
            "recall":    db.get("recall",    "N/A"),
        }
        results.append(distilbert_row)
    else:
        print("\nNote: DistilBERT results not found. Run evaluate.py after training.")

    # Print comparison table
    print("\n" + "=" * 62)
    print(f"  {'Model':<28} {'Acc':>6} {'F1':>6} {'Prec':>6} {'Rec':>6}")
    print("  " + "-" * 58)
    for r in results:
        acc  = f"{r['accuracy']:.4f}"  if isinstance(r['accuracy'],  float) else str(r['accuracy'])
        f1   = f"{r['f1_score']:.4f}"  if isinstance(r['f1_score'],  float) else str(r['f1_score'])
        prec = f"{r['precision']:.4f}" if isinstance(r['precision'], float) else str(r['precision'])
        rec  = f"{r['recall']:.4f}"    if isinstance(r['recall'],    float) else str(r['recall'])
        marker = " <--" if "DistilBERT" in r["model"] else ""
        print(f"  {r['model']:<28} {acc:>6} {f1:>6} {prec:>6} {rec:>6}{marker}")
    print("=" * 62)

    # Save comparison
    out_path = os.path.join(BASE_DIR, "..", "models", "baseline_comparison.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nComparison saved to: {os.path.abspath(out_path)}")

if __name__ == "__main__":
    main()
