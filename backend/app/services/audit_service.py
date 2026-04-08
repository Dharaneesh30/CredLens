import json
from datetime import datetime, timezone
from hashlib import sha256

from ..config import ADVISOR_AUDIT_LOG_PATH


def _ensure_parent_dir():
    ADVISOR_AUDIT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)


def build_applicant_id(applicant: dict) -> str:
    key_fields = [
        str(applicant.get("age", "")),
        str(applicant.get("job", "")),
        str(applicant.get("credit", "")),
        str(applicant.get("duration", "")),
        str(applicant.get("purpose", "")),
    ]
    payload = "|".join(key_fields)
    return sha256(payload.encode("utf-8")).hexdigest()[:16]


def append_advisor_audit(record: dict):
    _ensure_parent_dir()
    enriched = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        **record,
    }
    with ADVISOR_AUDIT_LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(enriched, ensure_ascii=True) + "\n")


def get_recent_advisor_audit(limit: int = 20, applicant_id: str | None = None):
    if not ADVISOR_AUDIT_LOG_PATH.exists():
        return []
    lines = ADVISOR_AUDIT_LOG_PATH.read_text(encoding="utf-8").splitlines()
    recent = lines[-max(1, min(limit, 100)) :]
    records = []
    for line in recent:
        try:
            record = json.loads(line)
            if applicant_id and record.get("applicant_id") != applicant_id:
                continue
            records.append(record)
        except json.JSONDecodeError:
            continue
    return records
