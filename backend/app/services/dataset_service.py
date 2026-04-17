from __future__ import annotations

import io

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from .policy_service import evaluate_policy


REQUIRED_COLUMNS = {
    "age": ["age"],
    "income": ["income", "annual_income"],
    "employment_years": ["employment_years", "employment years", "years_employed"],
    "loan_amount": ["loan_amount", "loan amount", "credit amount"],
    "credit_score": ["credit_score", "credit score"],
    "debt_to_income": ["debt_to_income", "debt to income", "dti"],
    "num_credit_lines": ["num_credit_lines", "num credit lines", "credit_lines"],
    "home_ownership": ["home_ownership", "home ownership"],
    "purpose": ["purpose", "loan_purpose", "loan purpose"],
}

OPTIONAL_COLUMNS = {
    "target": ["target", "default", "loan_default", "label"],
}

NUMERIC_FIELDS = [
    "age",
    "income",
    "employment_years",
    "loan_amount",
    "credit_score",
    "debt_to_income",
    "num_credit_lines",
]
CATEGORICAL_FIELDS = ["home_ownership", "purpose"]
DISPLAY_FIELDS = NUMERIC_FIELDS + CATEGORICAL_FIELDS


def _normalize_name(value: str) -> str:
    return "".join(ch.lower() for ch in str(value).strip() if ch.isalnum())


