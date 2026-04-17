import React from "react";

import PredictionTab from "../components/tabs/PredictionTab";


function ApplicationsPage({
  hasData,
  applicants,
  charts,
  selectedApplicantId,
  onInspectApplicant,
  summary,
  applicationFilter,
  onFilterChange,
}) {
  if (!hasData || !summary) {
    return (
      <section className="card empty-state-card">
        <span className="eyebrow">Applications</span>
        <h2>No applications loaded yet</h2>
        <p>Upload and analyze a dataset in the workspace to review the applicant queue here.</p>
      </section>
    );
  }

  return (
    <section className="card tabs-card">
      <div className="tabs-card__header">
        <div>
          <span className="eyebrow">Applications Queue</span>
          <h2>Review applicants, compare risk, and keep the final approved or rejected status updated across the queue.</h2>
        </div>
        <div className="tabs-card__meta">
          <span>Applicants: {summary.total_applicants}</span>
          <span>Approval Rate: {summary.approval_rate}%</span>
          <span>Pending: {summary.pending_review_count || 0}</span>
        </div>
      </div>

      <div className="filter-row">
        {[
          { key: "all", label: "All Applicants" },
          { key: "Approved", label: "Approved" },
          { key: "Rejected", label: "Rejected" },
          { key: "Pending", label: "Pending" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            className={`tab-btn ${applicationFilter === item.key ? "active" : ""}`}
            onClick={() => onFilterChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <PredictionTab
        charts={charts}
        applicants={applicants}
        selectedApplicantId={selectedApplicantId}
        onInspectApplicant={onInspectApplicant}
        summary={summary}
      />
    </section>
  );
}


export default ApplicationsPage;
