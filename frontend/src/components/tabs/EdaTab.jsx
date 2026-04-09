import React from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";


const gridColor = "rgba(122, 143, 173, 0.22)";
const tickStyle = { fill: "#9db2ce", fontSize: 12 };
const tooltipStyle = {
  background: "#0f1a2c",
  border: "1px solid rgba(107, 129, 160, 0.4)",
  borderRadius: "12px",
  color: "#f4f7fb",
};


function EdaTab({
  riskDistributionData,
  ageDistributionData,
  creditAmountDistribution,
  edaInsights,
  chartImages,
}) {
  const totalApplicants = ageDistributionData.reduce((sum, row) => sum + row.count, 0);
  const highRiskShare =
    riskDistributionData.find((row) => String(row.name).toLowerCase() === "high risk")?.value ?? 0;

  return (
    <div className="tab-content">
      <div className="chart-grid chart-grid-three">
        <article className="panel chart-card">
          <h3>Portfolio Risk Mix</h3>
          <p>Distribution of low, medium, and high-risk borrowers.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={riskDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={92}
                paddingAngle={3}
                label={({ name, value }) => `${name}: ${value}%`}
                dataKey="value"
              >
                {riskDistributionData.map((entry, index) => (
                  <Cell key={`eda-pie-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Age Distribution</h3>
          <p>Borrower concentration by age buckets.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ageDistributionData} margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="range" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Credit Amount Bands</h3>
          <p>Distribution of requested exposure across ticket-size buckets.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={creditAmountDistribution} margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="range" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="stats-grid">
        <div className="panel stat-card">
          <span>Total Applicants</span>
          <strong>{totalApplicants.toLocaleString()}</strong>
        </div>
        <div className="panel stat-card">
          <span>High-Risk Share</span>
          <strong>{highRiskShare}%</strong>
        </div>
        <div className="panel stat-card">
          <span>Largest Age Cluster</span>
          <strong>
            {ageDistributionData.reduce((best, item) => (item.count > best.count ? item : best), ageDistributionData[0]).range}
          </strong>
        </div>
        <div className="panel stat-card">
          <span>Most Common Ticket</span>
          <strong>
            {
              creditAmountDistribution.reduce(
                (best, item) => (item.count > best.count ? item : best),
                creditAmountDistribution[0]
              ).range
            }
          </strong>
        </div>
      </div>

      <article className="panel summary-panel">
        <h3>EDA Insights</h3>
        <ul>
          {edaInsights.map((insight, index) => (
            <li key={`eda-insight-${index}`}>{insight}</li>
          ))}
        </ul>
      </article>

      {chartImages.length > 0 && (
        <article className="panel chart-card">
          <h3>Chart Gallery</h3>
          <p>Additional backend-generated model diagnostics and performance visuals.</p>
          <div className="gallery-grid">
            {chartImages.map((filename) => (
              <div key={filename} className="gallery-item">
                <img alt={filename} src={`/chart/${filename}`} />
                <span>{filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}


export default EdaTab;
