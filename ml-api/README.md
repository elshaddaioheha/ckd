# 🤖 CKD AI Risk Screener — ML API

This is the **Python FastAPI** machine learning inference service for the CKD AI Risk Screener.
It accepts structured clinical input features and returns a CKD risk prediction using a fine-tuned **DistilBERT** model.

---

## ⚠️ Medical Disclaimer

This API is for **educational and research use only**. Outputs must not be used for clinical diagnosis or treatment decisions.

---

## Tech Stack

- **Runtime**: Python 3.11+
- **Framework**: FastAPI
- **ML Framework**: Hugging Face Transformers (`distilbert-base-uncased`)
- **Data Processing**: NumPy, Pandas, scikit-learn
- **Server**: Uvicorn (ASGI)

---

## Folder Structure (Planned)

```
ml-api/
├── app/
│   ├── main.py           # FastAPI app entry point
│   ├── routers/
│   │   └── predict.py    # POST /predict endpoint
│   ├── models/
│   │   └── ckd_model.py  # Model loading & inference logic
│   ├── schemas/
│   │   └── input.py      # Pydantic input/output schemas
│   └── utils/
│       └── preprocess.py # Feature preprocessing helpers
├── model_weights/        # Fine-tuned DistilBERT weights (git-ignored)
├── tests/                # API + unit tests (pytest)
├── requirements.txt      # Python dependencies
├── Dockerfile            # Container definition
└── .env.example          # Environment variable template
```

---

## Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Run the development server
uvicorn app.main:app --reload
# → http://localhost:8000
# → Docs at http://localhost:8000/docs
```

---

## API Endpoints (Planned)

| Method | Endpoint     | Description                        |
|--------|--------------|------------------------------------|
| `GET`  | `/`          | Health check                       |
| `GET`  | `/health`    | Service status                     |
| `POST` | `/predict`   | Submit clinical features, get risk |

### Example Request Body

```json
{
  "age": 45,
  "blood_pressure": 80,
  "specific_gravity": 1.015,
  "albumin": 1,
  "serum_creatinine": 1.2,
  "haemoglobin": 14.5,
  "packed_cell_volume": 44,
  "hypertension": true,
  "diabetes_mellitus": false
}
```

### Example Response

```json
{
  "prediction": "CKD",
  "confidence": 0.87,
  "risk_level": "High"
}
```

---

## Environment Variables

| Variable       | Description                          |
|----------------|--------------------------------------|
| `MODEL_PATH`   | Path to fine-tuned DistilBERT weights|
| `LOG_LEVEL`    | Logging level (default: `info`)      |

---

> **Status**: 🚧 Scaffold only — implementation pending.
