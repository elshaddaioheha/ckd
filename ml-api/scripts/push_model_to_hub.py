"""
push_model_to_hub.py
Uploads the fine-tuned ckd-distilbert model to your Hugging Face Hub repo
so it can be pulled down at deploy time.

Usage (run once locally after training):
    pip install huggingface_hub
    huggingface-cli login
    python scripts/push_model_to_hub.py --repo YOUR_HF_USERNAME/ckd-distilbert
"""
import argparse, os, sys

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True,
                        help="HuggingFace repo id, e.g. Oheha/ckd-distilbert")
    parser.add_argument("--token", default=None,
                        help="HuggingFace write token (from huggingface.co/settings/tokens). "
                             "Falls back to HF_TOKEN env var or cached login.")
    args = parser.parse_args()
    token = args.token or os.environ.get("HF_TOKEN")

    try:
        from huggingface_hub import HfApi
    except ImportError:
        print("ERROR: huggingface_hub not installed. Run: pip install huggingface_hub")
        sys.exit(1)

    MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "ckd-distilbert")
    if not os.path.exists(os.path.join(MODEL_DIR, "model.safetensors")):
        print(f"ERROR: Model not found at {MODEL_DIR}. Train the model first.")
        sys.exit(1)

    api = HfApi(token=token)
    print(f"Uploading model from {MODEL_DIR} to hub repo: {args.repo} ...")
    api.upload_folder(
        folder_path=MODEL_DIR,
        repo_id=args.repo,
        repo_type="model",
        ignore_patterns=["checkpoint-*"],
        commit_message="Upload fine-tuned CKD DistilBERT model (95% accuracy on UCI dataset)",
    )
    print(f"\nDone. Model available at: https://huggingface.co/{args.repo}")
    print(f"\nNext: set the env var in Railway/Render:")
    print(f"  HF_MODEL_REPO={args.repo}")

if __name__ == "__main__":
    main()
