#!/usr/bin/env python
# =========================================
# CredLens - Flask API Server
# =========================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from pathlib import Path

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# =========================================
# CONFIG & PATHS
# =========================================
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "best_model.pkl"
CHARTS_DIR = BASE_DIR / "results"

print(f"📁 Base Directory: {BASE_DIR}")
print(f"🤖 Model Path: {MODEL_PATH}")
print(f"📊 Charts Directory: {CHARTS_DIR}")

# =========================================
# LOAD MODEL
# =========================================
try:
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None


# =========================================
# HELPER FUNCTIONS
# =========================================
def calculate_credit_score(prob):
    """Calculate credit score from probability"""
    return int(300 + prob * 550)


def classify_risk(score):
    """Classify risk based on credit score"""
    if score < 500:
        return "High Risk"
    elif score < 700:
        return "Medium Risk"
    else:
        return "Low Risk"


def loan_decision(score):
    """Make loan decision based on credit score"""
    return "Approved" if score >= 650 else "Rejected"


def generate_analysis(input_vector, prediction, probability):
    age, job, housing, saving, checking, credit, duration, purpose, sex, other = input_vector
    score = calculate_credit_score(probability)
    risk_level = classify_risk(score)
    decision = loan_decision(score)

    insights = [
        f"The model predicts {'High Risk' if prediction == 1 else 'Low Risk'} with {(probability * 100):.1f}% probability.",
        f"Computed credit score is {score}, classified as {risk_level}.",
        f"Loan outcome recommendation: {decision}.",
    ]

    if credit > 20000:
        insights.append("A high credit amount increases the risk profile and may require additional collateral or checks.")
    elif credit > 10000:
        insights.append("A moderate credit amount makes the application sensitive to repayment duration and savings.")
    else:
        insights.append("A smaller credit amount generally supports a lower-risk recommendation.")

    if duration > 36:
        insights.append("The longer repayment period increases risk if economic conditions change.")
    else:
        insights.append("A shorter repayment duration helps improve approval confidence.")

    if saving <= 1:
        insights.append("Low or unknown savings indicate less financial buffer for repayment.")
    else:
        insights.append("Savings are sufficient to support repayment capacity.")

    if job <= 1:
        insights.append("Lower job level may indicate less income stability, increasing risk.")
    elif job >= 3:
        insights.append("Higher job stability supports a more favorable repayment outlook.")

    if housing == 0:
        insights.append("Home ownership is generally associated with lower credit risk.")
    elif housing == 1:
        insights.append("Renting housing can slightly increase default risk compared with ownership.")

    if purpose == 0:
        insights.append("Loan purpose is unclear; further review may be needed.")
    else:
        insights.append("Defined loan purpose helps justify the credit request.")

    return insights


# =========================================
# API ENDPOINTS
# =========================================

@app.route("/", methods=["GET"])
def home():
    """Root endpoint - API status"""
    return jsonify({
        "status": "✅ CredLens API is running!",
        "version": "1.0.0",
        "endpoints": {
            "predict": "POST /predict (with JSON body containing 'input' array)",
            "charts": "GET /charts (returns available chart images)",
            "health": "GET /health (API health check)"
        }
    }), 200


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    if model is None:
        return jsonify({"status": "❌ Model not loaded"}), 500
    return jsonify({
        "status": "✅ API is healthy",
        "model_loaded": model is not None
    }), 200


@app.route("/predict", methods=["POST"])
def predict():
    """
    Prediction endpoint
    Expected JSON: {"input": [age, job, housing, saving, checking, credit, duration, purpose, sex, other]}
    """
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        # Get input data
        data = request.get_json()
        if not data or "input" not in data:
            return jsonify({"error": "Missing 'input' field in request body"}), 400

        input_array = np.array(data["input"]).reshape(1, -1)

        # Validate input
        if input_array.shape[1] != 10:
            return jsonify({
                "error": f"Expected 10 features, got {input_array.shape[1]}"
            }), 400

        # Make prediction
        prediction = model.predict(input_array)[0]
        probability = model.predict_proba(input_array)[0][1]

        # Calculate additional metrics
        score = calculate_credit_score(probability)
        risk_level = classify_risk(score)
        decision = loan_decision(score)
        analysis = generate_analysis(input_array.flatten(), prediction, probability)

        # Return results
        return jsonify({
            "prediction": int(prediction),
            "probability": float(probability),
            "credit_score": score,
            "risk_level": risk_level,
            "loan_decision": decision,
            "confidence": float(max(probability, 1 - probability)),
            "analysis": analysis
        }), 200

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route("/charts", methods=["GET"])
def charts():
    """
    Get available chart images
    Returns list of chart image filenames from results directory
    """
    try:
        if not CHARTS_DIR.exists():
            return jsonify({"images": []}), 200

        # Get all image files
        image_extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
        images = [
            f.name for f in CHARTS_DIR.iterdir()
            if f.suffix.lower() in image_extensions
        ]

        return jsonify({"images": sorted(images)}), 200

    except Exception as e:
        print(f"❌ Charts error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/chart/<filename>", methods=["GET"])
def get_chart(filename):
    """Serve a specific chart image"""
    from flask import send_file
    import mimetypes

    try:
        file_path = CHARTS_DIR / filename

        # Security check
        if not file_path.exists() or not file_path.is_file():
            return jsonify({"error": "Chart not found"}), 404

        # Check if file is in allowed directory
        if not str(file_path.resolve()).startswith(str(CHARTS_DIR.resolve())):
            return jsonify({"error": "Access denied"}), 403

        mime_type, _ = mimetypes.guess_type(str(file_path))
        return send_file(
            file_path,
            mimetype=mime_type or "application/octet-stream"
        )

    except Exception as e:
        print(f"❌ Chart serving error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/models", methods=["GET"])
def models_info():
    """Get information about available models"""
    models_dir = BASE_DIR / "models"
    available_models = []

    if models_dir.exists():
        model_files = [f.stem for f in models_dir.glob("*.pkl")]
        available_models = sorted(set(model_files))

    return jsonify({
        "available_models": available_models,
        "current_model": "best_model"
    }), 200


# =========================================
# ERROR HANDLERS
# =========================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Endpoint not found",
        "message": "Available endpoints: /predict, /charts, /health, /models"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        "error": "Internal server error",
        "message": str(error)
    }), 500


# =========================================
# MAIN
# =========================================

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🚀 CredLens API Server Starting")
    print("=" * 50)
    print(f"📍 Server: http://127.0.0.1:5000")
    print("🔗 CORS: Enabled for frontend")
    print("=" * 50 + "\n")

    # Run Flask app
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
        use_reloader=True
    )
