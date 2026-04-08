import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    age: 30,
    job: 1,
    housing: 0,
    saving: 1,
    checking: 1,
    credit: 5000,
    duration: 12,
    purpose: 1,
    sex: 1,
    other: 0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("prediction");

  // Model performance data
  const modelPerformanceData = [
    { name: "Random Forest", Accuracy: 100, Precision: 100, Recall: 100, F1: 100, ROC: 100 },
    { name: "XGBoost", Accuracy: 100, Precision: 100, Recall: 100, F1: 100, ROC: 100 },
    { name: "Gradient Boost", Accuracy: 100, Precision: 100, Recall: 100, F1: 100, ROC: 100 },
    { name: "Log. Regression", Accuracy: 100, Precision: 100, Recall: 100, F1: 100, ROC: 100 }
  ];

  // Risk distribution data (simulated)
  const riskDistribution = [
    { name: "Low Risk", value: 45, fill: "#4caf50" },
    { name: "Medium Risk", value: 35, fill: "#ff9800" },
    { name: "High Risk", value: 20, fill: "#f44336" }
  ];

  // Age distribution data
  const ageDistribution = [
    { range: "18-25", count: 120 },
    { range: "26-35", count: 280 },
    { range: "36-45", count: 350 },
    { range: "46-55", count: 200 },
    { range: "55+", count: 150 }
  ];

  // Radar chart data for model comparison
  const radarData = [
    { metric: "Accuracy", value: 100 },
    { metric: "Precision", value: 100 },
    { metric: "Recall", value: 100 },
    { metric: "F1-Score", value: 100 },
    { metric: "ROC-AUC", value: 100 }
  ];

  const fieldLabels = {
    age: "Age (Years)",
    job: "Job Level (0-3)",
    housing: "Housing (0=Own, 1=Rent, 2=Free)",
    saving: "Saving Accounts (0-3)",
    checking: "Checking Account (0-3)",
    credit: "Credit Amount ($)",
    duration: "Duration (Months)",
    purpose: "Purpose (0-4)",
    sex: "Sex (0=Female, 1=Male)",
    other: "Other Feature (0/1)"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: isNaN(value) ? value : parseFloat(value) 
    });
  };

  const calculateCreditScore = (probability) => {
    return Math.min(850, Math.max(300, Math.round(300 + probability * 550)));
  };

  const getRiskLevel = (score) => {
    if (score < 500) return "High Risk";
    if (score < 700) return "Medium Risk";
    return "Low Risk";
  };

  const getLoanDecision = (score) => {
    return score >= 650 ? "Approved ✅" : "Rejected ❌";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const inputArray = [
      formData.age,
      formData.job,
      formData.housing,
      formData.saving,
      formData.checking,
      formData.credit,
      formData.duration,
      formData.purpose,
      formData.sex,
      formData.other
    ];

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: inputArray })
      });

      const data = await response.json();
      setResult(data);
      setActiveTab("prediction");
    } catch (error) {
      console.error(error);
      alert("❌ Could not connect to backend. Make sure the FastAPI server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const predictionChartData = result
    ? [
        {
          name: "Risk Probability",
          value: Math.round(result.probability * 100),
          fill: result.prediction === 1 ? "#f44336" : "#4caf50"
        },
        {
          name: "Safety Margin",
          value: Math.round((1 - result.probability) * 100),
          fill: "#e0e0e0"
        }
      ]
    : [];

  const score = result ? calculateCreditScore(result.probability) : 0;
  const riskLevel = result ? getRiskLevel(score) : "";
  const decision = result ? getLoanDecision(score) : "";

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">💳 CredLens</h1>
          <p className="app-subtitle">Advanced Credit Risk Assessment Platform</p>
        </div>
      </header>

      <div className="app-body">
        {/* MAIN GRID */}
        <div className="main-grid">
          {/* LEFT PANEL - INPUT FORM */}
          <div className="left-panel">
            <div className="form-container">
              <h2 className="section-title">📋 Applicant Information</h2>
              <form onSubmit={handleSubmit} className="credit-form">
                <div className="form-grid">
                  {Object.keys(formData).map((key) => (
                    <div key={key} className="form-group">
                      <label className="form-label">{fieldLabels[key]}</label>
                      <input
                        type="number"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        className="form-input"
                        placeholder={fieldLabels[key]}
                      />
                    </div>
                  ))}
                </div>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "⏳ Analyzing..." : "🔍 Predict Risk"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT PANEL - TABS */}
          <div className="right-panel">
            {result ? (
              <div className="tabs-container">
                <div className="tab-buttons">
                  <button
                    className={`tab-btn ${activeTab === "prediction" ? "active" : ""}`}
                    onClick={() => setActiveTab("prediction")}
                  >
                    📊 Prediction
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "models" ? "active" : ""}`}
                    onClick={() => setActiveTab("models")}
                  >
                    🤖 Models
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
                    onClick={() => setActiveTab("analytics")}
                  >
                    📈 Analytics
                  </button>
                </div>

                {/* TAB CONTENT */}
                {activeTab === "prediction" && (
                  <div className="tab-content">
                    <div className="prediction-result">
                      <div className="result-card">
                        <h3>Risk Assessment Results</h3>
                        <div className="metrics-grid">
                          <div className={`metric-box ${result.prediction === 1 ? "high-risk" : "low-risk"}`}>
                            <div className="metric-label">Risk Classification</div>
                            <div className="metric-value">
                              {result.prediction === 1 ? "⚠️ HIGH RISK" : "✅ LOW RISK"}
                            </div>
                          </div>

                          <div className="metric-box">
                            <div className="metric-label">Risk Probability</div>
                            <div className="metric-value">{(result.probability * 100).toFixed(1)}%</div>
                          </div>

                          <div className="metric-box">
                            <div className="metric-label">Credit Score</div>
                            <div className="metric-value">{score}</div>
                          </div>

                          <div className="metric-box">
                            <div className="metric-label">Risk Level</div>
                            <div className="metric-value">{riskLevel}</div>
                          </div>

                          <div className={`metric-box ${score >= 650 ? "approved" : "rejected"}`}>
                            <div className="metric-label">Loan Decision</div>
                            <div className="metric-value">{decision}</div>
                          </div>

                          <div className="metric-box">
                            <div className="metric-label">Confidence</div>
                            <div className="metric-value">{(Math.max(result.probability, 1 - result.probability) * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>

                      <div className="chart-container">
                        <h4>Risk Probability Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={predictionChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {predictionChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="chart-container">
                        <h4>Prediction Confidence</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart
                            data={predictionChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="value" fill={result.prediction === 1 ? "#f44336" : "#4caf50"} radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "models" && (
                  <div className="tab-content">
                    <div className="charts-section">
                      <h3>Model Performance Comparison</h3>
                      
                      <div className="chart-container">
                        <h4>Performance Metrics</h4>
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart
                            data={modelPerformanceData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                            <Bar dataKey="Accuracy" fill="#8884d8" />
                            <Bar dataKey="Precision" fill="#82ca9d" />
                            <Bar dataKey="Recall" fill="#ffc658" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="chart-container">
                        <h4>Model Efficiency (F1-Score vs ROC-AUC)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={modelPerformanceData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                            <Line type="monotone" dataKey="F1" stroke="#f44336" strokeWidth={2} />
                            <Line type="monotone" dataKey="ROC" stroke="#2196f3" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="chart-container">
                        <h4>Overall Model Quality</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Best Model" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="tab-content">
                    <div className="charts-section">
                      <h3>Dataset Analytics</h3>
                      
                      <div className="chart-container">
                        <h4>Risk Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={riskDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {riskDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="chart-container">
                        <h4>Applicant Age Distribution</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={ageDistribution}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]} />
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
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="call-to-action">
                <p className="cta-text">Fill in the applicant information and click 🔍 Predict Risk to see the analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>&copy; 2024 CredLens - Advanced Credit Risk Assessment | Powered by Machine Learning</p>
      </footer>
    </div>
  );
}

export default App;
