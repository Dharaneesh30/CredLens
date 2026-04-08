#!/usr/bin/env python
"""CredLens Flask API.

This API serves model predictions and dataset-driven analysis for loan applicants.
"""

from __future__ import annotations

from pathlib import Path
import mimetypes

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "best_model.pkl"
CHARTS_DIR = BASE_DIR / "results"
DATASET_PATH = BASE_DIR / "data" / "raw" / "german_credit_data.csv"

FEATURE_NAMES = [
    "age",
    "job",
    "housing",
    "saving",
    "checking",
    "credit",
    "duration",
    "purpose",
    "sex",
    "other",
]

HOUSING_LABELS = {0: "Own", 1: "Rent", 2: "Free"}
SAVING_LABELS = {0: "Unknown", 1: "Little", 2: "Moderate", 3: "High"}
CHECKING_LABELS = {0: "Unknown", 1: "Little", 2: "Moderate", 3: "Rich"}
SEX_LABELS = {0: "Female", 1: "Male"}


def calculate_credit_score(probability: float) -> int:
    return int(np.clip(round(300 + probability * 550), 300, 850))


def classify_risk(score: int) -> str:
    if score < 500:
        return "High Risk"
    if score < 700:
        return "Medium Risk"
    return "Low Risk"


def loan_decision(score: int) -> str:
    return "Approved" if score >= 650 else "Rejected"


def normalize_text(value: object) -> str:
    if value is None:
        return ""
    value_str = str(value).strip().lower()
    return "" if value_str in {"nan", "none"} else value_str


def map_housing(value: object) -> int:
    mapping = {"own": 0, "rent": 1, "free": 2}
    return mapping.get(normalize_text(value), 1)


def map_saving(value: object) -> int:
    mapping = {
        "": 0,
        "na": 0,
        "unknown": 0,
        "little": 1,
        "moderate": 2,
        "quite rich": 3,
        "rich": 3,
    }
    return mapping.get(normalize_text(value), 0)


def map_checking(value: object) -> int:
    mapping = {
        "": 0,
        "na": 0,
        "unknown": 0,
        "little": 1,
        "moderate": 2,
        "rich": 3,
    }
    return mapping.get(normalize_text(value), 0)


def map_purpose(value: object) -> int:
    mapping = {
        "radio/tv": 1,
        "car": 2,
        "furniture/equipment": 3,
        "education": 4,
    }
    return mapping.get(normalize_text(value), 0)


def map_sex(value: object) -> int:
    mapping = {"female": 0, "male": 1}
    return mapping.get(normalize_text(value), 1)


def map_other(df: pd.DataFrame) -> pd.Series:
    # Derived signal to align with frontend's extra binary feature.
    return ((df["Checking account"] == 0) & (df["Saving accounts"] == 0)).astype(int)


