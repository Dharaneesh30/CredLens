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


const gridColor = "rgba(122, 143, 173, 0.22)";
const tickStyle = { fill: "#9db2ce", fontSize: 12 };
const tooltipStyle = {
  background: "#0f1a2c",
  border: "1px solid rgba(107, 129, 160, 0.4)",
  borderRadius: "12px",
  color: "#f4f7fb",
};


function AnalysisTab({ analysisChartData, result, analysisInsights }) {
  return (
    <div className="tab-content">
      <div className="chart-grid chart-grid-two">
        <article className="panel chart-card">
          <h3>Decision Factor Strength</h3>
          <p>Relative impact of risk, confidence, score, duration, and savings.</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={analysisChartData} margin={{ top: 8, right: 12, left: 0, bottom: 42 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="metric"
                tick={tickStyle}
                tickLine={false}
                axisLine={false}
                angle={-28}
                textAnchor="end"
                height={76}
              />
              <YAxis domain={[0, 100]} tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {analysisChartData.map((entry, index) => (
                  <Cell key={`analysis-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Risk Radar</h3>
          <p>Compact multidimensional view of the applicant profile.</p>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={analysisChartData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="metric" tick={tickStyle} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="#34d399" fill="#34d399" fillOpacity={0.28} />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="chart-grid chart-grid-two">
        <article className="panel summary-panel">
          <h3>Key Insights</h3>
          <ul>
            {(result.analysis || analysisInsights).map((insight, index) => (
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
    </div>
  );
}


export default AnalysisTab;
