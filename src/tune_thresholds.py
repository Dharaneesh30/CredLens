import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import f1_score

from data_preprocessing import preprocess_pipeline


def tune_thresholds():
    model_path = Path("models/best_model.pkl")
    if not model_path.exists():
        raise FileNotFoundError("models/best_model.pkl not found. Train model first.")

    model = joblib.load(model_path)
    _, X_test, _, y_test = preprocess_pipeline()
    probs = model.predict_proba(X_test)[:, 1]

    best_thr = 0.5
    best_f1 = -1.0
    for thr in np.linspace(0.1, 0.9, 81):
        pred = (probs >= thr).astype(int)
        score = f1_score(y_test, pred)
        if score > best_f1:
            best_f1 = float(score)
            best_thr = float(thr)

    # Lending thresholds derived around best threshold.
    thresholds = {
        "RISK_POSITIVE_CLASS_THRESHOLD": round(best_thr, 3),
        "RISK_APPROVE_THRESHOLD": round(max(0.1, best_thr - 0.2), 3),
        "RISK_CONDITIONAL_THRESHOLD": round(max(0.2, best_thr - 0.05), 3),
        "best_f1": round(best_f1, 4),
    }

    out_path = Path("results/threshold_recommendation.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(thresholds, indent=2), encoding="utf-8")
    print(f"Threshold recommendations saved: {out_path}")


if __name__ == "__main__":
    tune_thresholds()
