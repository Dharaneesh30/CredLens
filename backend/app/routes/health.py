from fastapi import APIRouter

from ..config import OLLAMA_CHAT_URL
from ..services.metrics_service import metrics_service
from ..services.model_service import model_service
from urllib import request as urlrequest
from urllib.error import URLError, HTTPError

health_router = APIRouter()


@health_router.get("/")
def home():
    return {"message": "CredLens API running"}


@health_router.get("/health")
def health():
    return {"status": "ok"}


@health_router.get("/metrics")
def metrics():
    return metrics_service.snapshot()


@health_router.get("/health/model")
def health_model():
    try:
        model_service._load_model()
        return {"status": "ok", "model_loaded": True}
    except Exception as exc:
        return {"status": "error", "model_loaded": False, "error": str(exc)}


@health_router.get("/health/ollama")
def health_ollama():
    tags_url = OLLAMA_CHAT_URL.replace("/api/chat", "/api/tags")
    try:
        with urlrequest.urlopen(tags_url, timeout=5) as resp:
            data = resp.read().decode("utf-8")
            return {"status": "ok", "reachable": True, "details": data[:300]}
    except (URLError, HTTPError, TimeoutError, OSError) as exc:
        return {"status": "error", "reachable": False, "error": str(exc)}
