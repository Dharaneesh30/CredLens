import sys
from pathlib import Path

import uvicorn


ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app import create_app


app = create_app()


if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=5000, reload=True)
