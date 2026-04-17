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
  selectedApplicant,
}) {
  const isOllamaDown = healthStatus?.ollama !== "ok";

  return (
    <div className="tab-content">
      <div className="chart-grid chart-grid-two">
        <article className="panel chart-card advisor-card">
          <h3>AI Lending Advisor</h3>
          <p>Ask for an underwriting perspective on the currently selected applicant.</p>

          <div className="status-row">
            <span>Backend: {healthStatus?.backend}</span>
            <span>Model: {healthStatus?.model}</span>
            <span>Ollama: {healthStatus?.ollama}</span>
          </div>

          <div className="selected-applicant-card">
            <span>Selected applicant</span>
            <strong>{selectedApplicant?.applicant_id}</strong>
            <p>
              {selectedApplicant?.decision} | Risk {(selectedApplicant?.probability * 100).toFixed(1)}% | Loan{" "}
              {Number(selectedApplicant?.applicant_data?.loan_amount || 0).toLocaleString()}
            </p>
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
                placeholder="Should we approve this applicant and at what lending amount or conditions?"
              />
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Generating AI Perspective..." : "Ask AI Advisor"}
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
              Select an applicant, ask a question, and CredLens will generate a lending recommendation with
              practical rationale and conditions.
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
