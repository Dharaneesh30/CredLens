from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ..config import RESULTS_DIR


charts_router = APIRouter()


@charts_router.get("/charts")
def charts():
    images = [f.name for f in RESULTS_DIR.glob("*.png")]
    return {"images": images}


@charts_router.get("/chart/{filename}")
def get_chart(filename):
    file_path = RESULTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Chart not found")
    return FileResponse(str(file_path))
