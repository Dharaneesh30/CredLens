# =========================================
# CredLens - Model Evaluation Module
# =========================================

import joblib
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_curve,
    roc_auc_score
)

# Import preprocessing
from data_preprocessing import preprocess_pipeline

# =========================================
# 1. LOAD DATA
# =========================================
X_train, X_test, y_train, y_test = preprocess_pipeline()

# =========================================
# 2. LOAD BEST 4 MODELS
# =========================================
models = {
    "Random Forest": joblib.load("models/random_forest.pkl"),
    "XGBoost": joblib.load("models/xgboost.pkl"),
    "Gradient Boosting": joblib.load("models/gradient_boosting.pkl"),
    "Logistic Regression": joblib.load("models/logistic_regression.pkl")
}

results = []

# =========================================
# 3. EVALUATION LOOP
# =========================================
for name, model in models.items():

    print(f"\n📊 Evaluating {name}...")

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc = roc_auc_score(y_test, y_prob)

    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"ROC-AUC  : {roc:.4f}")

    results.append({
        "Model": name,
        "Accuracy": acc,
        "Precision": prec,
        "Recall": rec,
        "F1 Score": f1,
        "ROC-AUC": roc
    })

    # =========================================
    # 4. CONFUSION MATRIX
    # =========================================
    cm = confusion_matrix(y_test, y_pred)

    plt.figure()
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
    plt.title(f"{name} - Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")

    plt.savefig(f"results/{name.replace(' ', '_')}_confusion_matrix.png")
    plt.close()

    # =========================================
    # 5. ROC CURVE
    # =========================================
    fpr, tpr, _ = roc_curve(y_test, y_prob)

    plt.figure()
    plt.plot(fpr, tpr, label=f"{name} (AUC = {roc:.2f})")
    plt.plot([0, 1], [0, 1], linestyle="--")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(f"{name} - ROC Curve")
    plt.legend()

    plt.savefig(f"results/{name.replace(' ', '_')}_roc_curve.png")
    plt.close()

# =========================================
# 6. SAVE RESULTS TABLE
# =========================================
results_df = pd.DataFrame(results)
results_df.to_csv("results/evaluation_report.csv", index=False)

print("\n📊 Final Evaluation Report:")
print(results_df)

# =========================================
# 7. BEST MODEL
# =========================================
best_model = results_df.sort_values(by="ROC-AUC", ascending=False).iloc[0]

print("\n🏆 Best Model Based on ROC-AUC:")
print(best_model)