def load_dataset_profile(active_model) -> dict | None:
    if not DATASET_PATH.exists():
        print(f"Dataset not found at {DATASET_PATH}")
        return None

    raw_df = pd.read_csv(DATASET_PATH)

    dataset = pd.DataFrame()
    dataset["age"] = pd.to_numeric(raw_df.get("Age"), errors="coerce")
    dataset["job"] = pd.to_numeric(raw_df.get("Job"), errors="coerce")
    dataset["housing"] = raw_df.get("Housing").map(map_housing)
    dataset["saving"] = raw_df.get("Saving accounts").map(map_saving)
    dataset["checking"] = raw_df.get("Checking account").map(map_checking)
    dataset["credit"] = pd.to_numeric(raw_df.get("Credit amount"), errors="coerce")
    dataset["duration"] = pd.to_numeric(raw_df.get("Duration"), errors="coerce")
    dataset["purpose"] = raw_df.get("Purpose").map(map_purpose)
    dataset["sex"] = raw_df.get("Sex").map(map_sex)
    dataset["other"] = map_other(dataset.rename(columns={"saving": "Saving accounts", "checking": "Checking account"}))

    dataset = dataset.dropna(subset=["age", "job", "credit", "duration"]).copy()
    for col in FEATURE_NAMES:
        dataset[col] = pd.to_numeric(dataset[col], errors="coerce").fillna(0)

    feature_matrix = dataset[FEATURE_NAMES].to_numpy(dtype=float)
    if active_model is not None:
        try:
            model_prob = active_model.predict_proba(feature_matrix)[:, 1]
            model_target = (model_prob >= 0.5).astype(int)
            # Guard against degenerate outputs caused by encoding mismatch.
            if model_target.mean() in (0.0, 1.0):
                dataset["risk_target"] = (dataset["credit"] > 5000).astype(int)
            else:
                dataset["risk_target"] = model_target
            dataset["risk_probability"] = model_prob
        except Exception:
            dataset["risk_target"] = (dataset["credit"] > 5000).astype(int)
            dataset["risk_probability"] = np.nan
    else:
        dataset["risk_target"] = (dataset["credit"] > 5000).astype(int)
        dataset["risk_probability"] = np.nan

    numeric_stats = {
        col: {
            "mean": float(dataset[col].mean()),
            "median": float(dataset[col].median()),
            "p25": float(dataset[col].quantile(0.25)),
            "p75": float(dataset[col].quantile(0.75)),
            "min": float(dataset[col].min()),
            "max": float(dataset[col].max()),
        }
        for col in ["age", "credit", "duration"]
    }

    category_risk = {
        "housing": dataset.groupby("housing")["risk_target"].mean().mul(100).round(1).to_dict(),
        "saving": dataset.groupby("saving")["risk_target"].mean().mul(100).round(1).to_dict(),
        "job": dataset.groupby("job")["risk_target"].mean().mul(100).round(1).to_dict(),
    }

    credit_bins = pd.IntervalIndex.from_tuples(
        [(-1, 5000), (5000, 10000), (10000, 20000), (20000, 1_000_000)]
    )
    duration_bins = pd.IntervalIndex.from_tuples([(0, 12), (12, 24), (24, 36), (36, 120)])

    dataset["credit_bucket"] = pd.cut(dataset["credit"], bins=credit_bins)
    dataset["duration_bucket"] = pd.cut(dataset["duration"], bins=duration_bins)

    credit_bucket_risk = (
        dataset.groupby("credit_bucket", observed=True)["risk_target"]
        .mean()
        .mul(100)
        .round(1)
        .to_dict()
    )
    duration_bucket_risk = (
        dataset.groupby("duration_bucket", observed=True)["risk_target"]
        .mean()
        .mul(100)
        .round(1)
        .to_dict()
    )

    return {
        "dataset": dataset,
        "size": int(len(dataset)),
        "high_risk_rate": float(dataset["risk_target"].mean() * 100),
        "numeric_stats": numeric_stats,
        "category_risk": category_risk,
        "credit_bucket_risk": credit_bucket_risk,
        "duration_bucket_risk": duration_bucket_risk,
        "credit_bins": credit_bins,
        "duration_bins": duration_bins,
    }


def locate_bucket(value: float, bins: pd.IntervalIndex) -> pd.Interval | None:
    for interval in bins:
        if value > interval.left and value <= interval.right:
            return interval
    return None


def percentile_rank(series: pd.Series, value: float) -> float:
    return float((series <= value).mean() * 100)


