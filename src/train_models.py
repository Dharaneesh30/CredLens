# =========================================
# CredLens - Model Training Module
# =========================================

import os
import joblib
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score

from xgboost import XGBClassifier

# Import preprocessing
from data_preprocessing import preprocess_pipeline


# =========================================
# 1. CREATE FOLDERS IF NOT EXIST
# =========================================
os.makedirs("models", exist_ok=True)
os.makedirs("results", exist_ok=True)


# =========================================
# 2. LOAD PREPROCESSED DATA
# =========================================
print("🔄 Loading and preprocessing data...")
X_train, X_test, y_train, y_test = preprocess_pipeline()


# =========================================
# 3. DEFINE MODELS (TOP 4)
# =========================================
models = {
    "Logistic_Regression": LogisticRegression(max_iter=1000),
    "Random_Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss'),
    "Gradient_Boosting": GradientBoostingClassifier()
}


# =========================================
# 4. TRAIN & EVALUATE
# =========================================
results = []

for name, model in models.items():

    print(f"\n🚀 Training {name}...")

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    roc = roc_auc_score(y_test, y_prob)

    print(f"Accuracy : {acc:.4f}")
    print(f"ROC-AUC  : {roc:.4f}")

    results.append({
        "Model": name,
        "Accuracy": acc,
        "ROC-AUC": roc
    })

    # Save model
    model_path = f"models/{name.lower()}.pkl"
    joblib.dump(model, model_path)


# =========================================
# 5. SAVE RESULTS
# =========================================
results_df = pd.DataFrame(results)
results_df.to_csv("results/model_comparison.csv", index=False)

print("\n📊 Model Comparison:")
print(results_df)


# =========================================
# 6. SELECT BEST MODEL
# =========================================
best_model = results_df.sort_values(by="ROC-AUC", ascending=False).iloc[0]

print("\n🏆 Best Model:")
print(best_model)

# Save best model separately
best_model_name = best_model["Model"].lower()
joblib.dump(models[best_model["Model"]], "models/best_model.pkl")

print("\n✅ Best model saved as: models/best_model.pkl")