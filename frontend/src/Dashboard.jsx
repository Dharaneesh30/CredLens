import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./App.css";


const kpiCards = [
  { label: "Total Transactions", value: "1,245", change: "+8.4% vs yesterday" },
  { label: "Fraud Detected", value: "87", change: "+2.1% alert volume" },
  { label: "Fraud Rate", value: "7.0%", change: "-0.8% weekly trend" },
  { label: "Blocked Value", value: "$482K", change: "Recovered in last 24h" },
];

const volumeTrendData = [
  { hour: "08:00", transactions: 82, suspicious: 6 },
  { hour: "10:00", transactions: 115, suspicious: 8 },
  { hour: "12:00", transactions: 132, suspicious: 11 },
  { hour: "14:00", transactions: 148, suspicious: 9 },
  { hour: "16:00", transactions: 165, suspicious: 14 },
  { hour: "18:00", transactions: 126, suspicious: 10 },
  { hour: "20:00", transactions: 111, suspicious: 7 },
];

const channelRiskData = [
  { name: "Online", value: 46, fill: "#38bdf8" },
  { name: "Card Present", value: 34, fill: "#22d3ee" },
  { name: "Wallet", value: 20, fill: "#14b8a6" },
];

const alertFeed = [
  { id: "FRD-2191", channel: "Online", reason: "Card velocity spike", severity: "High" },
  { id: "FRD-2188", channel: "Wallet", reason: "Geo mismatch + high amount", severity: "Medium" },
  { id: "FRD-2174", channel: "Card Present", reason: "Repeated decline pattern", severity: "Low" },
];

const tooltipStyle = {
  background: "#0f1a2c",
  border: "1px solid rgba(107, 129, 160, 0.4)",
  borderRadius: "12px",
  color: "#f4f7fb",
};

const axisStyle = { fill: "#93a9c9", fontSize: 12 };


function Dashboard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    merchantRisk: "medium",
    channel: "online",
    velocity: "",
  });
  const [prediction, setPrediction] = useState(null);

  const riskScore = useMemo(() => {
    if (!prediction) {
      return 0;
    }
    return prediction.score;
  }, [prediction]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handlePredict = (event) => {
    event.preventDefault();

    const amount = Number(formData.amount || 0);
    const velocity = Number(formData.velocity || 0);
    let score = 0;

    if (amount > 5000) {
      score += 30;
    } else if (amount > 1500) {
      score += 15;
    }

    if (formData.merchantRisk === "high") {
      score += 30;
    } else if (formData.merchantRisk === "medium") {
      score += 15;
    }

    if (formData.channel === "online") {
      score += 15;
    } else if (formData.channel === "wallet") {
      score += 10;
    } else {
      score += 5;
    }

    if (velocity > 8) {
      score += 25;
    } else if (velocity > 4) {
      score += 12;
    }

    const normalizedScore = Math.max(8, Math.min(96, score));
    const classification = normalizedScore >= 70 ? "High Risk" : normalizedScore >= 40 ? "Medium Risk" : "Low Risk";
    const action = normalizedScore >= 70 ? "Block and escalate" : normalizedScore >= 40 ? "Manual review" : "Approve";

    setPrediction({
      score: normalizedScore,
      classification,
      action,
      probability: normalizedScore,
    });
  };

  return (
    <div className="fraud-app fraud-dashboard">
      <div className="ambient-orb orb-one" aria-hidden="true" />
      <div className="ambient-orb orb-two" aria-hidden="true" />
      <div className="ambient-orb orb-three" aria-hidden="true" />

      <header className="app-topbar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <strong>CredLens Sentinel</strong>
            <small>Analyst Command Workspace</small>
          </div>
        </div>
        <div className="topbar-pills">
          <span>Coverage 24/7</span>
          <span>False Positive 4.1%</span>
          <span>Escalations 19</span>
        </div>
      </header>

      <header className="dashboard-header">
        <div>
          <span className="home-kicker">Realtime Monitoring</span>
          <h1>Financial Fraud Detection Dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" type="button" onClick={() => navigate("/")}>
            Back To Home
          </button>
        </div>
      </header>

      <section className="kpi-grid">
        {kpiCards.map((card) => (
          <article className="glass-panel kpi-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.change}</small>
          </article>
        ))}
      </section>

      <section className="main-grid">
        <article className="glass-panel chart-block">
          <div className="block-head">
            <h2>Transaction Volume Trend</h2>
            <span>Intraday activity and suspicious signals</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={volumeTrendData} margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.48} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.44} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(122, 143, 173, 0.22)" vertical={false} />
              <XAxis dataKey="hour" tick={axisStyle} tickLine={false} axisLine={false} />
              <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="transactions" stroke="#38bdf8" strokeWidth={2} fill="url(#txGradient)" />
              <Area type="monotone" dataKey="suspicious" stroke="#f97316" strokeWidth={2} fill="url(#fraudGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="glass-panel chart-block">
          <div className="block-head">
            <h2>Risk By Channel</h2>
            <span>Share of suspicious events across payment rails</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={channelRiskData}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={94}
                paddingAngle={3}
                label={({ name, value }) => `${name}: ${value}%`}
              />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="glass-panel checker-block">
          <div className="block-head">
            <h2>Check Transaction</h2>
            <span>Estimate fraud probability for a new event</span>
          </div>

          <form className="checker-form" onSubmit={handlePredict}>
            <label>
              Amount (USD)
              <input
                className="field-control"
                type="number"
                name="amount"
                min="1"
                placeholder="e.g. 2400"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Merchant Risk
              <select className="field-control" name="merchantRisk" value={formData.merchantRisk} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label>
              Channel
              <select className="field-control" name="channel" value={formData.channel} onChange={handleChange}>
                <option value="online">Online</option>
                <option value="card_present">Card Present</option>
                <option value="wallet">Wallet</option>
              </select>
            </label>

            <label>
              Txn Velocity (last hour)
              <input
                className="field-control"
                type="number"
                name="velocity"
                min="0"
                placeholder="e.g. 6"
                value={formData.velocity}
                onChange={handleChange}
                required
              />
            </label>

            <button className="btn btn-primary" type="submit">
              Predict Fraud
            </button>
          </form>

          {prediction && (
            <div className="prediction-panel">
              <div>
                <span>Fraud Probability</span>
                <strong>{prediction.probability}%</strong>
              </div>
              <div>
                <span>Classification</span>
                <strong>{prediction.classification}</strong>
              </div>
              <div>
                <span>Recommended Action</span>
                <strong>{prediction.action}</strong>
              </div>
              <div className="risk-meter">
                <div className="risk-meter-fill" style={{ width: `${riskScore}%` }} />
              </div>
            </div>
          )}
        </article>

        <article className="glass-panel alerts-block">
          <div className="block-head">
            <h2>Recent Alert Feed</h2>
            <span>Latest high-signal events for analyst follow-up</span>
          </div>
          <div className="alert-list">
            {alertFeed.map((alert) => (
              <div className="alert-item" key={alert.id}>
                <div>
                  <strong>{alert.id}</strong>
                  <p>{alert.reason}</p>
                </div>
                <div className={`severity severity-${alert.severity.toLowerCase()}`}>{alert.severity}</div>
                <span>{alert.channel}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}


export default Dashboard;
