# =========================================
# CredLens - Utility Module
# =========================================

import joblib
import numpy as np
import os

# =========================================
# 1. PATH SETUP
# =========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "best_model.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "..", "models", "features.pkl")


# =========================================
# 2. LOAD MODEL
# =========================================
def load_model():
    try:
        model = joblib.load(MODEL_PATH)
        return model
    except Exception as e:
        raise RuntimeError(f"Error loading model: {e}")


# =========================================
# 3. LOAD FEATURE NAMES
# =========================================
def load_features():
    try:
        features = joblib.load(FEATURE_PATH)
        return features
    except:
        return None  # optional file


# =========================================
# 4. VALIDATE INPUT
# =========================================
def validate_input(data, expected_len=10):
    if not isinstance(data, (list, tuple)):
        raise ValueError("Input must be a list or tuple")

    if len(data) != expected_len:
        raise ValueError(f"Expected {expected_len} features, got {len(data)}")

    for val in data:
        if not isinstance(val, (int, float)):
            raise ValueError("All input values must be numeric")

    return True


# =========================================
# 5. PREPROCESS INPUT
# =========================================
def preprocess_input(data):
    try:
        data = np.array(data).reshape(1, -1)
        return data
    except Exception as e:
        raise RuntimeError(f"Error in preprocessing: {e}")


# =========================================
# 6. PREDICTION FUNCTION
# =========================================
def predict(model, data):
    try:
        prediction = model.predict(data)[0]
        probability = model.predict_proba(data)[0][1]
        return prediction, probability
    except Exception as e:
        raise RuntimeError(f"Prediction error: {e}")


# =========================================
# 7. FORMAT OUTPUT
# =========================================
def format_output(prediction, probability):
    return {
        "prediction": int(prediction),
        "probability": round(float(probability), 4)
    }


# =========================================
# 8. FULL PIPELINE FUNCTION
# =========================================
def run_inference(input_data):
    """
    Full pipeline:
    Input → Validate → Preprocess → Predict → Format
    """

    # Step 1: Validate
    validate_input(input_data)

    # Step 2: Load Model
    model = load_model()

    # Step 3: Preprocess
    processed_data = preprocess_input(input_data)

    # Step 4: Predict
    prediction, probability = predict(model, processed_data)

    # Step 5: Format Output
    result = format_output(prediction, probability)

    return result


# =========================================
# 9. DEBUG / TEST
# =========================================
if __name__ == "__main__":

    sample = [35, 2, 1, 2, 1, 3000, 12, 1, 1, 0]

    try:
        result = run_inference(sample)
        print("✅ Inference Result:")
        print(result)
    except Exception as e:
        print("❌ Error:", e)