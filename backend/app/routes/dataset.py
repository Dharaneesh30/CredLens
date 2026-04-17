from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse

from ..services.dataset_service import dataset_service
from ..services.metrics_service import metrics_service


dataset_router = APIRouter()


@dataset_router.post("/analyze-dataset")
async def analyze_dataset(file: UploadFile = File(...)):
    try:
        if not file.filename or not file.filename.lower().endswith(".csv"):
            return JSONResponse(status_code=400, content={"error": "Please upload a CSV file."})

        payload = await file.read()
        result = dataset_service.analyze_dataset(payload, filename=file.filename)
        metrics_service.incr("dataset_analysis_requests")
        metrics_service.incr("dataset_rows_processed", result["summary"]["total_applicants"])
        return result
    except Exception as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
