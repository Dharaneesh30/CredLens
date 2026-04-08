import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score

from data_preprocessing import load_data, handle_missing_values, create_target, encode_data, split_features


def run_fairness_audit():
    model_path = Path("models/best_model.pkl")
    if not model_path.exists():
        raise FileNotFoundError("models/best_model.pkl not found. Train model first.")

    model = joblib.load(model_path)

    df = load_data()
    df = handle_missing_values(df)
    df = create_target(df)
    df = encode_data(df)
    target_col = os.getenv("CREDLENS_TARGET_COLUMN", "Risk")

    if "Sex" not in df.columns and "sex" not in df.columns:
        raise ValueError("No protected group column found (Sex/sex).")

    group_col = "Sex" if "Sex" in df.columns else "sex"
    X, y = split_features(df)
    y_pred = model.predict(X)

    rows = []
    for group_value, grp in df.groupby(group_col):
        idx = grp.index
        y_true_g = y.loc[idx]
        y_pred_g = pd.Series(y_pred, index=df.index).loc[idx]
        approval_rate = float((y_pred_g == 0).mean())
        accuracy = float(accuracy_score(y_true_g, y_pred_g))
        rows.append(
            {
                "group": int(group_value) if isinstance(group_value, (int, np.integer, float)) else str(group_value),
                "count": int(len(idx)),
                "approval_rate": round(approval_rate, 4),
                "accuracy": round(accuracy, 4),
            }
        )

    results_dir = Path("results")
    results_dir.mkdir(parents=True, exist_ok=True)
    out_path = results_dir / "fairness_audit.json"
    out_path.write_text(json.dumps({"target_column": target_col, "group_column": group_col, "groups": rows}, indent=2), encoding="utf-8")
    print(f"Fairness audit saved: {out_path}")


if __name__ == "__main__":
    run_fairness_audit()
