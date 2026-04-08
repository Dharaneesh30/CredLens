import json
import os
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

from ..config import DEFAULT_OLLAMA_MODEL, OLLAMA_CHAT_URL


class AdvisorService:
    @staticmethod
    def build_rule_based_suggestion(applicant, prediction_result, user_query):
        probability = float(prediction_result.get("probability", 0.0))
        risk_prediction = int(prediction_result.get("prediction", 0))
        credit_score = min(850, max(300, round(300 + probability * 550)))
        decision = "Approve" if credit_score >= 650 else "Review / Reject"

        notes = []
        if applicant.get("credit", 0) > 20000:
            notes.append("Requested credit amount is high; request stronger income proof or collateral.")
        if applicant.get("duration", 0) > 36:
            notes.append("Long loan duration increases repayment uncertainty.")
        if applicant.get("saving", 0) <= 1:
            notes.append("Low or unknown savings can indicate weaker repayment buffer.")
        if applicant.get("job", 0) >= 3:
            notes.append("Higher job skill level supports repayment stability.")
        if applicant.get("housing", 0) == 0:
            notes.append("Owned housing can reduce default risk in many lending contexts.")

        if not notes:
            notes.append("Profile appears neutral; use additional checks like income verification and bureau history.")

        perspective = (
            f"Model risk prediction: {'High Risk' if risk_prediction == 1 else 'Low Risk'} "
            f"({probability * 100:.1f}% risk). Estimated score: {credit_score}. "
            f"Recommended decision: {decision}."
        )

        response_lines = [
            "Ollama is currently unreachable, so this is a rule-based backup suggestion.",
            perspective,
            "Loan officer perspective:",
        ]
        response_lines.extend([f"- {note}" for note in notes[:4]])
        if user_query:
            response_lines.append(f"Your question: {user_query}")
        return "\n".join(response_lines)

    @staticmethod
    def call_ollama_chat(model_name, messages, timeout=60):
        payload = {
            "model": model_name,
            "messages": messages,
            "stream": False,
        }
        body = json.dumps(payload).encode("utf-8")
        req = urlrequest.Request(
            OLLAMA_CHAT_URL,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlrequest.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def get_advice(self, applicant, prediction_result, user_query, model_name=None):
        selected_model = str(model_name or os.getenv("OLLAMA_MODEL") or DEFAULT_OLLAMA_MODEL)
        question = str(user_query or "").strip()
        if not question:
            question = "Should we approve this loan application? Give concise lending perspective with risks and mitigations."

        system_prompt = (
            "You are a credit risk assistant for a lending platform. "
            "Use the provided applicant profile and model prediction. "
            "Give a practical lending recommendation in 5 short bullet points: "
            "decision, rationale, key risks, mitigations, and final perspective. "
            "Do not mention internal policy unless asked."
        )
        context_payload = {
            "applicant_data": applicant,
            "prediction_result": prediction_result,
            "user_query": question,
        }
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(context_payload)},
        ]

        try:
            ollama_response = self.call_ollama_chat(model_name=selected_model, messages=messages)
            answer = ollama_response.get("message", {}).get("content", "").strip() or "No response generated."
            return {"model": selected_model, "advisor_response": answer, "source": "ollama"}
        except (URLError, HTTPError, TimeoutError, OSError):
            fallback = self.build_rule_based_suggestion(applicant, prediction_result, question)
            return {"model": selected_model, "advisor_response": fallback, "source": "rule_based_fallback"}


advisor_service = AdvisorService()
