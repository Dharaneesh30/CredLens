import React from "react";
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


function EdaTab({
  riskDistributionData,
  ageDistributionData,
  creditAmountDistribution,
  edaInsights,
  chartImages,
}) {
  return (
    <div className="tab-content">
      <div className="chart-card">
        <h3>Exploratory Data Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {riskDistributionData.map((entry, index) => (
                <Cell key={`eda-pie-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Applicant Age Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ageDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Credit Amount Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={creditAmountDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Applicants</div>
          <div className="stat-value">1,100</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Approval Rate</div>
          <div className="stat-value">68.2%</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Avg. Credit Score</div>
          <div className="stat-value">648</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">High Risk %</div>
          <div className="stat-value">20%</div>
        </div>
      </div>

      <div className="eda-summary">
        <h3>EDA Insights</h3>
        <ul>
          {edaInsights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      </div>

      {chartImages.length > 0 && (
        <div className="chart-card">
          <h3>Extra EDA Chart Gallery</h3>
          <div className="gallery-grid">
            {chartImages.map((filename) => (
              <div key={filename} className="gallery-item">
                <img alt={filename} src={`/chart/${filename}`} />
                <div>{filename.replace(/_/g, " ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default EdaTab;
