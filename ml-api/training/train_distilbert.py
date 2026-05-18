"""
train_distilbert.py  (fixed + enhanced)
Fine-tunes distilbert-base-uncased on the processed CKD dataset.

Run from ml-api/ directory:
    python training/train_distilbert.py

The best model is saved to:  models/ckd-distilbert/
"""
import sys, io, os, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import torch
import numpy as np
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
    EarlyStoppingCallback,
)
import evaluate as ev

# ── Configuration ─────────────────────────────────────────────────────────────
MODEL_NAME = "distilbert-base-uncased"

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DATA_DIR    = os.path.join(BASE_DIR, "..", "data", "processed")
OUTPUT_DIR  = os.path.join(BASE_DIR, "..", "models", "ckd-distilbert")
LOGGING_DIR = os.path.join(BASE_DIR, "..", "logs")

# Detect device
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# CPU-aware batch size: smaller batches on CPU to avoid OOM
BATCH_SIZE = 8 if DEVICE == "cpu" else 16

# Fewer epochs on CPU for reasonable runtime; more on GPU for best accuracy
NUM_EPOCHS = 3 if DEVICE == "cpu" else 5

# ── Labels ────────────────────────────────────────────────────────────────────
ID2LABEL = {0: "not_ckd", 1: "ckd"}
LABEL2ID = {"not_ckd": 0, "ckd": 1}

# ── Metrics ───────────────────────────────────────────────────────────────────
accuracy_metric = ev.load("accuracy")
f1_metric       = ev.load("f1")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=1)
    acc = accuracy_metric.compute(predictions=predictions, references=labels)
    f1  = f1_metric.compute(predictions=predictions, references=labels, average="binary")
    return {**acc, **f1}

# ── Main ──────────────────────────────────────────────────────────────────────
def train():
    train_csv = os.path.join(DATA_DIR, "train.csv")
    test_csv  = os.path.join(DATA_DIR, "test.csv")

    if not os.path.exists(train_csv):
        print(f"ERROR: Processed data not found at {train_csv}")
        print("Run:  python training/prepare_dataset.py  first.")
        sys.exit(1)

    print("=" * 60)
    print("  CKD DistilBERT Fine-tuning")
    print("=" * 60)
    print(f"  Device     : {DEVICE.upper()}")
    print(f"  Batch size : {BATCH_SIZE}")
    print(f"  Epochs     : {NUM_EPOCHS}")
    print(f"  Output     : {os.path.abspath(OUTPUT_DIR)}")
    print("=" * 60)

    # 1. Load Dataset
    print("\n[1/6] Loading processed dataset...")
    dataset = load_dataset("csv", data_files={
        "train": train_csv,
        "test":  test_csv,
    })
    print(f"  Train samples: {len(dataset['train'])}")
    print(f"  Test  samples: {len(dataset['test'])}")

    # 2. Tokenizer
    print(f"\n[2/6] Loading tokenizer: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    def preprocess(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            max_length=512,
            padding=False,  # DataCollatorWithPadding handles dynamic padding
        )

    print("[3/6] Tokenizing dataset...")
    tokenized = dataset.map(preprocess, batched=True, remove_columns=["text"])

    # 3. Model
    print(f"\n[4/6] Initializing model: {MODEL_NAME}")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=2,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )

    # 4. Training Arguments
    # NOTE: transformers >= 4.46 renamed 'evaluation_strategy' -> 'eval_strategy'
    print("\n[5/6] Configuring training arguments...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(LOGGING_DIR, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        # -- eval & save
        eval_strategy="epoch",          # fixed: was 'evaluation_strategy' (deprecated)
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        # -- optimisation
        learning_rate=2e-5,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        num_train_epochs=NUM_EPOCHS,
        weight_decay=0.01,
        # warmup_ratio deprecated in 5.2 -> use warmup_steps
        # 10% of total steps = (320/8) * 3 * 0.1 = 12 steps
        warmup_steps=12,
        # -- logging
        logging_steps=10,
        report_to="none",               # no wandb / hub
        # -- misc
        push_to_hub=False,
        seed=42,
        dataloader_num_workers=0,       # safest on Windows
        fp16=False,                     # CPU doesn't support fp16
        # no_cuda removed in transformers 5.x; Trainer auto-detects CPU
    )

    # 5. Trainer
    print("\n[6/6] Starting fine-tuning...")
    t0 = time.time()

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["test"],
        processing_class=tokenizer,     # replaces deprecated 'tokenizer' in transformers 5.x
        data_collator=DataCollatorWithPadding(tokenizer=tokenizer),
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
    )

    trainer.train()

    elapsed = time.time() - t0
    print(f"\nTraining complete in {elapsed/60:.1f} minutes.")

    # 6. Save best model
    print(f"\nSaving best model to: {os.path.abspath(OUTPUT_DIR)}")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    # 7. Final evaluation
    print("\nFinal evaluation on test set:")
    results = trainer.evaluate()
    for k, v in results.items():
        if isinstance(v, float):
            print(f"  {k:<30}: {v:.4f}")
        else:
            print(f"  {k:<30}: {v}")

    print("\nDone! Model ready at:", os.path.abspath(OUTPUT_DIR))

if __name__ == "__main__":
    train()
