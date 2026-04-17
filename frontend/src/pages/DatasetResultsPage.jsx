import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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


function DatasetResultsPage({ hasData, summary, applicants, charts }) {
  if (!hasData || !summary || !charts) {
    return (
      <section className="card empty-state-card">
        <span className="eyebrow">Dataset Results</span>
        <h2>No dataset results available yet</h2>
        <p>Upload and analyze a dataset in the workspace to unlock charts for the whole portfolio.</p>
      </section>
    );
  }

  const homeOwnershipData = Object.entries(
    applicants.reduce((acc, applicant) => {
      const key = String(applicant.applicant_data.home_ownership || "UNKNOWN");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value], index) => ({
    name,
    value,
    fill: ["#5da9ff", "#41c985", "#ff8f6b", "#ae8bff"][index % 4],
  }));

  const incomeBands = [
    { range: "0-25k", count: 0 },
    { range: "25k-50k", count: 0 },
    { range: "50k-75k", count: 0 },
    { range: "75k-100k", count: 0 },
    { range: "100k+", count: 0 },
  ];

  applicants.forEach((applicant) => {
    const income = Number(applicant.applicant_data.income || 0);
    if (income < 25000) incomeBands[0].count += 1;
    else if (income < 50000) incomeBands[1].count += 1;
    else if (income < 75000) incomeBands[2].count += 1;
    else if (income < 100000) incomeBands[3].count += 1;
    else incomeBands[4].count += 1;
  });

  const scatterData = applicants.slice(0, 300).map((applicant) => ({
    x: applicant.credit_score,
    y: Math.round(applicant.probability * 100),
    z: Math.round(Number(applicant.applicant_data.loan_amount || 0)),
  }));

  return (
    <section className="card tabs-card">
      <div className="tabs-card__header">
        <div>
          <span className="eyebrow">Dataset Results</span>
          <h2>See the overall results of the uploaded dataset with charts that reflect the latest underwriter decisions.</h2>
        </div>
        <div className="tabs-card__meta">
          <span>Applicants: {summary.total_applicants}</span>
          <span>Approved: {summary.approve_count}</span>
          <span>Rejected: {summary.rejected_count || 0}</span>
          <span>Model: {summary.model_name}</span>
        </div>
      </div>

      <div className="chart-grid chart-grid-three">
        <article className="panel chart-card">
          <h3>Decision Pie</h3>
          <p>Overall underwriting decisions across the complete dataset.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={charts.decision_distribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} >
                {charts.decision_distribution.map((entry, index) => (
                  <Cell key={`dataset-decision-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Risk Bar Graph</h3>
          <p>Applicants grouped by low, guarded, elevated, and high-risk segments.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.risk_band_distribution} margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {charts.risk_band_distribution.map((entry, index) => (
                  <Cell key={`dataset-risk-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Score Histogram</h3>
          <p>Distribution of credit scores across the uploaded applicants.</p>
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
      </div>

      <div className="chart-grid chart-grid-three">
        <article className="panel chart-card">
          <h3>Purpose Categories</h3>
          <p>Borrowers grouped by loan purpose to show which categories dominate the dataset.</p>
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
          <h3>Income Histogram</h3>
          <p>Applicants categorized by annual income bands.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={incomeBands} margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="range" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#ae8bff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Home Ownership Mix</h3>
          <p>How the dataset is categorized by applicant home ownership.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={homeOwnershipData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} >
                {homeOwnershipData.map((entry, index) => (
                  <Cell key={`home-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>

      <article className="panel chart-card">
        <h3>Credit Score vs Risk Scatter</h3>
        <p>Relationship between bureau score and predicted default probability for a sample of applicants.</p>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
            <CartesianGrid stroke={gridColor} />
            <XAxis type="number" dataKey="x" name="Credit Score" tick={tickStyle} tickLine={false} axisLine={false} />
            <YAxis type="number" dataKey="y" name="Risk %" tick={tickStyle} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={tooltipStyle} formatter={(value, name) => [value, name === "y" ? "Risk %" : "Credit Score"]} />
            <Scatter data={scatterData} fill="#7df0d6" />
          </ScatterChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}


export default DatasetResultsPage;
