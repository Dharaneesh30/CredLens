import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdvisorTab from "./AdvisorTab";


const gridColor = "rgba(140, 156, 184, 0.18)";
const tickStyle = { fill: "#91a2c2", fontSize: 12 };
const tooltipStyle = {
  background: "#0d1627",
  border: "1px solid rgba(140, 156, 184, 0.2)",
  borderRadius: "14px",
  color: "#f2f7ff",
};


function AnalysisTab({
  analysisChartData,
  inputProfileData,
  result,
  analysisInsights,
  advisorModel,
  setAdvisorModel,
  advisorQuery,
  setAdvisorQuery,
  onAdvisorSubmit,
  advisorLoading,
  advisorError,
  advisorResponse,
  healthStatus,
  advisorHistory,
  onSetReviewAction,
}) {
  const detailRows = [
    ["Applicant ID", result.applicant_id],
    ["Age", result.applicant_data.age],
    ["Income", Number(result.applicant_data.income || 0).toLocaleString()],
    ["Employment Years", result.applicant_data.employment_years],
    ["Loan Amount", Number(result.applicant_data.loan_amount || 0).toLocaleString()],
    ["Credit Score", result.applicant_data.credit_score],
    ["Debt To Income", `${(Number(result.applicant_data.debt_to_income || 0) * 100).toFixed(1)}%`],
    ["Credit Lines", result.applicant_data.num_credit_lines],
    ["Home Ownership", result.applicant_data.home_ownership],
    ["Purpose", result.applicant_data.purpose],
    ["Model Decision", result.decision],
    ["Underwriter Status", result.review_status || result.review_action || "Pending"],
    ["Predicted Risk", `${(result.probability * 100).toFixed(1)}%`],
  ];

  return (
    <div className="tab-content">
      <div className="chart-grid chart-grid-three">
        <article className="panel chart-card">
          <h3>Applicant Decision Factors</h3>
          <p>Relative strength of the main signals driving the selected applicant's lending outcome.</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={analysisChartData} margin={{ top: 8, right: 12, left: 0, bottom: 38 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="metric"
                tick={tickStyle}
                tickLine={false}
                axisLine={false}
                angle={-26}
                textAnchor="end"
                height={70}
              />
              <YAxis domain={[0, 100]} tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {analysisChartData.map((entry, index) => (
                  <Cell key={`analysis-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Risk Radar</h3>
          <p>Compact view of how risk, confidence, score, exposure, and buffers compare.</p>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={analysisChartData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="metric" tick={tickStyle} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#41c985" fill="#41c985" fillOpacity={0.26} />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Applicant Profile Values</h3>
          <p>Operational profile used by the model when evaluating the selected record.</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={inputProfileData} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {inputProfileData.map((entry, index) => (
                  <Cell key={`profile-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="chart-grid chart-grid-two">
        <article className="panel summary-panel">
          <h3>Key Underwriting Insights</h3>
          <ul>
            {analysisInsights.map((insight, index) => (
              <li key={`insight-${index}`}>{insight}</li>
            ))}
          </ul>
        </article>

        <article className="panel summary-panel">
          <h3>Top Model Factors</h3>
          {Array.isArray(result.top_factors) && result.top_factors.length > 0 ? (
            <ul>
              {result.top_factors.map((factor, index) => (
                <li key={`factor-${index}`}>
                  <strong>{factor.feature}</strong>: {factor.reason} ({factor.impact})
                </li>
              ))}
            </ul>
          ) : (
            <p>No model factor details returned for this applicant.</p>
          )}
        </article>
      </div>

      <article className="panel summary-panel">
        <h3>Policy Conditions</h3>
        {Array.isArray(result.policy_conditions) && result.policy_conditions.length > 0 ? (
          <ul>
            {result.policy_conditions.map((item, index) => (
              <li key={`condition-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No additional policy conditions were generated for this record.</p>
        )}
      </article>

      <div className="chart-grid chart-grid-two">
        <article className="panel summary-panel">
          <h3>Full Applicant Record</h3>
          <div className="detail-grid">
            {detailRows.map(([label, value]) => (
              <div key={label} className="detail-card">
                <span>{label}</span>
                <strong>{String(value)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel summary-panel">
          <h3>Actual Outcome</h3>
          {result.actual_target != null ? (
            <div className="detail-grid detail-grid-single">
              <div className="detail-card">
                <span>Historical Target</span>
                <strong>{result.actual_target === 1 ? "Defaulted" : "Non-default"}</strong>
              </div>
              <div className="detail-card">
                <span>Model Source</span>
                <strong>{result.model_metadata?.model_name || "Dataset model"}</strong>
              </div>
            </div>
          ) : (
            <p>No actual target value was provided for this applicant.</p>
          )}
        </article>
      </div>

      <article className="panel decision-panel">
        <div>
          <h3>Underwriter Decision</h3>
          <p>Finalize and update the platform stance for this applicant after reviewing the model and AI guidance.</p>
        </div>
        <div className="decision-panel__actions">
          <button
            className="primary-button decision-button decision-button--approve"
            type="button"
            onClick={() => onSetReviewAction(result.applicant_id, "Approved")}
          >
            Approve Applicant
          </button>
          <button
            className="primary-button decision-button decision-button--reject"
            type="button"
            onClick={() => onSetReviewAction(result.applicant_id, "Rejected")}
          >
            Reject Applicant
          </button>
        </div>
        <div className="detail-grid detail-grid-single">
          <div className="detail-card">
            <span>Current Underwriter Action</span>
            <strong>{result.review_status || result.review_action || "Pending review"}</strong>
          </div>
        </div>
      </article>

      <AdvisorTab
        advisorModel={advisorModel}
        setAdvisorModel={setAdvisorModel}
        advisorQuery={advisorQuery}
        setAdvisorQuery={setAdvisorQuery}
        onSubmit={onAdvisorSubmit}
        loading={advisorLoading}
        error={advisorError}
        response={advisorResponse}
        healthStatus={healthStatus}
        history={advisorHistory}
        selectedApplicant={result}
      />
    </div>
  );
}


export default AnalysisTab;
