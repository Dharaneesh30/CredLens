import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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


function EdaTab({ charts, summary, edaInsights, chartImages }) {
  return (
    <div className="tab-content">
      <div className="chart-grid chart-grid-three">
        <article className="panel chart-card">
          <h3>Score Distribution</h3>
          <p>Credit score tiers generated from your uploaded loan default dataset.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.score_distribution} margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="range" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#5da9ff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Purpose Concentration</h3>
          <p>Where the uploaded portfolio is concentrated by loan purpose category.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.purpose_distribution} margin={{ top: 8, right: 12, left: 0, bottom: 28 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={false} angle={-18} textAnchor="end" height={70} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#41c985" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Exposure by Decision</h3>
          <p>How much requested loan exposure falls under each underwriting recommendation.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={charts.exposure_by_decision}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${Math.round(value)}`}
              />
              <Tooltip formatter={(value) => Number(value).toLocaleString()} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="stats-grid">
        <div className="panel stat-card">
          <span>Avg Risk</span>
          <strong>{summary.average_risk_probability}%</strong>
        </div>
        <div className="panel stat-card">
          <span>Conditional</span>
          <strong>{summary.conditional_count}</strong>
        </div>
        <div className="panel stat-card">
          <span>Invalid Rows</span>
          <strong>{summary.invalid_rows}</strong>
        </div>
        <div className="panel stat-card">
          <span>Total Exposure</span>
          <strong>{Math.round(summary.total_credit_exposure).toLocaleString()}</strong>
        </div>
      </div>

      <article className="panel summary-panel">
        <h3>Portfolio Insights</h3>
        <ul>
          {edaInsights.map((insight, index) => (
            <li key={`eda-insight-${index}`}>{insight}</li>
          ))}
        </ul>
      </article>

      {chartImages.length > 0 && (
        <article className="panel chart-card">
          <h3>Model Diagnostics Gallery</h3>
          <p>Existing backend-generated ROC and confusion matrix charts from your trained models.</p>
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
