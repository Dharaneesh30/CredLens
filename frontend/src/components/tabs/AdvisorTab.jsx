import React from "react";


function AdvisorTab({
  advisorModel,
  setAdvisorModel,
  advisorQuery,
  setAdvisorQuery,
  onSubmit,
  loading,
  error,
  response,
}) {
  return (
    <div className="tab-content">
      <div className="chart-card advisor-card">
        <h3>Loan Perspective Assistant (Ollama)</h3>
        <p className="advisor-help-text">
          Ask for approval perspective, lending rationale, key risks, and mitigation advice for this applicant.
        </p>
        <form className="advisor-form" onSubmit={onSubmit}>
          <label className="advisor-field">
            <span>Ollama Model</span>
            <input
              type="text"
              value={advisorModel}
              onChange={(event) => setAdvisorModel(event.target.value)}
              placeholder="llama3.2"
            />
          </label>
          <label className="advisor-field">
            <span>User Query</span>
            <textarea
              value={advisorQuery}
              onChange={(event) => setAdvisorQuery(event.target.value)}
              rows={5}
              required
              placeholder="Should we approve this loan and from what perspective can we issue it?"
            />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Getting Suggestion..." : "Get AI Suggestion"}
          </button>
        </form>

        {error && (
          <div className="alert error-alert" style={{ marginTop: "1rem" }}>
            {error}
          </div>
        )}

        {response && (
          <div className="advisor-response">
            <div className="advisor-meta">
              Source: {response.source} | Model: {response.model}
            </div>
            <pre>{response.advisor_response}</pre>
          </div>
        )}
      </div>
    </div>
  );
}


export default AdvisorTab;
