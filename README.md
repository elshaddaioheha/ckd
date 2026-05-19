# 🩺 CKD AI Risk Screener

An end-to-end, full-stack AI application designed to estimate Chronic Kidney Disease (CKD) risk from 20 standard clinical and laboratory inputs. 

This project bridges the gap between tabular clinical data and modern NLP by transforming patient metrics into clinical narratives, which are then analyzed by a fine-tuned DistilBERT model. 

---

## 🛠️ Technology Stack

**Frontend (Client)**
* **Framework**: Next.js 15 (React 19, App Router)
* **Styling**: Tailwind CSS (with print-specific CSS for PDF reports)
* **Validation**: React Hook Form + Zod
* **Deployment**: Vercel

**Backend (API)**
* **Framework**: FastAPI (Python)
* **Machine Learning**: PyTorch (CPU-only optimized), Hugging Face `transformers`
* **Deployment**: Railway (Dockerized container)
* **Model Hosting**: Hugging Face Hub

**Model**
* **Base Architecture**: DistilBERT (`distilbert-base-uncased`)
* **Task**: Sequence Classification (Binary: CKD vs. Not CKD)
* **Dataset**: UCI Chronic Kidney Disease Dataset (Apollo Hospitals, Tamil Nadu, India)

---

## 🏗️ Architecture & Workflow

1. **Data Entry**: The user inputs 20 clinical parameters (e.g., age, blood pressure, serum creatinine) into the frontend Next.js form.
2. **Validation & Conversion**: Zod validates the inputs. A built-in unit converter allows users (especially in Francophone West Africa) to enter Serum Creatinine in **µmol/L**, automatically converting it to **mg/dL** (÷ 88.42) before submission.
3. **API Request**: The payload is sent to the FastAPI backend via a POST request to `/predict`.
4. **Clinical Text Generation**: The backend converts the structured JSON payload into a coherent English "clinical narrative" (e.g., *"A 48-year-old patient presents with a blood pressure of 80 mmHg. Laboratory results show serum creatinine at 1.2 mg/dL..."*).
5. **Inference**: The narrative is tokenized and passed through the fine-tuned DistilBERT model to generate risk probabilities.
6. **Clinical Reasoning Engine**: A rule-based reasoning layer intercepts the raw data to flag critical findings (e.g., "Elevated Serum Creatinine", "Hypertension", "Anemia") and generates human-readable explanations for *why* the AI made its decision.
7. **Presentation**: The frontend renders the risk score, the AI reasoning, and the flagged findings in a dynamic UI. Users can use a print stylesheet to export the results as a clean PDF report.

---

## 🌍 Regional Context: West Africa Adaptations

Because the model was trained on data from India, extra care was taken to adapt the UI for West African clinical contexts:
* **Unit Flexibility**: Added a toggle for Serum Creatinine (`mg/dL` ↔ `µmol/L`) to support different regional laboratory standards.
* **Contextual Disclaimers**: Added prominent UI warnings noting that while the model handles universal CKD drivers (Hypertension, Diabetes), it is **not validated** for specific regional drivers like **Sickle Cell Nephropathy**, **Herbal/Traditional medicine nephrotoxicity**, or **Malaria-related kidney injuries**.

---

## 🚧 Challenges Encountered & Solutions

Building and deploying an ML-powered web app comes with unique full-stack challenges. Here is how we solved them:

### 1. Massive Docker Image Sizes (Backend)
* **Problem**: Installing `torch` via standard pip pulls in CUDA binaries, resulting in a Docker image over 4GB. This slows down deployments and increases hosting costs.
* **Solution**: Optimized the `Dockerfile` to pull the **CPU-only** PyTorch wheel (`--index-url https://download.pytorch.org/whl/cpu`), drastically reducing the final image size to under 1GB.

### 2. Railway Healthcheck Timeouts
* **Problem**: The fine-tuned model weighs ~260MB. Downloading it from Hugging Face during the FastAPI startup blocked the main thread. Railway's healthchecks timed out waiting for the server to start, causing deployments to constantly fail/crash.
* **Solution**: Decoupled model loading from server startup. We implemented a background thread (`threading.Thread`) that downloads the model asynchronously. The `/health` endpoint boots instantly, returns `200 OK`, and reports the model's loading status. 

### 3. Git Secret Leaks & Push Protection
* **Problem**: A Hugging Face token (`HF_TOKEN`) was accidentally committed to a temporary script. GitHub's Push Protection immediately blocked the push, preventing code updates.
* **Solution**: 
  1. Revoked/Rotated the token on Hugging Face.
  2. Bypassed the block via GitHub's security dashboard.
  3. Used `git reset origin/main` to locally squash all subsequent fixes into a single clean commit, completely wiping the file containing the token from the pushed Git history.
  4. Transitioned the Hugging Face model repository from Private to Public to remove the need for hardcoded tokens entirely.

### 4. CORS & Double-Slash URL Bugs
* **Problem**: The Vercel frontend experienced a `CORS error` when trying to hit the Railway backend. 
* **Solution**: 
  * The environment variable `NEXT_PUBLIC_API_URL` had a trailing slash, resulting in a double-slash endpoint (`//predict`). We implemented a regex replace (`replace(/\/$/, "")`) on the frontend to sanitize the URL.
  * Corrected the `ALLOWED_ORIGINS` environment variable in Railway to strictly match the Vercel production domain without trailing slashes.

---

## 🚀 Running Locally

### Backend (FastAPI)
```bash
cd ml-api
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## ⚖️ Disclaimer

**This tool is for educational and screening-support purposes only.** It does not constitute medical advice, clinical diagnosis, or treatment recommendations. Always consult a qualified and licensed healthcare provider before making any health-related decisions.
