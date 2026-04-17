import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


const gridColor = "rgba(140, 156, 184, 0.18)";
const tickStyle = { fill: "#91a2c2", fontSize: 12 };
const tooltipStyle = {
  background: "#0d1627",
  border: "1px solid rgba(140, 156, 184, 0.2)",
  borderRadius: "14px",
  color: "#f2f7ff",
};


const PAGE_SIZE = 50;

function PredictionTab({ charts, applicants, selectedApplicantId, onInspectApplicant, summary }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(applicants.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [applicants]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const queueApplicants = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return applicants.slice(startIndex, startIndex + PAGE_SIZE);
  }, [applicants, page]);

  const startRow = applicants.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRow = applicants.length === 0 ? 0 : Math.min(page * PAGE_SIZE, applicants.length);

  return (
    <div className="tab-content">
      <div className="chart-grid chart-grid-two">
        <article className="panel chart-card">
          <h3>Decision Mix</h3>
          <p>Portfolio split after applying the latest underwriter approvals and rejections.</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.decision_distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {charts.decision_distribution.map((entry, index) => (
                  <Cell key={`decision-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Risk Segments</h3>
          <p>How your uploaded applicants are distributed across low-to-high risk tiers.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.risk_band_distribution} margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {charts.risk_band_distribution.map((entry, index) => (
                  <Cell key={`risk-band-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="stats-grid">
        <div className="panel stat-card">
          <span>Total Applicants</span>
          <strong>{summary.total_applicants}</strong>
        </div>
        <div className="panel stat-card">
          <span>Approved</span>
          <strong>{summary.approve_count}</strong>
        </div>
        <div className="panel stat-card">
          <span>Rejected</span>
          <strong>{summary.rejected_count || 0}</strong>
        </div>
        <div className="panel stat-card">
          <span>Pending Review</span>
          <strong>{summary.pending_review_count || 0}</strong>
        </div>
        <div className="panel stat-card">
          <span>Reviewed</span>
          <strong>{summary.reviewed_count || 0}</strong>
        </div>
      </div>

      <article className="panel table-card">
        <div className="table-card__header">
          <div>
            <h3>Applicant Queue</h3>
            <p>Showing 50 applicants per page so the queue stays fast and easier to review.</p>
          </div>
          <div className="table-card__caption">
            Showing {startRow}-{endRow} of {applicants.length}
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

          {queueApplicants.map((applicant) => (
            <div
              key={applicant.applicant_id}
              className={`applicant-table__row ${selectedApplicantId === applicant.applicant_id ? "is-active" : ""}`}
            >
              <span>
                <strong>{applicant.applicant_id}</strong>
                <small>Score {applicant.credit_score} | {applicant.review_status}</small>
              </span>
              <span>{applicant.display_profile.purpose}</span>
              <span>{Number(applicant.applicant_data.loan_amount).toLocaleString()}</span>
              <span>{(applicant.probability * 100).toFixed(1)}%</span>
              <span>{applicant.review_status}</span>
              <button
                className="ghost-button"
                type="button"
                onClick={() => onInspectApplicant(applicant.applicant_id)}
              >
                {selectedApplicantId === applicant.applicant_id ? "Open Review" : "Inspect"}
              </button>
            </div>
          ))}
        </div>

        <div className="table-pagination" aria-label="Applicant queue pagination">
          <button className="ghost-button" type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
            Previous
          </button>
          <span className="table-pagination__status">
            Page {page} of {totalPages}
          </span>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </article>
    </div>
  );
}


export default PredictionTab;
