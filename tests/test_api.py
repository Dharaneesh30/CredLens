from fastapi.testclient import TestClient

from backend.app import create_app


app = create_app()
client = TestClient(app)


def test_health_endpoints():
    assert client.get("/health").status_code == 200
    assert "status" in client.get("/health").json()
    assert client.get("/health/model").status_code == 200
    assert client.get("/health/ollama").status_code == 200
    assert client.get("/metrics").status_code == 200


def test_predict_validation_error():
    response = client.post("/predict", json={"input": [1, 2, 3]})
    assert response.status_code == 422


def test_predict_success_shape():
    payload = {
        "input": [30, 2, 0, 2, 2, 6000, 12, 1, 1, 0]
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    for key in ["prediction", "probability", "confidence", "credit_score", "decision", "model_metadata"]:
        assert key in data


def test_advisor_validation_error():
    response = client.post("/loan-advisor", json={"applicant_data": {}, "prediction_result": {}})
    assert response.status_code == 400
    assert "error" in response.json()


def test_advisor_response_schema():
    payload = {
        "applicant_data": {
            "age": 30,
            "job": 2,
            "housing": 0,
            "saving": 1,
            "checking": 2,
            "credit": 6000,
            "duration": 12,
            "purpose": 1,
            "sex": 1,
            "other": 0,
        },
        "prediction_result": {
            "prediction": 0,
            "probability": 0.2,
            "confidence": 0.8,
            "credit_score": 740,
            "decision": "Approve",
        },
        "user_query": "Should we lend?",
        "model": "llama3.2",
    }
    response = client.post("/loan-advisor", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "source" in data
    assert "advisor_response" in data
    nested = data["advisor_response"]
    for key in ["decision", "rationale", "risks", "mitigations", "conditions_to_approve", "final_perspective"]:
        assert key in nested


def test_advisor_history_endpoint():
    response = client.get("/loan-advisor/history?limit=5")
    assert response.status_code == 200
    assert "records" in response.json()
