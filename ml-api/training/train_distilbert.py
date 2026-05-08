import os
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding
)
import numpy as np
import evaluate

# ─── Configuration ───────────────────────────────────────────────────────────

MODEL_NAME = "distilbert-base-uncased"
DATA_DIR = "data/processed"
OUTPUT_DIR = "../models/ckd-distilbert"
LOGGING_DIR = "./logs"

# ─── Training ────────────────────────────────────────────────────────────────

def train():
    if not os.path.exists(os.path.join(DATA_DIR, "train.csv")):
        print(f"Error: Processed data not found in {DATA_DIR}. Run prepare_dataset.py first.")
        return

    # 1. Load Dataset
    print("Loading processed dataset...")
    dataset = load_dataset("csv", data_files={
        "train": os.path.join(DATA_DIR, "train.csv"),
        "test": os.path.join(DATA_DIR, "test.csv")
    })

    # 2. Tokenize
    print(f"Loading tokenizer: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

    def preprocess_function(examples):
        return tokenizer(examples["text"], truncation=True, padding=True)

    print("Tokenizing dataset...")
    tokenized_dataset = dataset.map(preprocess_function, batched=True)

    # 3. Model
    print(f"Initializing model: {MODEL_NAME}")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=2, id2label={0: "not_ckd", 1: "ckd"}, label2id={"not_ckd": 0, "ckd": 1}
    )

    # 4. Metrics
    accuracy = evaluate.load("accuracy")
    f1 = evaluate.load("f1")

    def compute_metrics(eval_pred):
        predictions, labels = eval_pred
        predictions = np.argmax(predictions, axis=1)
        acc = accuracy.compute(predictions=predictions, references=labels)
        f1_score = f1.compute(predictions=predictions, references=labels)
        return {**acc, **f1_score}

    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        learning_rate=2e-5,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        num_train_epochs=5,
        weight_decay=0.01,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        logging_dir=LOGGING_DIR,
        logging_steps=10,
        push_to_hub=False,
    )

    # 6. Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["test"],
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer=tokenizer),
        compute_metrics=compute_metrics,
    )

    # 7. Start Training
    print("Starting fine-tuning...")
    trainer.train()

    # 8. Save
    print(f"Saving best model to {OUTPUT_DIR}")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("Done!")

if __name__ == "__main__":
    train()
