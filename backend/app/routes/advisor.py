from flask import Blueprint, jsonify, request

from ..services.advisor_service import advisor_service


advisor_bp = Blueprint("advisor", __name__)


@advisor_bp.route("/loan-advisor", methods=["POST"])
def loan_advisor():
    try:
        payload = request.get_json(silent=True) or {}
        applicant = payload.get("applicant_data", {})
        prediction_result = payload.get("prediction_result", {})
        user_query = payload.get("user_query", "")
        model_name = payload.get("model")

        if not applicant or not prediction_result:
            return jsonify({"error": "applicant_data and prediction_result are required."}), 400

        suggestion = advisor_service.get_advice(
            applicant=applicant,
            prediction_result=prediction_result,
            user_query=user_query,
            model_name=model_name,
        )
        return jsonify(suggestion)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
