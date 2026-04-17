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
  { id: "FRD-2191", channel: "Online", reason: "Card velocity spike", severity: "High", timestamp: "2 mins ago" },
  { id: "FRD-2188", channel: "Wallet", reason: "Geo mismatch + high amount", severity: "Medium", timestamp: "7 mins ago" },
  { id: "FRD-2174", channel: "Card Present", reason: "Repeated decline pattern", severity: "Low", timestamp: "14 mins ago" },
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
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [trendData, setTrendData] = useState(volumeTrendData);
  const [riskData, setRiskData] = useState(channelRiskData);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [trainStatus, setTrainStatus] = useState("idle");
  const [isTraining, setIsTraining] = useState(false);

  const riskScore = useMemo(() => {
    if (!prediction) {
      return 0;
    }
    return prediction.score;
  }, [prediction]);

  const explainabilityFactors = useMemo(() => {
    if (!prediction) {
      return [
        "High transaction amount compared to recent pattern",
        "Merchant trust score flagged as medium risk",
        "Online channel has elevated fraud activity",
      ];
    }

    const factors = [];
    const amount = Number(formData.amount || 0);
    const velocity = Number(formData.velocity || 0);

    if (amount > 5000) {
      factors.push("Transaction amount is unusually high");
    } else if (amount > 1500) {
      factors.push("Transaction amount is above normal range");
    }

    if (formData.merchantRisk === "high") {
      factors.push("Merchant risk profile is high");
    } else if (formData.merchantRisk === "medium") {
      factors.push("Merchant risk profile is medium");
    }

    if (velocity > 8) {
      factors.push("Transaction velocity is very high in the last hour");
    } else if (velocity > 4) {
      factors.push("Transaction velocity is moderately high");
    }

    if (formData.channel === "online") {
      factors.push("Online channel currently has high fraud exposure");
    } else if (formData.channel === "wallet") {
      factors.push("Wallet transactions are seeing suspicious activity");
    } else {
      factors.push("Card present flow shows repeated decline signals");
    }

    return factors.slice(0, 3);
  }, [formData, prediction]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFormErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    const amount = Number(formData.amount);
    const velocity = Number(formData.velocity);

    if (!formData.amount || Number.isNaN(amount) || amount <= 0) {
      errors.amount = "Enter a valid amount greater than 0";
    }

    if (!formData.velocity || Number.isNaN(velocity) || velocity < 0) {
      errors.velocity = "Enter a valid velocity (0 or more)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePredict = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

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
    const riskLevel = normalizedScore >= 70 ? "HIGH" : normalizedScore >= 40 ? "MEDIUM" : "LOW";
    const decision = normalizedScore >= 70 ? "BLOCK" : "ALLOW";

    await new Promise((resolve) => setTimeout(resolve, 800));

    setPrediction({
      score: normalizedScore,
      riskLevel,
      decision,
      probability: normalizedScore,
    });

    setTrendData((previous) =>
      previous.map((item, index) => {
        if (index !== previous.length - 1) {
          return item;
        }

        const suspiciousJump = normalizedScore >= 70 ? 3 : normalizedScore >= 40 ? 2 : 1;
        return {
          ...item,
          transactions: item.transactions + 1,
          suspicious: item.suspicious + suspiciousJump,
        };
      })
    );

    setRiskData((previous) => {
      const selectedName =
        formData.channel === "online" ? "Online" : formData.channel === "wallet" ? "Wallet" : "Card Present";

      return previous.map((item) => {
        if (item.name === selectedName) {
          return { ...item, value: Math.min(70, item.value + 2) };
        }

        return { ...item, value: Math.max(10, item.value - 1) };
      });
    });

    setIsLoading(false);
  };

  const handleDatasetSelect = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    setTrainStatus("idle");
    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      const text = String(loadEvent.target && loadEvent.target.result ? loadEvent.target.result : "").trim();
      const lines = text ? text.split(/\r?\n/) : [];
      const detectedColumns = lines.length > 0 ? lines[0].split(",").length : 0;
      const detectedRows = lines.length > 1 ? lines.length - 1 : 0;

      setDatasetInfo({
        fileName: file.name,
        rows: detectedRows || 1250,
        columns: detectedColumns || 22,
      });
    };

    reader.onerror = () => {
      setDatasetInfo({
        fileName: file.name,
        rows: 1250,
        columns: 22,
      });
    };

    reader.readAsText(file);
  };

  const handleUploadAndTrain = async () => {
    if (!datasetInfo) {
      return;
    }

    setIsTraining(true);
    setTrainStatus("uploading");
    await new Promise((resolve) => setTimeout(resolve, 900));

    setTrainStatus("training");
    await new Promise((resolve) => setTimeout(resolve, 1400));

    setTrainStatus("success");
    setIsTraining(false);
  };

  const trainStatusText = trainStatus === "uploading"
    ? "Uploading dataset..."
    : trainStatus === "training"
      ? "Training model..."
      : trainStatus === "success"
        ? "Model training completed successfully"
        : "";

  return (
    <div className="fraud-app fraud-dashboard">
      <div className="ambient-orb orb-one" aria-hidden="true" />
      <div className="ambient-orb orb-two" aria-hidden="true" />
      <div className="ambient-orb orb-three" aria-hidden="true" />

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
          <article className={`glass-panel kpi-card ${card.label === "Fraud Rate" ? "kpi-card-featured" : ""}`} key={card.label}>
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
            <AreaChart data={trendData} margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
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
                data={riskData}
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

        <article className="glass-panel upload-block">
          <div className="block-head">
            <h2>Dataset Upload</h2>
            <span>Upload a CSV dataset to retrain the model</span>
          </div>

          <div className="upload-layout">
            <label className="upload-label">
              Dataset File (.csv)
              <input className="field-control upload-input" type="file" accept=".csv,text/csv" onChange={handleDatasetSelect} />
            </label>

            <button className="btn btn-primary" type="button" onClick={handleUploadAndTrain} disabled={!datasetInfo || isTraining}>
              {isTraining ? "Processing..." : "Upload & Train Model"}
            </button>
          </div>

          {datasetInfo && (
            <div className="prediction-panel upload-summary">
              <div>
                <span>File Name</span>
                <strong>{datasetInfo.fileName}</strong>
              </div>
              <div>
                <span>Rows</span>
                <strong>{datasetInfo.rows}</strong>
              </div>
              <div>
                <span>Columns</span>
                <strong>{datasetInfo.columns}</strong>
              </div>
            </div>
          )}

          {trainStatus !== "idle" && <div className={`upload-status upload-status-${trainStatus}`}>{trainStatusText}</div>}
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
                className={`field-control ${formErrors.amount ? "field-control-error" : ""}`}
                type="number"
                name="amount"
                min="1"
                value={formData.amount}
                onChange={handleChange}
                required
              />
              {formErrors.amount && <small className="field-error">{formErrors.amount}</small>}
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
                className={`field-control ${formErrors.velocity ? "field-control-error" : ""}`}
                type="number"
                name="velocity"
                min="0"
                value={formData.velocity}
                onChange={handleChange}
                required
              />
              {formErrors.velocity && <small className="field-error">{formErrors.velocity}</small>}
            </label>

            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Predict Fraud"}
            </button>
          </form>

          {prediction && (
            <div className="prediction-panel prediction-result-card">
              <div>
                <span>Fraud Probability</span>
                <strong>{prediction.probability}%</strong>
              </div>
              <div>
                <span>Risk Level</span>
                <strong className={`risk-text risk-${prediction.riskLevel.toLowerCase()}`}>{prediction.riskLevel}</strong>
              </div>
              <div>
                <span>Decision</span>
                <strong>{prediction.decision}</strong>
              </div>
              <div className="risk-meter">
                <div className="risk-meter-fill" style={{ width: `${riskScore}%` }} />
              </div>
            </div>
          )}

          <div className="prediction-panel explainability-card">
            <div>
              <span>Why Fraud</span>
              <strong>Top Risk Factors</strong>
            </div>
            <ul className="factor-list">
              {explainabilityFactors.map((factor) => (
                <li key={factor}>{factor}</li>
              ))}
            </ul>
          </div>
        </article>

        <article className="glass-panel alerts-block">
          <div className="block-head">
            <h2>Recent Alert Feed</h2>
            <span>Latest high-signal events for analyst follow-up</span>
          </div>
          <div className="alert-list">
            {alertFeed.map((alert) => (
              <button
                className={`alert-item ${selectedAlertId === alert.id ? "alert-item-active" : ""}`}
                key={alert.id}
                type="button"
                onClick={() => setSelectedAlertId(alert.id)}
              >
                <div>
                  <strong>{alert.id}</strong>
                  <p>{alert.reason}</p>
                </div>
                <div className={`severity severity-${alert.severity.toLowerCase()}`}>{alert.severity}</div>
                <span>
                  {alert.channel} | {alert.timestamp}
                </span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}


export default Dashboard;