def dataset_driven_analysis(input_vector: np.ndarray, probability: float, prediction: int) -> tuple[list[str], dict]:
    if DATASET_PROFILE is None:
        return ["Dataset profile is unavailable, so only model-based analysis is returned."], {}

    input_data = dict(zip(FEATURE_NAMES, input_vector.tolist()))

    score = calculate_credit_score(probability)
    risk_level = classify_risk(score)
    decision = loan_decision(score)

    dataset = DATASET_PROFILE["dataset"]
    stats = DATASET_PROFILE["numeric_stats"]

    credit = float(input_data["credit"])
    duration = float(input_data["duration"])
    age = float(input_data["age"])

    credit_pct = percentile_rank(dataset["credit"], credit)
    duration_pct = percentile_rank(dataset["duration"], duration)
    age_pct = percentile_rank(dataset["age"], age)

    credit_bucket = locate_bucket(credit, DATASET_PROFILE["credit_bins"])
    duration_bucket = locate_bucket(duration, DATASET_PROFILE["duration_bins"])

    credit_bucket_risk = (
        DATASET_PROFILE["credit_bucket_risk"].get(credit_bucket, DATASET_PROFILE["high_risk_rate"])
        if credit_bucket is not None
        else DATASET_PROFILE["high_risk_rate"]
    )
    duration_bucket_risk = (
        DATASET_PROFILE["duration_bucket_risk"].get(duration_bucket, DATASET_PROFILE["high_risk_rate"])
        if duration_bucket is not None
        else DATASET_PROFILE["high_risk_rate"]
    )

    housing_code = int(input_data["housing"])
    saving_code = int(input_data["saving"])
    job_code = int(input_data["job"])

    housing_risk = DATASET_PROFILE["category_risk"]["housing"].get(housing_code, DATASET_PROFILE["high_risk_rate"])
    saving_risk = DATASET_PROFILE["category_risk"]["saving"].get(saving_code, DATASET_PROFILE["high_risk_rate"])
    job_risk = DATASET_PROFILE["category_risk"]["job"].get(job_code, DATASET_PROFILE["high_risk_rate"])

    insights = [
        f"Model prediction: {'High Risk' if prediction == 1 else 'Low Risk'} with {(probability * 100):.1f}% probability.",
        f"Credit score: {score} ({risk_level}); recommendation: {decision}.",
        (
            f"Compared to {DATASET_PROFILE['size']} historical applications, credit amount is at the "
            f"{credit_pct:.0f}th percentile (dataset median: {stats['credit']['median']:.0f})."
        ),
        (
            f"Loan duration is at the {duration_pct:.0f}th percentile (dataset median: "
            f"{stats['duration']['median']:.0f} months)."
        ),
        f"Applicant age is at the {age_pct:.0f}th percentile (dataset median: {stats['age']['median']:.0f} years).",
        (
            f"Historical high-risk share for similar credit bucket is {credit_bucket_risk:.1f}% and "
            f"for similar duration bucket is {duration_bucket_risk:.1f}%."
        ),
        (
            f"Category risk context: Housing={HOUSING_LABELS.get(housing_code, str(housing_code))} "
            f"({housing_risk:.1f}%), Savings={SAVING_LABELS.get(saving_code, str(saving_code))} ({saving_risk:.1f}%), "
            f"Job level {job_code} ({job_risk:.1f}%)."
        ),
    ]

    if probability >= 0.65 or credit_bucket_risk >= 65 or duration_bucket_risk >= 65:
        insights.append("Dataset signals indicate elevated risk. Stronger verification and repayment safeguards are recommended.")
    elif probability >= 0.45:
        insights.append("Dataset signals indicate moderate risk. Review supporting documents before final approval.")
    else:
        insights.append("Dataset signals are favorable relative to historical profiles with lower risk.")

    analysis_meta = {
        "dataset_size": DATASET_PROFILE["size"],
        "dataset_high_risk_rate": round(DATASET_PROFILE["high_risk_rate"], 2),
        "percentiles": {
            "credit": round(credit_pct, 2),
            "duration": round(duration_pct, 2),
            "age": round(age_pct, 2),
        },
        "bucket_risk_rates": {
            "credit": round(float(credit_bucket_risk), 2),
            "duration": round(float(duration_bucket_risk), 2),
        },
        "category_risk_rates": {
            "housing": round(float(housing_risk), 2),
            "saving": round(float(saving_risk), 2),
            "job": round(float(job_risk), 2),
        },
    }

    return insights, analysis_meta


print(f"Base directory: {BASE_DIR}")
print(f"Model path: {MODEL_PATH}")
print(f"Dataset path: {DATASET_PATH}")

try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully")
except Exception as exc:
    print(f"Model loading failed: {exc}")
    model = None

