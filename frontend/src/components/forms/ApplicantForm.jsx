import React from "react";


function ApplicantForm({ featureFields, formData, onChange, onSubmit, loading, error }) {
  return (
    <section className="card card-form">
      <h2>Applicant Information</h2>
      <form onSubmit={onSubmit} className="form-grid">
        {featureFields.map((field) => (
          <label key={field.name} className="field-group">
            <span>
              <strong>{field.label}</strong>
              <small className="field-description">{field.description}</small>
            </span>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={onChange}
              placeholder={field.label}
              min={field.range[0]}
              max={field.range[1]}
              required
            />
          </label>
        ))}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Predict Risk"}
        </button>
      </form>
      {error && <div className="alert error-alert">{error}</div>}
    </section>
  );
}


export default ApplicantForm;
