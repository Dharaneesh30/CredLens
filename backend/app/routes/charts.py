from flask import Blueprint, jsonify, send_from_directory

from ..config import RESULTS_DIR


charts_bp = Blueprint("charts", __name__)


@charts_bp.route("/charts")
def charts():
    images = [f.name for f in RESULTS_DIR.glob("*.png")]
    return jsonify({"images": images})


@charts_bp.route("/chart/<filename>")
def get_chart(filename):
    return send_from_directory(str(RESULTS_DIR), filename)
