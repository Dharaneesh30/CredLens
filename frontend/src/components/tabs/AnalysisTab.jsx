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

function AnalysisTab({ analysisChartData, inputProfileData, result, analysisInsights }) {
  return (
    <div className="tab-content">
      <div className="chart-card">
        <h3>Prediction Analysis Overview</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analysisChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" angle={-45} textAnchor="end" height={100} />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="value">
              {analysisChartData.map((entry, index) => (
                <Cell key={`analysis-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Prediction Analytics Radar</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={analysisChartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Application Analysis"
              dataKey="value"
              stroke="#1976d2"
              fill="#1976d2"
              fillOpacity={0.45}
            />
            <Tooltip formatter={(value) => `${value}%`} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Applicant Input Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inputProfileData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {inputProfileData.map((entry, index) => (
                <Cell key={`analysis-input-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="analysis-summary">
        <h3>Key Analysis Insights</h3>
        <ul>
          {(result.analysis || analysisInsights).map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      </div>

      {Array.isArray(result.top_factors) && result.top_factors.length > 0 && (
        <div className="analysis-summary">
          <h3>Top Model Factors</h3>
          <ul>
            {result.top_factors.map((factor, index) => (
              <li key={`factor-${index}`}>
                <strong>{factor.feature}</strong>: {factor.reason} ({factor.impact})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


export default AnalysisTab;