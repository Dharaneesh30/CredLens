# =========================================
# CredLens - Prediction Module (FINAL)
# =========================================

import joblib
import numpy as np
import os

# =========================================
# 1. LOAD MODEL
# =========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "best_model.pkl")

model = joblib.load(MODEL_PATH)

print("✅ Model Loaded Successfully!")


# =========================================
# 2. PREDICTION FUNCTION
# =========================================
def predict_credit_risk(input_data):
    try:
        data = np.array(input_data).reshape(1, -1)

        prediction = model.predict(data)[0]
        probability = model.predict_proba(data)[0][1]

        result = {
            "prediction": int(prediction),
            "probability": float(round(probability, 4))
        }

        return result

    except Exception as e:
        return {"error": str(e)}


# =========================================
# 3. USER INPUT SECTION (UPDATED)
# =========================================
if __name__ == "__main__":

    print("\n🔢 Enter ALL Input Values:")

    try:
        age = float(input("Age: "))
        job = float(input("Job: "))
        housing = float(input("Housing: "))
        saving = float(input("Saving Accounts: "))
        checking = float(input("Checking Account: "))
        credit = float(input("Credit Amount: "))
        duration = float(input("Duration: "))
        purpose = float(input("Purpose: "))
        sex = float(input("Sex: "))
        other = float(input("Other Feature: "))

        # IMPORTANT: Order must match training dataset
        sample = [
            age,
            job,
            housing,
            saving,
            checking,
            credit,
            duration,
            purpose,
            sex,
            other
        ]

        result = predict_credit_risk(sample)

        print("\n📊 Prediction Result:")
        print(result)

        # Friendly output
        if "prediction" in result:
            if result["prediction"] == 1:
                print("⚠️ High Credit Risk")
            else:
                print("✅ Low Credit Risk")

    except Exception as e:
        print("❌ Error:", e)