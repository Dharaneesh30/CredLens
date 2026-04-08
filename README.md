# CredLens-
Machine Learning-Based Credit Risk Scoring Model for Digital Lending Platforms

## Project Architecture Split

The project is now split by **backend services/routes** and **frontend pages/components** based on the credit risk workflow idea.

### Backend (`backend/app`)

- `main.py`: backend entrypoint
- `__init__.py`: Flask app factory
- `config.py`: model/results/Ollama configuration
- `routes/health.py`: API health route
- `routes/prediction.py`: credit risk prediction route
- `routes/charts.py`: EDA chart endpoints
- `routes/advisor.py`: Ollama advisor route
- `services/model_service.py`: model loading + inference
- `services/advisor_service.py`: Ollama + fallback advisor logic

Compatibility launcher:
- `src/api.py` still works (`python src/api.py`) and now boots the modular backend.

### Frontend (`frontend/src`)

- `pages/CreditRiskPage.jsx`: main page flow orchestration
- `components/forms/ApplicantForm.jsx`: applicant input page section
- `components/results/ResultsSummary.jsx`: prediction summary section
- `components/tabs/PredictionTab.jsx`: prediction charts page section
- `components/tabs/AnalysisTab.jsx`: analysis section
- `components/tabs/EdaTab.jsx`: EDA section
- `components/tabs/AdvisorTab.jsx`: AI advisor query section
- `components/tabs/TabsNav.jsx`: tab navigation
- `services/api.js`: API request layer
- `data/featureFields.js`: form metadata
- `data/edaData.js`: EDA static datasets
- `utils/risk.js`: score/risk helpers
- `App.jsx`: app entry wrapper

## Ollama Loan Advisor Addon

This project now includes an AI advisor endpoint and UI tab that can:
- suggest whether to approve a loan,
- explain lending perspective and risk factors,
- answer custom user questions for each applicant.

### 1. Install dependencies

```bash
pip install -r requirements.txt
cd frontend
npm install
```

### 2. Run Ollama locally

```bash
ollama pull llama3.2
ollama serve
```

### 3. Run backend and frontend

```bash
# Terminal 1 (project root)
python src/api.py

# Terminal 2
cd frontend
npm start
```

### 4. Use AI Advisor in UI

1. Fill applicant details and click `Predict Risk`.
2. Open the `AI Advisor` tab.
3. Enter your custom question and submit.
4. The app calls `/loan-advisor` and shows Ollama response.

If Ollama is unavailable, CredLens returns a rule-based fallback suggestion.
