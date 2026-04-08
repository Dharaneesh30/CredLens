from fastapi import APIRouter
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse

from ..services.metrics_service import metrics_service
from ..services.model_service import model_service


prediction_router = APIRouter()


class PredictRequest(BaseModel):
    input: list[float] = Field(..., min_length=10, max_length=10)


@prediction_router.post("/predict")
def predict(payload: PredictRequest):
    try:
        result = model_service.predict(payload.input)
        metrics_service.incr("predict_requests")
        if result.get("decision") == "Approve":
            metrics_service.incr("predict_decision_approve")
        elif result.get("decision") == "Conditional Approval":
            metrics_service.incr("predict_decision_conditional")
        elif result.get("decision") == "Manual Review":
            metrics_service.incr("predict_decision_manual_review")
        else:
            metrics_service.incr("predict_decision_review_reject")
        return result
    except Exception as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
