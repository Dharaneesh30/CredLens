from dataclasses import dataclass


@dataclass
class PolicyEvaluation:
    decision: str
    reasons: list[str]
    conditions_to_approve: list[str]


def evaluate_policy(applicant: dict, risk_probability: float, confidence: float) -> PolicyEvaluation:
    reasons: list[str] = []
    conditions: list[str] = []

    credit = float(applicant.get("credit", 0))
    duration = float(applicant.get("duration", 0))
    savings = float(applicant.get("saving", 0))
    job = float(applicant.get("job", 0))

    if confidence < 0.60:
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
    if savings <= 1:
        reasons.append("Savings profile is weak.")
        conditions.append("Verify emergency fund or liquid reserves.")
    if job <= 1:
        reasons.append("Job stability indicator is low.")
        conditions.append("Validate stable income history.")

    if risk_probability < 0.35 and not reasons:
        return PolicyEvaluation(
            decision="Approve",
            reasons=["Risk score and profile are within acceptable lending bounds."],
            conditions_to_approve=["Standard KYC and repayment setup."],
        )

    if risk_probability < 0.50:
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
