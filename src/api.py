from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "best_model.pkl")

model = joblib.load(MODEL_PATH)

print("✅ Model Loaded!")

# -----------------------------
# HOME
# -----------------------------
@app.route("/")
def home():
    return "CredLens API running"

# -----------------------------
# PREDICT
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json["input"]
        data = np.array(data).reshape(1, -1)

        prediction = model.predict(data)[0]
        probability = model.predict_proba(data)[0][1]

        return jsonify({
            "prediction": int(prediction),
            "probability": float(probability)
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# -----------------------------
# CHARTS
# -----------------------------
@app.route("/charts")
def charts():
    path = os.path.join(BASE_DIR, "..", "results")
    images = [f for f in os.listdir(path) if f.endswith(".png")]
    return jsonify({"images": images})

@app.route("/chart/<filename>")
def get_chart(filename):
    path = os.path.join(BASE_DIR, "..", "results")
    return send_from_directory(path, filename)

# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)