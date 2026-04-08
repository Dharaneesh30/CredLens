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
      <div className="chart-card advisor-card">
        <h3>Loan Perspective Assistant (Ollama)</h3>
        <p className="advisor-help-text">
          Ask for approval perspective, lending rationale, key risks, and mitigation advice for this applicant.
        </p>
        <div className="advisor-meta">
          Backend: {healthStatus?.backend} | Model: {healthStatus?.model} | Ollama: {healthStatus?.ollama}
        </div>
        {isOllamaDown && (
          <div className="alert error-alert">
            Ollama is not reachable. Suggestions will use fallback policy rules until Ollama is online.
          </div>
        )}
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
            <div className="analysis-summary">
              <h3>Decision</h3>
              <p>{response.advisor_response?.decision}</p>
            </div>
            <div className="analysis-summary">
              <h3>Rationale</h3>
              <ul>
                {(response.advisor_response?.rationale || []).map((item, idx) => (
                  <li key={`rat-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="analysis-summary">
              <h3>Risks</h3>
              <ul>
                {(response.advisor_response?.risks || []).map((item, idx) => (
                  <li key={`risk-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="analysis-summary">
              <h3>Mitigations</h3>
              <ul>
                {(response.advisor_response?.mitigations || []).map((item, idx) => (
                  <li key={`mit-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="analysis-summary">
              <h3>Conditions to Approve</h3>
              <ul>
                {(response.advisor_response?.conditions_to_approve || []).map((item, idx) => (
                  <li key={`cond-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="analysis-summary">
              <h3>Final Perspective</h3>
              <p>{response.advisor_response?.final_perspective}</p>
            </div>
          </div>
        )}

        {Array.isArray(history) && history.length > 0 && (
          <div className="analysis-summary">
            <h3>Recent Advisor History</h3>
            <ul>
              {history.slice().reverse().map((item, idx) => (
                <li key={`hist-${idx}`}>
                  [{item.timestamp_utc}] {item.applicant_id} - {item.decision} ({item.source})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


export default AdvisorTab;
