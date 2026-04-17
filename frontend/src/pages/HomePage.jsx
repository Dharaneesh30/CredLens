import React from "react";


function HomePage({ onNavigate, hasData, applicants, onInspectApplicant }) {
  return (
    <div className="app-shell">
      <header className="hero-banner hero-banner--home">
        <div className="hero-banner__copy">
          <span className="eyebrow">Machine Learning Credit Risk Platform</span>
          <h1>CredLens</h1>
          <p>
            A professional digital lending workspace for dataset upload, applicant scoring, portfolio risk
            analysis, and AI-powered lending guidance.
          </p>

          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => onNavigate("workspace")}>
              Open Workspace
            </button>
            <button className="ghost-button" type="button" onClick={() => onNavigate("applications")}>
              Open Applications
            </button>
          </div>
        </div>

        <div className="home-preview card">
          <span className="eyebrow">Platform Flow</span>
          <h2>Upload, score, analyze, decide.</h2>
          <div className="home-preview__grid">
            <div>
              <strong>1</strong>
              <p>Upload your loan default dataset.</p>
            </div>
            <div>
              <strong>2</strong>
              <p>Generate applicant-level risk predictions.</p>
            </div>
            <div>
              <strong>3</strong>
              <p>Inspect portfolio trends and decision mix.</p>
            </div>
            <div>
              <strong>4</strong>
              <p>Ask the AI advisor for practical underwriting guidance.</p>
            </div>
          </div>
        </div>
      </header>

      {hasData && (
        <main className="page-content">
          <section className="card tabs-card">
            <div className="tabs-card__header">
              <div>
                <span className="eyebrow">Applicants Preview</span>
                <h2>Every applicant from your uploaded dataset is available for inspection.</h2>
              </div>
              <div className="tabs-card__meta">
                <span>Records: {applicants.length}</span>
                <span>Open any applicant and update the final decision</span>
              </div>
            </div>

            <div className="applicant-table">
              <div className="applicant-table__head">
                <span>Applicant</span>
                <span>Purpose</span>
                <span>Loan</span>
                <span>Risk</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {applicants.slice(0, 12).map((applicant) => (
                <div key={applicant.applicant_id} className="applicant-table__row">
                  <span>
                    <strong>{applicant.applicant_id}</strong>
                    <small>Score {applicant.credit_score}</small>
                  </span>
                  <span>{applicant.display_profile.purpose}</span>
                  <span>{Number(applicant.applicant_data.loan_amount).toLocaleString()}</span>
                  <span>{(applicant.probability * 100).toFixed(1)}%</span>
                  <span>{applicant.review_status}</span>
                  <button className="ghost-button" type="button" onClick={() => onInspectApplicant(applicant.applicant_id)}>
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}


export default HomePage;
