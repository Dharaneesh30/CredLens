from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # 🔥 Allows React to connect

# Path to results folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(BASE_DIR, "..", "results")

@app.route("/eda-results", methods=["GET"])
def eda_results():
    try:
        images = os.listdir(RESULTS_DIR)
    except:
        images = []

    return jsonify({
        "images": images,
        "summary": "EDA Completed Successfully"
    })

@app.route("/images/<filename>")
def get_image(filename):
    return send_from_directory(RESULTS_DIR, filename)

if __name__ == "__main__":
    app.run(debug=True)