from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
import time

from .routes.advisor import advisor_router
from .routes.charts import charts_router
from .routes.dataset import dataset_router
from .routes.health import health_router
from .routes.prediction import prediction_router
from .services.metrics_service import metrics_service
from .services.security_service import security_service


def create_app():
    app = FastAPI(title="CredLens API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(prediction_router)
    app.include_router(dataset_router)
    app.include_router(charts_router)
    app.include_router(advisor_router)

    @app.middleware("http")
    async def telemetry_and_security_middleware(request: Request, call_next):
        path = request.url.path
        if path not in {"/", "/health", "/health/model", "/health/ollama", "/metrics"}:
            security_service.check_api_key(request)
            security_service.check_rate_limit(request)

        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000
        metrics_service.observe_latency(path, elapsed_ms)
        metrics_service.incr(f"http_{response.status_code}")
        metrics_service.incr("http_requests_total")
        return response

    return app
