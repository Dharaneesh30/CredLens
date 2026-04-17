import React from "react";

import ApplicantForm from "../components/forms/ApplicantForm";
import ResultsSummary from "../components/results/ResultsSummary";


function WorkspacePage({
  datasetFile,
  setDatasetFile,
  onSubmit,
  loading,
  error,
  summary,
  datasetResult,
}) {
  return (
    <>
      <ApplicantForm
        datasetFile={datasetFile}
        setDatasetFile={setDatasetFile}
        onSubmit={onSubmit}
        loading={loading}
        error={error}
        summary={summary}
      />

      {datasetResult && summary && (
        <>
          <ResultsSummary
            summary={summary}
            portfolioInsights={datasetResult.portfolio_insights}
          />
          <section className="card tabs-card">
            <div className="tabs-card__header">
              <div>
                <span className="eyebrow">Overall Applicant Analysis</span>
                <h2>The workspace focuses on the full uploaded portfolio instead of selecting a single applicant.</h2>
              </div>
              <div className="tabs-card__meta">
                <span>Dataset: {summary.dataset_name}</span>
                <span>Model: {summary.model_name}</span>
              </div>
            </div>

            <div className="workspace-highlight">
              <div className="detail-card">
                <span>Total Applicants</span>
                <strong>{summary.total_applicants}</strong>
              </div>
              <div className="detail-card">
                <span>Average Risk</span>
                <strong>{summary.average_risk_probability}%</strong>
              </div>
              <div className="detail-card">
                <span>Total Exposure</span>
                <strong>{Math.round(summary.total_credit_exposure).toLocaleString()}</strong>
              </div>
              <div className="detail-card">
                <span>Approved</span>
                <strong>{summary.approve_count}</strong>
              </div>
              <div className="detail-card">
                <span>Rejected</span>
                <strong>{summary.rejected_count || 0}</strong>
              </div>
              <div className="detail-card">
                <span>Pending Review</span>
                <strong>{summary.pending_review_count || 0}</strong>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}


export default WorkspacePage;
