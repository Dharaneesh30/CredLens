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
# 2. HELPER FUNCTIONS
# =========================================
def calculate_credit_score(probability):
    return int(300 + probability * 550)


def classify_risk(score):
    if score < 500:
        return "High Risk"
    elif score < 700:
        return "Medium Risk"
    return "Low Risk"


def loan_decision(score):
    return "Approved" if score >= 650 else "Rejected"


def generate_analysis(input_data, prediction, probability):
    age, job, housing, saving, checking, credit, duration, purpose, sex, other = input_data

    score = calculate_credit_score(probability)
    risk_level = classify_risk(score)
    decision = loan_decision(score)

    analysis = [
        f"Predicted risk status: {'High Risk' if prediction == 1 else 'Low Risk'}.",
        f"Model confidence for high risk is {(probability * 100):.1f}%.",
        f"Computed credit score is {score}, which is classified as {risk_level}.",
        f"Loan decision based on score is: {decision}."
    ]

    if credit > 20000:
        analysis.append("The requested credit amount is high, which raises risk and may require stronger approval checks.")
    elif credit > 10000:
        analysis.append("The credit amount is moderate; duration and savings are important for repayment assessment.")
    else:
        analysis.append("The credit amount is relatively low, which supports a more favorable risk profile.")

    if duration > 36:
        analysis.append("A long repayment period can increase overall risk, especially for high amounts.")
    else:
        analysis.append("A shorter repayment period helps reduce risk for this application.")

    if saving <= 1:
        analysis.append("Low or unspecified savings indicate limited financial buffer for loan repayment.")
    else:
        analysis.append("Savings appear sufficient to support the applicant's repayment capacity.")

    if job >= 3:
        analysis.append("Higher job level supports greater income stability.")
    elif job <= 1:
        analysis.append("Lower job level may indicate less stable income and higher risk.")
    else:
        analysis.append("Job level is average; evaluate additional profile details for final approval.")

    if housing == 0:
        analysis.append("Homeownership typically correlates with lower credit risk.")
    elif housing == 1:
        analysis.append("Renting may increase risk compared to owning a home.")
    else:
        analysis.append("Free housing reduces living cost pressure and can improve repayment strength.")

    if purpose == 0:
        analysis.append("Purpose unspecified or other; review more details before final approval.")
    else:
        analysis.append("Loan purpose seems defined, which helps explain the request context.")

    return analysis


# =========================================
# 3. PREDICTION FUNCTION
# =========================================
def predict_credit_risk(input_data):
    try:
        data = np.array(input_data).reshape(1, -1)

        prediction = model.predict(data)[0]
        probability = float(model.predict_proba(data)[0][1])
        score = calculate_credit_score(probability)
        risk_level = classify_risk(score)
        decision = loan_decision(score)
        analysis = generate_analysis(input_data, prediction, probability)

        result = {
            "prediction": int(prediction),
            "probability": float(round(probability, 4)),
            "credit_score": score,
            "risk_level": risk_level,
            "loan_decision": decision,
            "analysis": analysis
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