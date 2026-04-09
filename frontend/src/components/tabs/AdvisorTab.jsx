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
  healthStatus,
  history,
}) {
  const isOllamaDown = healthStatus?.ollama !== "ok";

  return (
    <div className="tab-content">
      <div className="chart-grid chart-grid-two">
        <article className="panel chart-card advisor-card">
          <h3>AI Loan Advisor</h3>
          <p>Request a narrative approval perspective with actionable lending guidance.</p>

          <div className="status-row">
            <span>Backend: {healthStatus?.backend}</span>
            <span>Model: {healthStatus?.model}</span>
            <span>Ollama: {healthStatus?.ollama}</span>
          </div>

          {isOllamaDown && (
            <div className="alert error-alert">
              Ollama is currently unavailable. Advisor replies will use fallback policy rules.
            </div>
          )}

          <form className="advisor-form" onSubmit={onSubmit}>
            <label className="field">
              <span className="field-title">Model Name</span>
              <input
                className="field-control"
                type="text"
                value={advisorModel}
                onChange={(event) => setAdvisorModel(event.target.value)}
                placeholder="llama3.2"
              />
            </label>

            <label className="field">
              <span className="field-title">Advisor Prompt</span>
              <textarea
                className="field-control"
                value={advisorQuery}
                onChange={(event) => setAdvisorQuery(event.target.value)}
                rows={5}
                required
                placeholder="Should we approve this loan and under what conditions?"
              />
            </label>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Getting Suggestion..." : "Get AI Suggestion"}
            </button>
          </form>

          {error && <div className="alert error-alert">{error}</div>}
        </article>

        <article className="panel summary-panel">
          <h3>Advisor Response</h3>
          {response ? (
            <div className="advisor-response">
              <div className="meta-line">
                Source: {response.source} | Model: {response.model}
              </div>

              <h4>{response.advisor_response?.decision}</h4>
              <p>{response.advisor_response?.final_perspective}</p>

              <h4>Rationale</h4>
              <ul>
                {(response.advisor_response?.rationale || []).map((item, index) => (
                  <li key={`rat-${index}`}>{item}</li>
                ))}
              </ul>

              <h4>Risks</h4>
              <ul>
                {(response.advisor_response?.risks || []).map((item, index) => (
                  <li key={`risk-${index}`}>{item}</li>
                ))}
              </ul>

              <h4>Mitigations</h4>
              <ul>
                {(response.advisor_response?.mitigations || []).map((item, index) => (
                  <li key={`mit-${index}`}>{item}</li>
                ))}
              </ul>

              <h4>Conditions to Approve</h4>
              <ul>
                {(response.advisor_response?.conditions_to_approve || []).map((item, index) => (
                  <li key={`cond-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="empty-text">
              Submit a question to generate advisor rationale, risks, mitigations, and approval conditions.
            </p>
          )}
        </article>
      </div>

      {Array.isArray(history) && history.length > 0 && (
        <article className="panel summary-panel">
          <h3>Recent Advisor History</h3>
          <ul>
            {history.slice().reverse().map((item, index) => (
              <li key={`history-${index}`}>
                [{item.timestamp_utc}] {item.applicant_id} - {item.decision} ({item.source})
              </li>
            ))}
          </ul>
        </article>
      )}
    </div>
  );
}


export default AdvisorTab;
