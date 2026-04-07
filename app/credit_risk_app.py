# =========================================
# CredLens - Credit Risk App (Streamlit)
# =========================================

import streamlit as st
import joblib
import numpy as np
import os

# =========================================
# 1. LOAD MODEL
# =========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "best_model.pkl")

model = joblib.load(MODEL_PATH)


# =========================================
# 2. CREDIT SCORE FUNCTIONS
# =========================================

def calculate_credit_score(prob):
    return int(300 + prob * 550)


def classify_risk(score):
    if score < 500:
        return "High Risk"
    elif score < 700:
        return "Medium Risk"
    else:
        return "Low Risk"


def loan_decision(score):
    return "Approved" if score >= 650 else "Rejected"


# =========================================
# 3. PREDICTION FUNCTION
# =========================================

def predict(data):
    data = np.array(data).reshape(1, -1)
    prediction = model.predict(data)[0]
    probability = model.predict_proba(data)[0][1]
    return prediction, probability


# =========================================
# 4. STREAMLIT UI
# =========================================

st.set_page_config(page_title="CredLens", layout="centered")

st.title("💳 CredLens - Credit Risk Prediction")

st.markdown("Enter applicant details below:")

# Inputs
age = st.number_input("Age", 18, 100, 30)
job = st.selectbox("Job (0=Unskilled, 3=Highly Skilled)", [0, 1, 2, 3])
housing = st.selectbox("Housing (0=Own,1=Rent,2=Free)", [0, 1, 2])
saving = st.selectbox("Saving Accounts (0-3)", [0, 1, 2, 3])
checking = st.selectbox("Checking Account (0-3)", [0, 1, 2, 3])
credit = st.number_input("Credit Amount", 0, 50000, 5000)
duration = st.number_input("Duration (months)", 1, 60, 12)
purpose = st.selectbox("Purpose (0-4)", [0, 1, 2, 3, 4])
sex = st.selectbox("Sex (0=Female,1=Male)", [0, 1])
other = st.selectbox("Other Feature (0/1)", [0, 1])

# =========================================
# 5. PREDICT BUTTON
# =========================================

if st.button("Predict Credit Risk"):

    input_data = [
        age, job, housing, saving, checking,
        credit, duration, purpose, sex, other
    ]

    prediction, probability = predict(input_data)

    score = calculate_credit_score(probability)
    risk = classify_risk(score)
    decision = loan_decision(score)

    # =========================================
    # DISPLAY RESULTS
    # =========================================

    st.subheader("📊 Prediction Results")

    st.write(f"**Prediction:** {'High Risk' if prediction == 1 else 'Low Risk'}")
    st.write(f"**Probability:** {round(probability, 2)}")
    st.write(f"**Credit Score:** {score}")
    st.write(f"**Risk Level:** {risk}")
    st.write(f"**Loan Decision:** {decision}")

    # Color feedback
    if decision == "Approved":
        st.success("Loan Approved ✅")
    else:
        st.error("Loan Rejected ❌")