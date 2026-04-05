# =========================================
# CredLens - Data Preprocessing Module
# =========================================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

# =========================================
# 1. LOAD DATA
# =========================================
def load_data(path="data/raw/german_credit_data.csv"):
    df = pd.read_csv(path)

    # Drop unnecessary column
    if "Unnamed: 0" in df.columns:
        df.drop("Unnamed: 0", axis=1, inplace=True)

    return df


# =========================================
# 2. HANDLE MISSING VALUES
# =========================================
def handle_missing_values(df):

    # Fill categorical missing values with 'Unknown'
    cat_cols = df.select_dtypes(include="object").columns
    for col in cat_cols:
        df[col].fillna("Unknown", inplace=True)

    # Fill numerical missing values with median
    num_cols = df.select_dtypes(include=np.number).columns
    for col in num_cols:
        df[col].fillna(df[col].median(), inplace=True)

    return df


# =========================================
# 3. CREATE TARGET VARIABLE (IMPORTANT)
# =========================================
def create_target(df):

    # Creating Risk column based on Credit amount
    df["Risk"] = (df["Credit amount"] > 5000).astype(int)

    return df


# =========================================
# 4. ENCODE CATEGORICAL VARIABLES
# =========================================
def encode_data(df):

    le = LabelEncoder()

    cat_cols = df.select_dtypes(include="object").columns
    for col in cat_cols:
        df[col] = le.fit_transform(df[col])

    return df


# =========================================
# 5. FEATURE & TARGET SPLIT
# =========================================
def split_features(df):

    X = df.drop("Risk", axis=1)
    y = df["Risk"]

    return X, y


# =========================================
# 6. TRAIN TEST SPLIT
# =========================================
def split_data(X, y):

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    return X_train, X_test, y_train, y_test


# =========================================
# 7. FEATURE SCALING
# =========================================
def scale_data(X_train, X_test):

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled


# =========================================
# MAIN FUNCTION (PIPELINE)
# =========================================
def preprocess_pipeline():

    print("🔄 Starting Data Preprocessing...")

    df = load_data()
    df = handle_missing_values(df)
    df = create_target(df)
    df = encode_data(df)

    X, y = split_features(df)
    X_train, X_test, y_train, y_test = split_data(X, y)
    X_train, X_test = scale_data(X_train, X_test)

    print("✅ Preprocessing Completed!")

    return X_train, X_test, y_train, y_test


# =========================================
# RUN FILE
# =========================================
if __name__ == "__main__":
    X_train, X_test, y_train, y_test = preprocess_pipeline()

    print("\nShapes:")
    print("X_train:", X_train.shape)
    print("X_test :", X_test.shape)