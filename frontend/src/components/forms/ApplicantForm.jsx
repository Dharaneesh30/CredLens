import React from "react";


function ApplicantForm({
  fieldSections,
  featureFields,
  formData,
  completion,
  onChange,
  onSubmit,
  onLoadSample,
  onReset,
  loading,
  error,
}) {
  const groupedFields = fieldSections.map((section) => ({
    ...section,
    fields: featureFields.filter((field) => field.section === section.id),
  }));

  return (
    <section className="panel form-panel">
      <div className="panel-head">
        <div>
          <span className="kicker">Application Intake</span>
          <h2>Applicant Information</h2>
          <p>Provide complete borrower details to generate a reliable risk decision.</p>
        </div>

        <div className="completion-badge" aria-label={`Form completion ${completion}%`}>
          <strong>{completion}%</strong>
          <span>complete</span>
        </div>
      </div>

      <form className="application-form" onSubmit={onSubmit}>
        {groupedFields.map((section) => (
          <div key={section.id} className="section-card">
            <div className="section-head">
              <h3>{section.title}</h3>
              <p>{section.subtitle}</p>
            </div>

            <div className="field-grid">
              {section.fields.map((field) => (
                <label className="field" key={field.name}>
                  <span className="field-top">
                    <span className="field-title">{field.label}</span>
                    <span className="field-help">{field.description}</span>
                  </span>

                  {field.control === "select" ? (
                    <select
                      className="field-control"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={onChange}
                      required
                    >
                      <option value="">Select option</option>
                      {field.options.map((option) => (
                        <option key={`${field.name}-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="field-control"
                      type="number"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={onChange}
                      placeholder={field.placeholder || field.label}
                      min={field.min}
                      max={field.max}
                      step={field.step || 1}
                      required
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Predict Risk"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onLoadSample} disabled={loading}>
            Load Sample
          </button>
          <button className="btn btn-ghost" type="button" onClick={onReset} disabled={loading}>
            Reset
          </button>
        </div>
      </form>

      {error && <div className="alert error-alert">{error}</div>}
    </section>
  );
}


export default ApplicantForm;
