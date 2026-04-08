from pathlib import Path
import os


ROOT_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT_DIR / "models"
RESULTS_DIR = ROOT_DIR / "results"
DATA_DIR = ROOT_DIR / "data"
AUDIT_DIR = DATA_DIR / "audit"

BEST_MODEL_PATH = MODELS_DIR / "best_model.pkl"
DEFAULT_OLLAMA_MODEL = "llama3.2"
OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat"

RISK_CLASS_LABEL = 1
LOW_CONFIDENCE_THRESHOLD = 0.60
ADVISOR_MAX_QUERY_CHARS = 1200
ADVISOR_AUDIT_LOG_PATH = AUDIT_DIR / "advisor_history.jsonl"
MODEL_METADATA_PATH = MODELS_DIR / "model_metadata.json"
MODEL_CALIBRATOR_PATH = MODELS_DIR / "risk_calibrator.pkl"

RISK_APPROVE_THRESHOLD = float(os.getenv("RISK_APPROVE_THRESHOLD", "0.35"))
RISK_CONDITIONAL_THRESHOLD = float(os.getenv("RISK_CONDITIONAL_THRESHOLD", "0.50"))
RISK_POSITIVE_CLASS_THRESHOLD = float(os.getenv("RISK_POSITIVE_CLASS_THRESHOLD", "0.50"))

ENABLE_API_KEY_AUTH = os.getenv("ENABLE_API_KEY_AUTH", "false").lower() == "true"
API_KEY_HEADER = os.getenv("API_KEY_HEADER", "x-api-key")
API_KEY_VALUE = os.getenv("CREDLENS_API_KEY", "")

ENABLE_RATE_LIMIT = os.getenv("ENABLE_RATE_LIMIT", "true").lower() == "true"
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
