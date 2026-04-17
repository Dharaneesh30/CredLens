import React from "react";


function ResultsSummary({ summary, portfolioInsights }) {
  return (
    <section className="results-shell">
      <div className="card summary-hero">
        <div>
          <span className="eyebrow">Portfolio Snapshot</span>
          <h2>Professional credit-risk scoring for digital lending operations</h2>
          <p>
            CredLens has converted the uploaded dataset into an underwriting view with approval mix,
            exposure overview, and applicant-level explainability.
          </p>
        </div>

        <div className="summary-hero__focus">
          <span>Dataset Overview</span>
          <strong>{summary.total_applicants.toLocaleString()}</strong>
          <p>
            Applicants analyzed across the uploaded dataset with {summary.approval_rate}% approval readiness.
          </p>
        </div>
      </div>

      <div className="summary-grid">
        <article className="card metric-card">
          <span>Approval Rate</span>
          <strong>{summary.approval_rate}%</strong>
          <p>Direct plus conditional approvals across the uploaded dataset.</p>
        </article>

        <article className="card metric-card">
          <span>High-Risk Share</span>
          <strong>{summary.high_risk_share}%</strong>
          <p>Applicants at or above the elevated risk threshold.</p>
        </article>

        <article className="card metric-card">
          <span>Average Score</span>
          <strong>{summary.average_credit_score}</strong>
          <p>Average bureau-style credit score across all valid records.</p>
        </article>

        <article className="card metric-card">
          <span>Total Exposure</span>
          <strong>{summary.total_credit_exposure.toLocaleString()}</strong>
          <p>Total requested credit amount represented in the analyzed portfolio.</p>
        </article>
      </div>

      <div className="summary-grid">
        <article className="card metric-card">
          <span>Model</span>
          <strong>{summary.model_name}</strong>
          <p>Scoring engine used for the uploaded dataset analysis.</p>
        </article>

        <article className="card metric-card">
          <span>Actual Default Rate</span>
          <strong>{summary.actual_default_rate ?? "N/A"}{summary.actual_default_rate != null ? "%" : ""}</strong>
          <p>Reported from the uploaded target column when it is present.</p>
        </article>
      </div>

      <div className="card insight-panel">
        <div className="insight-panel__header">
          <div>
            <span className="eyebrow">Executive Readout</span>
            <h3>What the portfolio is telling us</h3>
          </div>
        <div className="insight-panel__decision">
            <span>Approve</span>
            <strong>{summary.approve_count}</strong>
            <span>Rejected</span>
            <strong>{summary.rejected_count || 0}</strong>
          </div>
        </div>

        <ul className="insight-list">
          {portfolioInsights.map((item, index) => (
            <li key={`portfolio-insight-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}


export default ResultsSummary;
