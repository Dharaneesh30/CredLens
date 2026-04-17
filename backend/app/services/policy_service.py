from dataclasses import dataclass


@dataclass
class PolicyEvaluation:
    decision: str
    reasons: list[str]
    conditions_to_approve: list[str]


def evaluate_policy(applicant: dict, risk_probability: float, confidence: float) -> PolicyEvaluation:
    reasons: list[str] = []
    conditions: list[str] = []

    credit = float(applicant.get("loan_amount", applicant.get("credit", 0)))
    duration = float(applicant.get("duration", 0))
    savings = float(applicant.get("saving", 0))
    job = float(applicant.get("job", 0))
    income = float(applicant.get("income", 0))
    employment_years = float(applicant.get("employment_years", 0))
    debt_to_income = float(applicant.get("debt_to_income", 0))
    credit_score = float(applicant.get("credit_score", 0))
    num_credit_lines = float(applicant.get("num_credit_lines", 0))
    home_ownership = str(applicant.get("home_ownership", applicant.get("housing", ""))).upper()
    loan_to_income = credit / max(income, 1.0) if income else 0.0

    if confidence < 0.58:
        reasons.append("Model confidence is low; this application should be manually reviewed.")
        return PolicyEvaluation(
            decision="Manual Review",
            reasons=reasons,
            conditions_to_approve=["Collect additional underwriting documents and run manual review."],
        )

    if risk_probability >= 0.65:
        reasons.append("Predicted risk probability is high.")
    if credit > 25000:
        reasons.append("Requested credit amount is above policy comfort threshold.")
        conditions.append("Require collateral or guarantor.")
    if duration > 36:
        reasons.append("Loan duration is long, increasing repayment uncertainty.")
        conditions.append("Consider shorter tenure and tighter repayment plan.")
    if savings and savings <= 1:
        reasons.append("Savings profile is weak.")
        conditions.append("Verify emergency fund or liquid reserves.")
    if job and job <= 1:
        reasons.append("Job stability indicator is low.")
        conditions.append("Validate stable income history.")
    if debt_to_income > 0.45:
        reasons.append("Debt-to-income ratio is high for a fresh approval.")
        conditions.append("Reduce loan amount or verify additional income capacity.")
    if credit_score and credit_score < 580:
        reasons.append("Credit score is below preferred underwriting threshold.")
        conditions.append("Request stronger collateral, guarantor, or manual review.")
    if income and loan_to_income > 0.45:
        reasons.append("Loan amount is high relative to annual income.")
        conditions.append("Scale the sanctioned amount to a safer income multiple.")
    if employment_years and employment_years < 2:
        reasons.append("Employment tenure is limited.")
        conditions.append("Validate continuity of employment and bank statements.")
    if num_credit_lines and num_credit_lines <= 1:
        reasons.append("Credit history is relatively thin.")
        conditions.append("Review bureau depth and alternative repayment signals.")
    if home_ownership == "RENT":
        reasons.append("Rental housing indicates a tighter repayment buffer.")

    if risk_probability < 0.35 and credit_score >= 620 and debt_to_income < 0.45:
        return PolicyEvaluation(
            decision="Approve",
            reasons=reasons or ["Risk score and profile are within acceptable lending bounds."],
            conditions_to_approve=["Standard KYC and repayment setup."],
        )

    if risk_probability < 0.55:
        return PolicyEvaluation(
            decision="Conditional Approval",
            reasons=reasons or ["Moderate risk profile requires guardrails."],
            conditions_to_approve=conditions or ["Set prudent loan amount and monitoring conditions."],
        )

    return PolicyEvaluation(
        decision="Review / Reject",
        reasons=reasons or ["Risk profile is above acceptable threshold."],
        conditions_to_approve=conditions or ["Reject unless compensating factors are verified."],
    )
