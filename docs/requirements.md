# CredLens Requirements Guide

This page lists the Python dependencies used by the project and why they are needed.

## Root `requirements.txt` (FastAPI backend + ML + QA)

- API and server:
  - `fastapi`, `uvicorn[standard]`, `python-multipart`
- ML and inference:
  - `numpy`, `pandas`, `scikit-learn`, `joblib`, `xgboost`
- EDA and analysis:
  - `matplotlib`, `seaborn`
- Explainability:
  - `shap` (optional at runtime, used when available)
- QA:
  - `pytest`

Install:

```bash
pip install -r requirements.txt
```

## `backend/app/requirements.txt` (API runtime)

This is the runtime set for backend deployment:

- `fastapi`, `uvicorn[standard]`, `python-multipart`
- `numpy`, `scikit-learn`, `joblib`, `xgboost`

Install:

```bash
pip install -r backend/app/requirements.txt
```
