# 🩺 CKD AI Risk Screener

> **Predict Chronic Kidney Disease (CKD) risk from clinical inputs using a Next.js frontend and a DistilBERT-powered FastAPI backend.**

---

## ⚠️ Medical Disclaimer

> **This application is for educational and research purposes only.**
> It is **not** a substitute for professional medical advice, diagnosis, or treatment.
> Always consult a qualified healthcare provider with questions regarding your health or any medical condition.
> Do not use this tool to make clinical decisions.

---

## 📁 Project Structure

```
ckd-ai-risk-screener/
├── frontend/        # Next.js (TypeScript) web application
├── ml-api/          # Python FastAPI + DistilBERT ML inference service
├── docs/            # Project documentation, architecture notes, API specs
├── README.md        # This file
└── .gitignore       # Root gitignore
```

---

## 🧠 How It Works

1. **Frontend** — A clean, accessible Next.js UI collects clinical input features (e.g., serum creatinine, blood urea, haemoglobin, etc.) from the user.
2. **ML API** — The FastAPI backend receives the inputs, preprocesses them, and runs inference using a fine-tuned **DistilBERT** model to predict CKD risk.
3. **Result** — The frontend displays a risk assessment (e.g., *Low Risk / High Risk*) with confidence scores and a brief explanation.

---

## 🛠️ Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | Next.js 14+, TypeScript, Tailwind CSS |
| ML API     | Python 3.11+, FastAPI, Hugging Face Transformers (DistilBERT) |
| ML Model   | Fine-tuned DistilBERT on CKD datasets |
| Deployment | Vercel (frontend) · Railway/Docker (ML API) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.11
- `npm` or `pnpm`
- `pip` or `poetry`

### 1. Clone the repo

```bash
git clone https://github.com/your-org/ckd-ai-risk-screener.git
cd ckd-ai-risk-screener
```

### 2. Set up the Frontend

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:3000
```

See [`frontend/README.md`](./frontend/README.md) for full setup instructions.

### 3. Set up the ML API

```bash
cd ml-api
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs at http://localhost:8000
```

See [`ml-api/README.md`](./ml-api/README.md) for full setup instructions.

---

## 📖 Documentation

All architecture decisions, API contracts, and dataset notes live in [`docs/`](./docs/).

---

## 🤝 Contributing

Contributions are welcome! Please read [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) before opening a pull request.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
