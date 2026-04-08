import json
from datetime import datetime, timezone

from ..config import MODEL_METADATA_PATH


def load_model_metadata():
    if MODEL_METADATA_PATH.exists():
        try:
            return json.loads(MODEL_METADATA_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {
        "model_name": "best_model.pkl",
        "model_version": "unknown",
        "trained_at_utc": None,
        "feature_schema": ["age", "job", "housing", "saving", "checking", "credit", "duration", "purpose", "sex", "other"],
        "notes": "Metadata file missing. Generate during training.",
    }


def write_model_metadata(model_name: str, model_version: str, feature_schema: list[str], notes: str = ""):
    MODEL_METADATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "model_name": model_name,
        "model_version": model_version,
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "feature_schema": feature_schema,
        "notes": notes,
    }
    MODEL_METADATA_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
