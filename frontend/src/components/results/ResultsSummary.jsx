import React from "react";


const toneByDecision = (decision) => {
  const value = String(decision || "").toLowerCase();

  if (value.includes("approve") && !value.includes("conditional")) {
    return "success";
  }
  if (value.includes("conditional")) {
    return "warning";
  }
  if (value.includes("manual")) {
    return "manual";
  }
  return "danger";
};


function ResultsSummary({ result, score, riskLevel, decision }) {
  const finalDecision = result.decision || decision;
  const confidence = result.confidence ?? Math.max(result.probability, 1 - result.probability);
  const tone = toneByDecision(finalDecision);

  return (
    <section className="result-shell">
      <div className={`panel decision-panel tone-${tone}`}>
        <div className="decision-main">
          <span className="kicker">Assessment Result</span>
          <h2>{finalDecision}</h2>
          <p>
            Risk is classified as {result.prediction === 1 ? "high" : "low"} with{" "}
            {(result.probability * 100).toFixed(1)}% default probability.
          </p>
        </div>
        <div className="score-pill">
          <span>Credit Score</span>
          <strong>{score}</strong>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <span>Risk Classification</span>
          <strong>{result.prediction === 1 ? "High Risk" : "Low Risk"}</strong>
        </article>
        <article className="metric-card">
          <span>Risk Probability</span>
          <strong>{(result.probability * 100).toFixed(1)}%</strong>
        </article>
        <article className="metric-card">
          <span>Risk Level</span>
          <strong>{riskLevel}</strong>
        </article>
        <article className="metric-card">
          <span>Confidence</span>
          <strong>{(confidence * 100).toFixed(1)}%</strong>
        </article>
      </div>

      {Array.isArray(result.policy_reasons) && result.policy_reasons.length > 0 && (
        <div className="panel summary-panel">
          <h3>Policy Reasons</h3>
          <ul>
            {result.policy_reasons.map((item, index) => (
              <li key={`reason-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(result.policy_conditions) && result.policy_conditions.length > 0 && (
        <div className="panel summary-panel">
          <h3>Approval Conditions</h3>
          <ul>
            {result.policy_conditions.map((item, index) => (
              <li key={`condition-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {result.model_metadata && (
        <div className="meta-line">
          Model {result.model_metadata.model_name} | Version {result.model_metadata.model_version} | Trained{" "}
          {String(result.model_metadata.trained_at_utc || "unknown")}
        </div>
      )}
    </section>
  );
}


export default ResultsSummary;
