import React from "react";


function ApplicantForm({ datasetFile, setDatasetFile, onSubmit, loading, error, summary }) {
  return (
    <section className="card upload-card">
      <div className="upload-card__header">
        <div>
          <span className="eyebrow">Dataset Upload</span>
          <h2>Analyze a full applicant portfolio</h2>
          <p>
            Upload a CSV with columns like <strong>age</strong>, <strong>income</strong>, <strong>employment_years</strong>,
            <strong> loan_amount</strong>, <strong>credit_score</strong>, <strong>debt_to_income</strong>,
            <strong> num_credit_lines</strong>, <strong>home_ownership</strong>, <strong>purpose</strong>,
            and optionally <strong>target</strong>.
          </p>
        </div>

        <div className="upload-card__schema">
          <span>Expected workflow</span>
          <strong>Upload dataset</strong>
          <strong>Score every applicant</strong>
          <strong>Review AI insights</strong>
        </div>
      </div>

      <form className="upload-form" onSubmit={onSubmit}>
        <label className="upload-dropzone">
          <input
            type="file"
            accept=".csv"
            onChange={(event) => setDatasetFile(event.target.files?.[0] || null)}
          />
          <div>
            <strong>{datasetFile ? datasetFile.name : "Choose a CSV dataset"}</strong>
            <p>
              {datasetFile
                ? "File ready for batch underwriting analysis."
                : "Drag a portfolio extract here or browse from your machine."}
            </p>
          </div>
        </label>

        <div className="upload-actions">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Scoring Portfolio..." : "Analyze Dataset"}
          </button>
          <p>
            The system will process every row, estimate risk, assign a lending decision, and unlock AI
            commentary for selected applicants.
          </p>
        </div>
      </form>

      {summary && (
        <div className="upload-summary">
          <div>
            <span>Current dataset</span>
            <strong>{summary.dataset_name}</strong>
          </div>
          <div>
            <span>Applicants scored</span>
            <strong>{summary.total_applicants}</strong>
          </div>
          <div>
            <span>Invalid rows skipped</span>
            <strong>{summary.invalid_rows}</strong>
          </div>
        </div>
      )}

      {error && <div className="alert error-alert">{error}</div>}
    </section>
  );
}


export default ApplicantForm;
