from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT_DIR / "models"
RESULTS_DIR = ROOT_DIR / "results"

BEST_MODEL_PATH = MODELS_DIR / "best_model.pkl"
DEFAULT_OLLAMA_MODEL = "llama3.2"
OLLAMA_CHAT_URL = "http://127.0.0.1:11434/api/chat"
