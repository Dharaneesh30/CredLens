# =========================================
# CredLens - Feature Engineering Module
# =========================================

import pandas as pd
import numpy as np

# =========================================
# 1. LOAD DATA
# =========================================
def load_data(path="data/raw/german_credit_data.csv"):
    df = pd.read_csv(path)

    if "Unnamed: 0" in df.columns:
        df.drop("Unnamed: 0", axis=1, inplace=True)

    return df


# =========================================
# 2. FEATURE ENGINEERING FUNCTION
# =========================================
def create_features(df):

    print("⚙️ Applying Feature Engineering...")

    # -----------------------------------------
    # 1. Credit per Duration
    # -----------------------------------------
    df["Credit_per_Duration"] = df["Credit amount"] / df["Duration"]

    # -----------------------------------------
    # 2. Age Group (Binning)
    # -----------------------------------------
    df["Age_Group"] = pd.cut(
        df["Age"],
        bins=[18, 30, 50, 100],
        labels=[0, 1, 2]
    ).astype(int)

    # -----------------------------------------
    # 3. Risk Index (interaction feature)
    # -----------------------------------------
    df["Risk_Index"] = df["Credit amount"] * df["Duration"]

    # -----------------------------------------
    # 4. Log Transformation (reduce skewness)
    # -----------------------------------------
    df["Log_Credit"] = np.log1p(df["Credit amount"])

    # -----------------------------------------
    # 5. Duration Category
    # -----------------------------------------
    df["Duration_Category"] = pd.cut(
        df["Duration"],
        bins=[0, 12, 24, 60],
        labels=[0, 1, 2]
    ).astype(int)

    print("✅ Feature Engineering Completed!")

    return df


# =========================================
# 3. MAIN FUNCTION
# =========================================
def feature_engineering_pipeline():

    df = load_data()
    df = create_features(df)

    return df


# =========================================
# RUN FILE
# =========================================
if __name__ == "__main__":

    df = feature_engineering_pipeline()

    print("\nNew Columns Added:")
    print(df.columns)