from pathlib import Path

import joblib
import numpy as np

from ..config import BEST_MODEL_PATH


class ModelService:
    def __init__(self, model_path: Path = BEST_MODEL_PATH):
        self._model_path = model_path
        self._model = None

    def _load_model(self):
        if self._model is None:
            self._model = joblib.load(self._model_path)
        return self._model

    def predict(self, raw_input):
        if raw_input is None:
            raise ValueError("Missing input payload.")
        features = np.array(raw_input).reshape(1, -1)
        model = self._load_model()
        prediction = int(model.predict(features)[0])
        probability = float(model.predict_proba(features)[0][1])
        return {"prediction": prediction, "probability": probability}


model_service = ModelService()
