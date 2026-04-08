import json
import os
from urllib import request as urlrequest
from urllib.error import HTTPError, URLError

from ..config import ADVISOR_MAX_QUERY_CHARS, DEFAULT_OLLAMA_MODEL, OLLAMA_CHAT_URL
from .audit_service import append_advisor_audit, build_applicant_id
from .policy_service import evaluate_policy


class AdvisorService:
    @staticmethod
    def sanitize_query(user_query: str) -> str:
        cleaned = (user_query or "").strip().replace("\x00", " ")
        if len(cleaned) > ADVISOR_MAX_QUERY_CHARS:
            cleaned = cleaned[:ADVISOR_MAX_QUERY_CHARS]
        return cleaned

    @staticmethod
    def build_rule_based_suggestion(applicant, prediction_result, user_query):
        probability = float(prediction_result.get("probability", 0.0))
        confidence = float(prediction_result.get("confidence", max(probability, 1 - probability)))
        credit_score = int(min(850, max(300, round(850 - probability * 550))))
        policy = evaluate_policy(applicant, probability, confidence)

        risks = []
        mitigations = []
        if applicant.get("credit", 0) > 20000:
            risks.append("Requested credit amount is high.")
            mitigations.append("Ask for collateral or reduce sanctioned amount.")
        if applicant.get("duration", 0) > 36:
            risks.append("Long repayment duration increases uncertainty.")
            mitigations.append("Prefer shorter tenure or tighter repayment schedule.")
        if applicant.get("saving", 0) <= 1:
            risks.append("Low savings indicate limited repayment buffer.")
            mitigations.append("Request reserve proof and stable income documents.")
        if not risks:
            risks.append("No strong adverse flags from fallback rules.")
            mitigations.append("Proceed with standard KYC and monitoring.")

        return {
            "decision": policy.decision,
            "rationale": policy.reasons[:4],
            "risks": risks[:4],
            "mitigations": mitigations[:4],
            "conditions_to_approve": policy.conditions_to_approve[:4],
            "final_perspective": (
                f"Risk probability {probability * 100:.1f}% | confidence {confidence * 100:.1f}% | "
                f"credit score {credit_score}."
            ),
            "user_question": user_query,
        }

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
        question = self.sanitize_query(str(user_query or ""))
        if not question:
            question = "Should we approve this loan application? Give concise lending perspective with risks and mitigations."

        system_prompt = (
            "You are a credit risk assistant for a lending platform. "
            "Use the applicant profile, policy context, and model prediction to give a practical lending recommendation. "
            "Respond in strict JSON with these keys only: "
            "decision (string), rationale (array of short strings), risks (array), mitigations (array), "
            "conditions_to_approve (array), final_perspective (string). "
            "No markdown, no extra keys."
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
            answer_text = ollama_response.get("message", {}).get("content", "").strip() or "{}"
            structured = self._parse_structured_answer(answer_text, applicant, prediction_result, question)
            response = {"model": selected_model, "advisor_response": structured, "source": "ollama"}
        except (URLError, HTTPError, TimeoutError, OSError):
            fallback = self.build_rule_based_suggestion(applicant, prediction_result, question)
            response = {"model": selected_model, "advisor_response": fallback, "source": "rule_based_fallback"}

        append_advisor_audit(
            {
                "applicant_id": build_applicant_id(applicant),
                "model": selected_model,
                "source": response["source"],
                "query": question,
                "decision": response["advisor_response"].get("decision"),
                "risk_probability": prediction_result.get("probability"),
                "confidence": prediction_result.get("confidence"),
            }
        )
        return response

    def _parse_structured_answer(self, answer_text, applicant, prediction_result, question):
        try:
            normalized = answer_text.strip()
            if normalized.startswith("```"):
                normalized = normalized.strip("`")
                if normalized.lower().startswith("json"):
                    normalized = normalized[4:].strip()
            normalized = normalized.strip()

            parsed = json.loads(normalized)
            if not isinstance(parsed, dict):
                raise ValueError("Advisor output is not a JSON object.")
            required = {
                "decision": "Manual Review",
                "rationale": [],
                "risks": [],
                "mitigations": [],
                "conditions_to_approve": [],
                "final_perspective": "",
                "user_question": question,
            }
            for key, default in required.items():
                parsed.setdefault(key, default)
            return parsed
        except Exception:
            return self.build_rule_based_suggestion(applicant, prediction_result, question)


advisor_service = AdvisorService()
