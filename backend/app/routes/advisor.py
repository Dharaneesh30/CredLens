from fastapi import APIRouter
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse

from ..services.advisor_service import advisor_service
from ..services.audit_service import get_recent_advisor_audit
from ..services.metrics_service import metrics_service


advisor_router = APIRouter()


class AdvisorRequest(BaseModel):
    applicant_data: dict = Field(default_factory=dict)
    prediction_result: dict = Field(default_factory=dict)
    user_query: str = Field(default="", max_length=1200)
    model: str | None = None


class AdvisorResponseSchema(BaseModel):
    decision: str
    rationale: list[str]
    risks: list[str]
    mitigations: list[str]
    conditions_to_approve: list[str]
    final_perspective: str
    user_question: str | None = None


class AdvisorEnvelope(BaseModel):
    model: str
    source: str
    advisor_response: AdvisorResponseSchema


@advisor_router.post("/loan-advisor", response_model=AdvisorEnvelope)
def loan_advisor(payload: AdvisorRequest):
    try:
        applicant = payload.applicant_data
        prediction_result = payload.prediction_result
        user_query = payload.user_query
        model_name = payload.model

        if not applicant or not prediction_result:
            return JSONResponse(
                status_code=400,
                content={"error": "applicant_data and prediction_result are required."},
            )

        suggestion = advisor_service.get_advice(
            applicant=applicant,
            prediction_result=prediction_result,
            user_query=user_query,
            model_name=model_name,
        )
        metrics_service.incr("advisor_requests")
        metrics_service.incr(f"advisor_source_{suggestion.get('source','unknown')}")
        return suggestion
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})


@advisor_router.get("/loan-advisor/history")
def loan_advisor_history(limit: int = 20, applicant_id: str | None = None):
    return {"records": get_recent_advisor_audit(limit=limit, applicant_id=applicant_id)}
