"""
download_dataset.py
Downloads the UCI Chronic Kidney Disease CSV (kidney_disease.csv) from a
verified public GitHub mirror and saves it to data/raw/kidney_disease.csv.

Run from ml-api/ directory:
    python training/download_dataset.py

About the dataset:
- Source: UCI ML Repository #336 - Chronic Kidney Disease
- 400 patient records, 25 features, binary label (ckd / notckd)
- Originally collected at Apollo Hospitals, Karaikudi, India
- Ref: https://archive.ics.uci.edu/dataset/336/chronic+kidney+disease
"""
import sys, io, os, urllib.request
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR  = os.path.join(BASE_DIR, "..", "data", "raw")
OUT_CSV  = os.path.join(OUT_DIR, "kidney_disease.csv")

# Mirrors in priority order (verified working as of 2026-05)
MIRRORS = [
    "https://raw.githubusercontent.com/Mohamed2821/Chronic-Kidney-Disease-project/main/kidney_disease.csv",
    "https://raw.githubusercontent.com/Gladiator07/CKD-Prediction/main/data/kidney_disease.csv",
    "https://raw.githubusercontent.com/archd3sai/Chronic-Kidney-Disease-Classification/master/kidney_disease.csv",
]

MIN_SIZE_BYTES = 10_000  # anything smaller is likely an error page

def download():
    os.makedirs(OUT_DIR, exist_ok=True)

    if os.path.exists(OUT_CSV):
        size = os.path.getsize(OUT_CSV)
        if size >= MIN_SIZE_BYTES:
            print(f"Dataset already present: {OUT_CSV}  ({size:,} bytes)")
            return True
        else:
            print(f"Existing file too small ({size} bytes), re-downloading...")
            os.remove(OUT_CSV)

    print("Downloading UCI CKD dataset...")
    for i, url in enumerate(MIRRORS, 1):
        print(f"  [{i}/{len(MIRRORS)}] {url}")
        try:
            urllib.request.urlretrieve(url, OUT_CSV)
            size = os.path.getsize(OUT_CSV)
            if size < MIN_SIZE_BYTES:
                print(f"  File too small ({size} bytes), skipping.")
                os.remove(OUT_CSV)
                continue
            print(f"  Saved: {OUT_CSV}  ({size:,} bytes)")
            return True
        except Exception as e:
            print(f"  Failed: {e}")

    print("\nAll mirrors failed. Please download manually:")
    print("  Kaggle : https://www.kaggle.com/datasets/mansoordaku/ckdisease")
    print("  UCI    : https://archive.ics.uci.edu/dataset/336/chronic+kidney+disease")
    print(f"  Save to: {os.path.abspath(OUT_CSV)}")
    return False


if __name__ == "__main__":
    ok = download()
    sys.exit(0 if ok else 1)
