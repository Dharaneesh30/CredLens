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


const gridColor = "rgba(122, 143, 173, 0.22)";
const tickStyle = { fill: "#9db2ce", fontSize: 12 };
const tooltipStyle = {
  background: "#0f1a2c",
  border: "1px solid rgba(107, 129, 160, 0.4)",
  borderRadius: "12px",
  color: "#f4f7fb",
};


function PredictionTab({ predictionChartData, inputProfileData, result }) {
  return (
    <div className="tab-content">
      <div className="chart-grid chart-grid-three">
        <article className="panel chart-card">
          <h3>Risk Distribution</h3>
          <p>Probability split between default risk and safety margin.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={predictionChartData}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={92}
                paddingAngle={3}
                label={({ name, value }) => `${name}: ${value}%`}
                dataKey="value"
              >
                {predictionChartData.map((entry, index) => (
                  <Cell key={`pred-pie-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Probability Comparison</h3>
          <p>Side-by-side exposure view for risk and safety confidence.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={predictionChartData} margin={{ top: 8, right: 12, left: 0, bottom: 10 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {predictionChartData.map((entry, index) => (
                  <Cell key={`pred-bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel chart-card">
          <h3>Input Signal Strength</h3>
          <p>Normalized input profile for quick underwriter interpretation.</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={inputProfileData} layout="vertical" margin={{ top: 8, right: 18, left: 2, bottom: 8 }}>
              <CartesianGrid stroke={gridColor} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tick={tickStyle}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {inputProfileData.map((entry, index) => (
                  <Cell key={`pred-input-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="micro-note">
            Model confidence: {((result.confidence ?? Math.max(result.probability, 1 - result.probability)) * 100).toFixed(1)}%
          </div>
        </article>
      </div>
    </div>
  );
}


export default PredictionTab;
