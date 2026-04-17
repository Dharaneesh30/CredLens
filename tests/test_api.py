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


def test_dataset_analysis_endpoint():
    csv_bytes = b"""age,income,employment_years,loan_amount,credit_score,debt_to_income,num_credit_lines,home_ownership,purpose,target
59,57544.76,0,20326.16,342,0.4104,9,OWN,debt_consolidation,1
49,55681.03,4,28988.31,816,0.7963,1,OWN,business,0
35,56580.57,10,18894.62,365,0.6912,1,RENT,personal,1
63,96604.76,9,19112.47,695,0.2479,11,OWN,debt_consolidation,0
"""
    response = client.post(
        "/analyze-dataset",
        files={"file": ("loan_default_dataset.csv", csv_bytes, "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "applicants" in data
    assert data["summary"]["total_applicants"] > 0
    assert len(data["applicants"]) > 0


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
