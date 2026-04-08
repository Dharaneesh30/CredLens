import React from "react";


function ResultsSummary({ result, score, riskLevel, decision }) {
  const finalDecision = result.decision || decision;
  const confidence = result.confidence ?? Math.max(result.probability, 1 - result.probability);
  return (
    <section className="card metrics-card">
      <h2>Risk Assessment Results</h2>
      <div className="metrics-grid">
        <div className={`metric-box ${result.prediction === 1 ? "high-risk" : "low-risk"}`}>
          <div className="metric-label">Risk Classification</div>
          <div className="metric-value">
            {result.prediction === 1 ? "HIGH RISK" : "LOW RISK"}
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-label">Risk Probability</div>
          <div className="metric-value">{(result.probability * 100).toFixed(1)}%</div>
        </div>

        <div className="metric-box">
          <div className="metric-label">Credit Score</div>
          <div className="metric-value">{score}</div>
        </div>

        <div className="metric-box">
          <div className="metric-label">Risk Level</div>
          <div className="metric-value">{riskLevel}</div>
        </div>

        <div className={`metric-box ${String(finalDecision).toLowerCase().includes("approve") ? "approved" : "rejected"}`}>
          <div className="metric-label">Loan Decision</div>
          <div className="metric-value">{finalDecision}</div>
        </div>

        <div className="metric-box">
          <div className="metric-label">Confidence</div>
          <div className="metric-value">
            {(confidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {Array.isArray(result.policy_reasons) && result.policy_reasons.length > 0 && (
        <div className="analysis-summary">
          <h3>Policy Reasons</h3>
          <ul>
            {result.policy_reasons.map((item, idx) => (
              <li key={`policy-reason-${idx}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {result.model_metadata && (
        <div className="advisor-meta" style={{ marginTop: "0.8rem" }}>
          Model: {result.model_metadata.model_name} | Version: {result.model_metadata.model_version} | Trained: {String(result.model_metadata.trained_at_utc || "unknown")}
        </div>
      )}
    </section>
  );
}


export default ResultsSummary;