class DatasetService:
    @staticmethod
    def _read_csv_bytes(file_bytes: bytes) -> pd.DataFrame:
        if not file_bytes:
            raise ValueError("Uploaded file is empty.")
        return pd.read_csv(io.BytesIO(file_bytes))

    @staticmethod
    def _resolve_columns(df: pd.DataFrame) -> dict[str, str | None]:
        normalized_map = {_normalize_name(column): column for column in df.columns}
        resolved: dict[str, str | None] = {}
        for canonical, aliases in {**REQUIRED_COLUMNS, **OPTIONAL_COLUMNS}.items():
            resolved[canonical] = None
            for alias in aliases:
                match = normalized_map.get(_normalize_name(alias))
                if match is not None:
                    resolved[canonical] = match
                    break
        return resolved

    @staticmethod
    def _build_working_frame(df: pd.DataFrame, column_map: dict[str, str | None]) -> pd.DataFrame:
        payload: dict[str, pd.Series] = {}
        for canonical in REQUIRED_COLUMNS:
            payload[canonical] = df[column_map[canonical]]
        if column_map.get("target") is not None:
            payload["target"] = df[column_map["target"]]
        working = pd.DataFrame(payload).copy()

        for column in NUMERIC_FIELDS:
            working[column] = pd.to_numeric(working[column], errors="coerce")
        for column in CATEGORICAL_FIELDS:
            working[column] = working[column].astype(str).replace({"nan": "UNKNOWN", "None": "UNKNOWN"}).fillna("UNKNOWN")
        if "target" in working.columns:
            working["target"] = pd.to_numeric(working["target"], errors="coerce")
        return working

    @staticmethod
    def _build_pipeline() -> Pipeline:
        preprocessor = ColumnTransformer(
            transformers=[
                (
                    "num",
                    Pipeline(
                        steps=[
                            ("imputer", SimpleImputer(strategy="median")),
                            ("scaler", StandardScaler()),
                        ]
                    ),
                    NUMERIC_FIELDS,
                ),
                (
                    "cat",
                    Pipeline(
                        steps=[
                            ("imputer", SimpleImputer(strategy="most_frequent")),
                            ("onehot", OneHotEncoder(handle_unknown="ignore")),
                        ]
                    ),
                    CATEGORICAL_FIELDS,
                ),
            ]
        )
        return Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
            ]
        )

    @staticmethod
    def _heuristic_probability(row: pd.Series) -> float:
        credit_component = 1 - min(max((float(row["credit_score"]) - 300) / 550, 0), 1)
        dti_component = min(max(float(row["debt_to_income"]), 0), 1)
        income = max(float(row["income"]), 1.0)
        loan_to_income = min(max(float(row["loan_amount"]) / income, 0), 1.5) / 1.5
        employment_component = 1 - min(max(float(row["employment_years"]) / 12, 0), 1)
        credit_lines_component = 1 - min(max(float(row["num_credit_lines"]) / 12, 0), 1)
        home_component = 0.25 if str(row["home_ownership"]).upper() == "RENT" else 0.05
        purpose_component = 0.22 if str(row["purpose"]).lower() in {"personal", "business"} else 0.08

        weighted = (
            0.28 * credit_component
            + 0.24 * dti_component
            + 0.18 * loan_to_income
            + 0.12 * employment_component
            + 0.08 * credit_lines_component
            + 0.05 * home_component
            + 0.05 * purpose_component
        )
        return float(min(max(weighted, 0.02), 0.98))

    def _score_probabilities(self, working: pd.DataFrame) -> tuple[np.ndarray, str]:
        if "target" not in working.columns:
            probabilities = np.array([self._heuristic_probability(row) for _, row in working.iterrows()])
            return probabilities, "heuristic_risk_engine"

        labeled = working.dropna(subset=["target"]).copy()
        if labeled.empty or labeled["target"].nunique() < 2:
            probabilities = np.array([self._heuristic_probability(row) for _, row in working.iterrows()])
            return probabilities, "heuristic_risk_engine"

        labels = labeled["target"].astype(int)
        min_class_size = int(labels.value_counts().min())
        if min_class_size < 2:
            probabilities = np.array([self._heuristic_probability(row) for _, row in working.iterrows()])
            return probabilities, "heuristic_risk_engine"

        cv_splits = min(5, min_class_size)
        pipeline = self._build_pipeline()
        X = labeled[NUMERIC_FIELDS + CATEGORICAL_FIELDS]
        probabilities = cross_val_predict(
            pipeline,
            X,
            labels,
            cv=StratifiedKFold(n_splits=cv_splits, shuffle=True, random_state=42),
            method="predict_proba",
        )[:, 1]

        full_scores = np.array([self._heuristic_probability(row) for _, row in working.iterrows()])
        full_scores[labeled.index.to_numpy()] = probabilities
        return full_scores, "uploaded_dataset_logistic_regression"

    @staticmethod
    def _build_top_factors(row: pd.Series) -> list[dict]:
        factors: list[dict] = []
        if float(row["credit_score"]) < 580:
            factors.append({"feature": "credit_score", "impact": "negative", "reason": "Low bureau score weakens the repayment profile."})
        elif float(row["credit_score"]) > 700:
            factors.append({"feature": "credit_score", "impact": "positive", "reason": "Strong credit score supports approval confidence."})

        if float(row["debt_to_income"]) > 0.45:
            factors.append({"feature": "debt_to_income", "impact": "negative", "reason": "High debt-to-income ratio indicates repayment strain."})
        else:
            factors.append({"feature": "debt_to_income", "impact": "positive", "reason": "Debt-to-income level remains within a manageable range."})

        if float(row["loan_amount"]) > float(row["income"]) * 0.45:
            factors.append({"feature": "loan_amount", "impact": "negative", "reason": "Loan amount is high relative to annual income."})
        else:
            factors.append({"feature": "loan_amount", "impact": "positive", "reason": "Requested amount appears proportionate to income."})

        if float(row["employment_years"]) < 2:
            factors.append({"feature": "employment_years", "impact": "negative", "reason": "Limited employment history reduces stability confidence."})
        else:
            factors.append({"feature": "employment_years", "impact": "positive", "reason": "Employment tenure suggests stable earnings."})

        if str(row["home_ownership"]).upper() == "RENT":
            factors.append({"feature": "home_ownership", "impact": "negative", "reason": "Rental status can reduce financial cushion."})
        else:
            factors.append({"feature": "home_ownership", "impact": "positive", "reason": "Owned housing generally supports stronger resilience."})

        return factors[:5]

    @staticmethod
    def _build_decision_distribution(applicants: list[dict]) -> list[dict]:
        palette = {
            "Approve": "#29c46d",
            "Conditional Approval": "#f4b942",
            "Manual Review": "#4aa8ff",
            "Review / Reject": "#ff6b6b",
        }
        counts: dict[str, int] = {}
        for applicant in applicants:
            decision = applicant["decision"]
            counts[decision] = counts.get(decision, 0) + 1
        return [{"name": name, "value": count, "fill": palette.get(name, "#9fb0c8")} for name, count in counts.items()]

    @staticmethod
    def _build_risk_band_distribution(applicants: list[dict]) -> list[dict]:
        bands = {"Low Risk": 0, "Guarded": 0, "Elevated": 0, "High Risk": 0}
        for applicant in applicants:
            prob = float(applicant["probability"])
            if prob < 0.25:
                bands["Low Risk"] += 1
            elif prob < 0.5:
                bands["Guarded"] += 1
            elif prob < 0.75:
                bands["Elevated"] += 1
            else:
                bands["High Risk"] += 1
        colors = {
            "Low Risk": "#29c46d",
            "Guarded": "#6ec5ff",
            "Elevated": "#f4b942",
            "High Risk": "#ff6b6b",
        }
        return [{"name": name, "value": count, "fill": colors[name]} for name, count in bands.items()]

    @staticmethod
    def _build_score_distribution(applicants: list[dict]) -> list[dict]:
        buckets = {"300-499": 0, "500-649": 0, "650-749": 0, "750-850": 0}
        for applicant in applicants:
            score = int(applicant["credit_score"])
            if score < 500:
                buckets["300-499"] += 1
            elif score < 650:
                buckets["500-649"] += 1
            elif score < 750:
                buckets["650-749"] += 1
            else:
                buckets["750-850"] += 1
        return [{"range": name, "count": count} for name, count in buckets.items()]

    @staticmethod
    def _build_purpose_distribution(applicants: list[dict]) -> list[dict]:
        counts: dict[str, int] = {}
        for applicant in applicants:
            purpose = str(applicant["display_profile"].get("purpose", "Unknown"))
            counts[purpose] = counts.get(purpose, 0) + 1
        return [{"name": name, "count": count} for name, count in sorted(counts.items(), key=lambda item: item[1], reverse=True)[:8]]

    @staticmethod
    def _build_exposure_by_decision(applicants: list[dict]) -> list[dict]:
        totals: dict[str, float] = {}
        for applicant in applicants:
            decision = str(applicant["decision"])
            totals[decision] = totals.get(decision, 0.0) + float(applicant["applicant_data"]["loan_amount"])
        return [{"name": name, "value": round(total, 2)} for name, total in totals.items()]

    @staticmethod
    def _build_portfolio_insights(applicants: list[dict], summary: dict) -> list[str]:
        top_risk = max(applicants, key=lambda item: item["probability"])
        safest = min(applicants, key=lambda item: item["probability"])
        largest_loan = max(applicants, key=lambda item: item["applicant_data"]["loan_amount"])
        insights = [
            f"{summary['approve_count']} of {summary['total_applicants']} applicants qualify for direct approval, while {summary['review_count']} are in reject or deep-review territory.",
            f"The portfolio average predicted default probability is {summary['average_risk_probability']}%, with an average bureau score of {summary['average_credit_score']}.",
            f"Highest-risk applicant is {top_risk['applicant_id']} at {round(top_risk['probability'] * 100, 1)}% risk and a {top_risk['decision']} outcome.",
            f"Safest applicant is {safest['applicant_id']} at {round(safest['probability'] * 100, 1)}% risk with credit score {safest['credit_score']}.",
            f"Largest requested exposure belongs to {largest_loan['applicant_id']} with a loan amount of {round(largest_loan['applicant_data']['loan_amount'], 2)}.",
        ]
        if summary.get("actual_default_rate") is not None:
            insights.append(f"The uploaded dataset reports an actual default rate of {summary['actual_default_rate']}%, which helps benchmark the modelled risk mix.")
        return insights

    def analyze_dataset(self, file_bytes: bytes, filename: str | None = None) -> dict:
        df = self._read_csv_bytes(file_bytes)
        column_map = self._resolve_columns(df)

        missing = [canonical for canonical in REQUIRED_COLUMNS if column_map.get(canonical) is None]
        if missing:
            raise ValueError(
                "Missing required dataset columns: "
                + ", ".join(missing)
                + ". Upload a CSV with age, income, employment_years, loan_amount, credit_score, debt_to_income, "
                + "num_credit_lines, home_ownership, purpose, and optionally target."
            )

        working = self._build_working_frame(df, column_map)
        probabilities, model_name = self._score_probabilities(working)

        applicants: list[dict] = []
        invalid_rows: list[dict] = []

        for row_number, (_, row) in enumerate(working.iterrows()):
            try:
                if row[NUMERIC_FIELDS].isna().any():
                    raise ValueError("Numeric fields contain missing or invalid values.")

                probability = float(min(max(probabilities[row_number], 0.001), 0.999))
                confidence = float(max(probability, 1 - probability))
                credit_score = int(min(max(round(float(row["credit_score"])), 300), 850))
                prediction = int(probability >= 0.5)
                applicant_data = {
                    "age": float(row["age"]),
                    "income": float(row["income"]),
                    "employment_years": float(row["employment_years"]),
                    "loan_amount": float(row["loan_amount"]),
                    "credit_score": credit_score,
                    "debt_to_income": float(row["debt_to_income"]),
                    "num_credit_lines": float(row["num_credit_lines"]),
                    "home_ownership": str(row["home_ownership"]),
                    "purpose": str(row["purpose"]),
                }
                policy = evaluate_policy(applicant_data, probability, confidence)
                applicants.append(
                    {
                        "applicant_id": f"APP-{row_number + 1:04d}",
                        "row_index": row_number,
                        "applicant_data": applicant_data,
                        "display_profile": {field: applicant_data.get(field) for field in DISPLAY_FIELDS},
                        "prediction": prediction,
                        "prediction_label": prediction,
                        "probability": round(probability, 4),
                        "confidence": round(confidence, 4),
                        "credit_score": credit_score,
                        "decision": policy.decision,
                        "policy_reasons": policy.reasons,
                        "policy_conditions": policy.conditions_to_approve,
                        "top_factors": self._build_top_factors(row),
                        "actual_target": None if "target" not in working.columns or pd.isna(row.get("target")) else int(row["target"]),
                        "model_metadata": {
                            "model_name": model_name,
                            "model_version": "dataset-adaptive-v1",
                            "trained_at_utc": None,
                            "feature_schema": NUMERIC_FIELDS + CATEGORICAL_FIELDS,
                            "notes": "Dataset-upload scoring aligned to the uploaded loan default schema.",
                        },
                    }
                )
            except Exception as exc:
                invalid_rows.append({"row_index": row_number, "error": str(exc)})

        if not applicants:
            raise ValueError("No valid applicants could be analyzed from the uploaded dataset.")

        total_loan = sum(float(item["applicant_data"]["loan_amount"]) for item in applicants)
        approve_count = sum(1 for item in applicants if item["decision"] == "Approve")
        conditional_count = sum(1 for item in applicants if item["decision"] == "Conditional Approval")
        manual_review_count = sum(1 for item in applicants if item["decision"] == "Manual Review")
        review_count = sum(1 for item in applicants if item["decision"] == "Review / Reject")
        average_risk_probability = round(sum(float(item["probability"]) for item in applicants) / len(applicants) * 100, 1)
        average_credit_score = round(sum(int(item["credit_score"]) for item in applicants) / len(applicants))
        approval_rate = round(((approve_count + conditional_count) / len(applicants)) * 100, 1)
        high_risk_share = round((sum(1 for item in applicants if float(item["probability"]) >= 0.5) / len(applicants)) * 100, 1)

        actual_targets = [item["actual_target"] for item in applicants if item["actual_target"] is not None]
        actual_default_rate = round(sum(actual_targets) / len(actual_targets) * 100, 1) if actual_targets else None

        summary = {
            "dataset_name": filename or "uploaded_dataset.csv",
            "total_applicants": len(applicants),
            "valid_applicants": len(applicants),
            "invalid_rows": len(invalid_rows),
            "approve_count": approve_count,
            "conditional_count": conditional_count,
            "manual_review_count": manual_review_count,
            "review_count": review_count,
            "approval_rate": approval_rate,
            "high_risk_share": high_risk_share,
            "average_risk_probability": average_risk_probability,
            "average_credit_score": average_credit_score,
            "total_credit_exposure": round(total_loan, 2),
            "actual_default_rate": actual_default_rate,
            "model_name": model_name,
        }

        applicants.sort(key=lambda item: (-float(item["probability"]), -float(item["applicant_data"]["loan_amount"])))

        return {
            "summary": summary,
            "portfolio_insights": self._build_portfolio_insights(applicants, summary),
            "charts": {
                "decision_distribution": self._build_decision_distribution(applicants),
                "risk_band_distribution": self._build_risk_band_distribution(applicants),
                "score_distribution": self._build_score_distribution(applicants),
                "purpose_distribution": self._build_purpose_distribution(applicants),
                "exposure_by_decision": self._build_exposure_by_decision(applicants),
            },
            "applicants": applicants,
            "invalid_rows_preview": invalid_rows[:10],
        }


dataset_service = DatasetService()
