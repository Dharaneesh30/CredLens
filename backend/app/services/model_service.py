from pathlib import Path

import joblib
import numpy as np

from ..config import (
    BEST_MODEL_PATH,
    LOW_CONFIDENCE_THRESHOLD,
    MODEL_CALIBRATOR_PATH,
    RISK_APPROVE_THRESHOLD,
    RISK_CLASS_LABEL,
    RISK_CONDITIONAL_THRESHOLD,
    RISK_POSITIVE_CLASS_THRESHOLD,
)
from .metrics_service import metrics_service
from .model_metadata_service import load_model_metadata
from .policy_service import evaluate_policy


class ModelService:
    def __init__(self, model_path: Path = BEST_MODEL_PATH):
        self._model_path = model_path
        self._model = None
        self._calibrator = None

    def _load_model(self):
        if self._model is None:
            self._model = joblib.load(self._model_path)
        return self._model

    def _load_calibrator(self):
        if self._calibrator is None and MODEL_CALIBRATOR_PATH.exists():
            try:
                self._calibrator = joblib.load(MODEL_CALIBRATOR_PATH)
            except Exception:
                self._calibrator = None
        return self._calibrator

    def predict(self, raw_input):
        if raw_input is None:
            raise ValueError("Missing input payload.")
        features = np.array(raw_input).reshape(1, -1)
        model = self._load_model()
        prediction_label = int(model.predict(features)[0])
        proba = model.predict_proba(features)[0]
        classes = list(getattr(model, "classes_", [0, 1]))

        if RISK_CLASS_LABEL in classes:
            risk_idx = classes.index(RISK_CLASS_LABEL)
            risk_probability = float(proba[risk_idx])
        else:
            risk_probability = float(proba[-1])

        calibrator = self._load_calibrator()
        if calibrator is not None:
            try:
                risk_probability = float(calibrator.predict_proba([[risk_probability]])[0][1])
            except Exception:
                pass

        confidence = float(max(risk_probability, 1 - risk_probability))
        risk_prediction = int(1 if risk_probability >= RISK_POSITIVE_CLASS_THRESHOLD else 0)
        credit_score = int(min(850, max(300, round(850 - risk_probability * 550))))

        applicant = self._to_applicant_dict(raw_input)
        policy = evaluate_policy(applicant, risk_probability, confidence)
        factors = self._explain_factors(applicant, model, features)
        metrics_service.observe_risk_probability(risk_probability)

        decision = policy.decision
        if confidence < LOW_CONFIDENCE_THRESHOLD:
            decision = "Manual Review"
        elif risk_probability < RISK_APPROVE_THRESHOLD:
            decision = "Approve"
        elif risk_probability < RISK_CONDITIONAL_THRESHOLD:
            decision = "Conditional Approval"
        else:
            decision = "Review / Reject"

        metadata = load_model_metadata()

        return {
            "prediction": risk_prediction,
            "prediction_label": prediction_label,
            "probability": risk_probability,
            "confidence": confidence,
            "credit_score": credit_score,
            "decision": decision,
            "policy_reasons": policy.reasons,
            "policy_conditions": policy.conditions_to_approve,
            "top_factors": factors,
            "model_metadata": metadata,
        }

    @staticmethod
    def _to_applicant_dict(raw_input):
        values = [float(v) for v in raw_input]
        keys = ["age", "job", "housing", "saving", "checking", "credit", "duration", "purpose", "sex", "other"]
        return dict(zip(keys, values))

    @staticmethod
    def _explain_factors(applicant: dict, model=None, features=None):
        # SHAP-based explainability when available; fallback to deterministic heuristics.
        if model is not None and features is not None:
            try:
                import shap  # type: ignore

                explainer = shap.Explainer(model)
                shap_values = explainer(features)
                values = np.array(shap_values.values)[0]
                names = ["age", "job", "housing", "saving", "checking", "credit", "duration", "purpose", "sex", "other"]
                pairs = sorted(
                    [(names[i], float(values[i])) for i in range(min(len(names), len(values)))],
                    key=lambda x: abs(x[1]),
                    reverse=True,
                )[:5]
                mapped = []
                for name, val in pairs:
                    mapped.append(
                        {
                            "feature": name,
                            "impact": "negative" if val > 0 else "positive",
                            "reason": f"SHAP contribution={val:.4f}",
                        }
                    )
                if mapped:
                    return mapped
            except Exception:
                pass

        factors: list[dict] = []
        credit = applicant.get("credit", 0)
        duration = applicant.get("duration", 0)
        saving = applicant.get("saving", 0)
        job = applicant.get("job", 0)
        housing = applicant.get("housing", 0)

        if credit > 20000:
            factors.append({"feature": "credit", "impact": "negative", "reason": "High requested amount increases default exposure."})
        elif credit < 8000:
            factors.append({"feature": "credit", "impact": "positive", "reason": "Lower loan amount reduces repayment pressure."})

        if duration > 36:
            factors.append({"feature": "duration", "impact": "negative", "reason": "Long tenure increases uncertainty and default window."})
        else:
            factors.append({"feature": "duration", "impact": "positive", "reason": "Short tenure tends to reduce uncertainty."})

        if saving <= 1:
            factors.append({"feature": "saving", "impact": "negative", "reason": "Low savings indicate weaker financial buffer."})
        else:
            factors.append({"feature": "saving", "impact": "positive", "reason": "Better savings suggest stronger repayment resilience."})

        if job >= 3:
            factors.append({"feature": "job", "impact": "positive", "reason": "Higher job score implies better income stability."})
        elif job <= 1:
            factors.append({"feature": "job", "impact": "negative", "reason": "Lower job score may increase repayment risk."})

        if housing == 0:
            factors.append({"feature": "housing", "impact": "positive", "reason": "Owned housing can correlate with lower lending risk."})
        elif housing == 1:
            factors.append({"feature": "housing", "impact": "negative", "reason": "Rental housing may indicate less financial cushion."})

        return factors[:5]


model_service = ModelService()
