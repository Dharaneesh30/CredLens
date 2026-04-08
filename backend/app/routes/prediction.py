from flask import Blueprint, jsonify, request

from ..services.model_service import model_service


prediction_bp = Blueprint("prediction", __name__)


@prediction_bp.route("/predict", methods=["POST"])
def predict():
    try:
        payload = request.get_json(silent=True) or {}
        result = model_service.predict(payload.get("input"))
        return jsonify(result)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400