DATASET_PROFILE = load_dataset_profile(model)
if DATASET_PROFILE is not None:
    print(f"Dataset profile loaded ({DATASET_PROFILE['size']} rows)")


@app.route("/", methods=["GET"])
def home():
    return (
        jsonify(
            {
                "status": "CredLens API is running",
                "version": "2.0.0",
                "endpoints": {
                    "predict": "POST /predict",
                    "charts": "GET /charts",
                    "chart": "GET /chart/<filename>",
                    "health": "GET /health",
                    "models": "GET /models",
                    "dataset_summary": "GET /dataset_summary",
                },
            }
        ),
        200,
    )


@app.route("/health", methods=["GET"])
def health():
    if model is None:
        return jsonify({"status": "Model not loaded"}), 500

    return (
        jsonify(
            {
                "status": "API healthy",
                "model_loaded": True,
                "dataset_profile_loaded": DATASET_PROFILE is not None,
            }
        ),
        200,
    )


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        payload = request.get_json(silent=True)
        if not payload or "input" not in payload:
            return jsonify({"error": "Missing 'input' field in request body"}), 400

        input_array = np.array(payload["input"], dtype=float).reshape(1, -1)
        if input_array.shape[1] != 10:
            return jsonify({"error": f"Expected 10 features, got {input_array.shape[1]}"}), 400

        prediction = int(model.predict(input_array)[0])
        probability = float(model.predict_proba(input_array)[0][1])
        score = calculate_credit_score(probability)

        insights, analysis_meta = dataset_driven_analysis(input_array.flatten(), probability, prediction)

        return (
            jsonify(
                {
                    "prediction": prediction,
                    "probability": probability,
                    "credit_score": score,
                    "risk_level": classify_risk(score),
                    "loan_decision": loan_decision(score),
                    "confidence": float(max(probability, 1 - probability)),
                    "analysis": insights,
                    "analysis_meta": analysis_meta,
                }
            ),
            200,
        )

    except Exception as exc:
        print(f"Prediction error: {exc}")
        return jsonify({"error": f"Prediction failed: {exc}"}), 500


@app.route("/dataset_summary", methods=["GET"])
def dataset_summary():
    if DATASET_PROFILE is None:
        return jsonify({"error": "Dataset profile unavailable"}), 500

    return (
        jsonify(
            {
                "rows": DATASET_PROFILE["size"],
                "high_risk_rate": round(DATASET_PROFILE["high_risk_rate"], 2),
                "numeric_stats": DATASET_PROFILE["numeric_stats"],
                "category_risk": {
                    "housing": DATASET_PROFILE["category_risk"]["housing"],
                    "saving": DATASET_PROFILE["category_risk"]["saving"],
                    "job": DATASET_PROFILE["category_risk"]["job"],
                },
            }
        ),
        200,
    )


@app.route("/charts", methods=["GET"])
def charts():
    try:
        if not CHARTS_DIR.exists():
            return jsonify({"images": []}), 200

        image_extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
        images = [f.name for f in CHARTS_DIR.iterdir() if f.suffix.lower() in image_extensions]
        return jsonify({"images": sorted(images)}), 200
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/chart/<filename>", methods=["GET"])
def get_chart(filename: str):
    try:
        file_path = CHARTS_DIR / filename
        if not file_path.exists() or not file_path.is_file():
            return jsonify({"error": "Chart not found"}), 404

        if not str(file_path.resolve()).startswith(str(CHARTS_DIR.resolve())):
            return jsonify({"error": "Access denied"}), 403

        mime_type, _ = mimetypes.guess_type(str(file_path))
        return send_file(file_path, mimetype=mime_type or "application/octet-stream")
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/models", methods=["GET"])
def models_info():
    models_dir = BASE_DIR / "models"
    available_models = []
    if models_dir.exists():
        model_files = [f.stem for f in models_dir.glob("*.pkl")]
        available_models = sorted(set(model_files))

    return jsonify({"available_models": available_models, "current_model": "best_model"}), 200


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error", "message": str(error)}), 500


if __name__ == "__main__":
    print("Starting CredLens API server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=True)
