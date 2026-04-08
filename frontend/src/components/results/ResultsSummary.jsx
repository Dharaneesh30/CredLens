import React from "react";


function ResultsSummary({ result, score, riskLevel, decision }) {
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

        <div className={`metric-box ${score >= 650 ? "approved" : "rejected"}`}>
          <div className="metric-label">Loan Decision</div>
          <div className="metric-value">{decision}</div>
        </div>

        <div className="metric-box">
          <div className="metric-label">Confidence</div>
          <div className="metric-value">
            {(Math.max(result.probability, 1 - result.probability) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </section>
  );
}


export default ResultsSummary;
