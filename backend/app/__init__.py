from flask import Flask
from flask_cors import CORS

from .routes.advisor import advisor_bp
from .routes.charts import charts_bp
from .routes.health import health_bp
from .routes.prediction import prediction_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(health_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(charts_bp)
    app.register_blueprint(advisor_bp)
    return app
