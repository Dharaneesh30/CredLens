import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const featureFields = [
  { name: "age", label: "Age (Years)", description: "18-100", type: "number", range: [18, 100] },
  { name: "job", label: "Job Level", description: "0-3 (0=Unskilled, 3=Highly Skilled)", type: "number", range: [0, 3] },
  { name: "housing", label: "Housing Status", description: "0=Own, 1=Rent, 2=Free", type: "number", range: [0, 2] },
  { name: "saving", label: "Saving Accounts", description: "0-3 (0=Unknown)", type: "number", range: [0, 3] },
  { name: "checking", label: "Checking Account", description: "0-3 (0=Unknown)", type: "number", range: [0, 3] },
  { name: "credit", label: "Credit Amount", description: "$0-50000", type: "number", range: [0, 50000] },
  { name: "duration", label: "Duration (Months)", description: "1-60 months", type: "number", range: [1, 60] },
  { name: "purpose", label: "Loan Purpose", description: "0-4", type: "number", range: [0, 4] },
  { name: "sex", label: "Gender", description: "0=Female, 1=Male", type: "number", range: [0, 1] },
  { name: "other", label: "Other Feature", description: "0/1", type: "number", range: [0, 1] }
];

const modelPerformanceData = [
  { name: "Random Forest", Accuracy: 100, Precision: 100, Recall: 100, F1: 100, ROC: 100 },
  { name: "XGBoost", Accuracy: 100, Precision: 100, Recall: 100, F1: 100, ROC: 100 },
  { name: "Gradient Boost", Accuracy: 100, Precision: 100, Recall: 100, F1: 100, ROC: 100 },
  { name: "Log. Regression", Accuracy: 100, Precision: 100, Recall: 100, F1: 100, ROC: 100 }
];

const riskDistributionData = [
  { name: "Low Risk", value: 45, fill: "#4caf50" },
  { name: "Medium Risk", value: 35, fill: "#ff9800" },
  { name: "High Risk", value: 20, fill: "#f44336" }
];

const ageDistributionData = [
  { range: "18-25", count: 120 },
  { range: "26-35", count: 280 },
  { range: "36-45", count: 350 },
  { range: "46-55", count: 200 },
  { range: "55+", count: 150 }
];

const creditAmountDistribution = [
  { range: "$0-5K", count: 250 },
  { range: "$5K-10K", count: 380 },
  { range: "$10K-20K", count: 420 },
  { range: "$20K-30K", count: 280 },
  { range: "$30K+", count: 170 }
];

const radarChartData = [
  { metric: "Accuracy", value: 100 },
  { metric: "Precision", value: 100 },
  { metric: "Recall", value: 100 },
  { metric: "F1-Score", value: 100 },
  { metric: "ROC-AUC", value: 100 }
];

const edaInsights = [
  "Low-risk applicants make up the largest share of the dataset, while high-risk applicants remain a smaller but critical segment.",
  "Majority of borrowers fall in the 26-45 age range, which should be a focus for model calibration.",
  "Credit amounts cluster below $20K, with fewer applications in the highest loan tiers.",
  "The dataset appears balanced enough for classification, but edge cases should be reviewed for housing and savings categories."
];

function App() {
  const [formData, setFormData] = useState(
    featureFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartImages, setChartImages] = useState([]);
  const [activeTab, setActiveTab] = useState("prediction");
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

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

  const analysisInsights = useMemo(() => {
    if (!result) return [];

    const insights = [];
    const score = calculateCreditScore(result.probability);
    const riskLabel = result.prediction === 1 ? "high risk" : "low risk";
    const carriesMoreRisk = result.prediction === 1 ? "This profile is likely to be rejected." : "This profile looks favorable for approval.";

    const credit = Number(formData.credit || 0);
    const duration = Number(formData.duration || 0);
    const saving = Number(formData.saving || 0);
    const job = Number(formData.job || 0);
    const housing = Number(formData.housing || 0);

    insights.push(`Model predicts ${riskLabel} with ${(result.probability * 100).toFixed(1)}% probability.`);
    insights.push(`The credit score is ${score}, which places the application in the ${getRiskLevel(score)} category.`);

    if (credit > 20000) {
      insights.push("The requested credit amount is high, which increases risk and may require stronger collateral or documentation.");
    } else if (credit > 10000) {
      insights.push("The credit amount is moderate, so the model is especially sensitive to duration and repayment capacity.");
    } else {
      insights.push("The credit amount is below the dataset average, which generally supports a lower risk prediction.");
    }

    if (duration > 36) {
      insights.push("A long repayment duration can increase default risk, especially for larger loan amounts.");
    } else {
      insights.push("A shorter loan duration improves repayment confidence for this applicant.");
    }

    if (saving <= 1) {
      insights.push("Low or unknown savings raise risk because there is less financial buffer for repayment.");
    } else {
      insights.push("Savings are adequate, improving the applicant's ability to handle monthly installments.");
    }

    if (job >= 3) {
      insights.push("The applicant's job level is strong, which supports a more stable repayment outlook.");
    } else if (job <= 1) {
      insights.push("Lower job skill suggests income may be less stable, raising risk.");
    }

    if (housing === 1) {
      insights.push("Rented housing often correlates with slightly higher risk than ownership.");
    }

    insights.push(carriesMoreRisk);
    return insights;
  }, [result, formData]);

  const predictionChartData = useMemo(() => {
    if (!result) return [];

    const riskProb = Math.round(result.probability * 100);
    const safeProb = 100 - riskProb;

    return [
      {
        name: "Risk Probability",
        value: riskProb,
        fill: result.prediction === 1 ? "#f44336" : "#4caf50"
      },
      {
        name: "Safety Margin",
        value: safeProb,
        fill: "#e0e0e0"
      }
    ];
  }, [result]);

  const analysisChartData = useMemo(() => {
    if (!result) return [];

    const scorePercent = Math.round(((result.credit_score - 300) / 550) * 100);
    const riskProb = Math.round(result.probability * 100);
    const confidence = Math.round(Math.max(result.probability, 1 - result.probability) * 100);
    const duration = Number(formData.duration || 0);
    const savings = Number(formData.saving || 0);

    return [
      { metric: "Risk Probability", value: riskProb, fill: "#f44336" },
      { metric: "Approval Confidence", value: confidence, fill: "#4caf50" },
      { metric: "Score Strength", value: scorePercent, fill: "#2196f3" },
      { metric: "Duration Impact", value: Math.min(100, Math.round((duration / 60) * 100)), fill: "#ff9800" },
      { metric: "Savings Strength", value: Math.min(100, Math.round((savings / 3) * 100)), fill: "#9c27b0" }
    ];
  }, [result, formData]);

  const inputProfileData = useMemo(() => {
    if (!result) return [];

    return [
      { name: "Credit Amount", value: Number(formData.credit || 0), fill: "#3f51b5" },
      { name: "Duration", value: Number(formData.duration || 0), fill: "#009688" },
      { name: "Savings", value: Number(formData.saving || 0) * 25, fill: "#ff9800" },
      { name: "Job", value: Number(formData.job || 0) * 25, fill: "#607d8b" },
      { name: "Housing", value: Number(formData.housing || 0) * 33, fill: "#795548" }
    ];
  }, [result, formData]);

  useEffect(() => {
    const fetchChartImages = async () => {
      try {
        const response = await fetch("/charts");
        const data = await response.json();
        if (data.images) {
          setChartImages(data.images);
        }
      } catch (err) {
        console.warn("Could not load backend chart gallery:", err.message);
      }
    };

    fetchChartImages();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const inputArray = featureFields.map((field) => Number(formData[field.name] || 0));

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ input: inputArray })
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        setActiveTab("analysis");
      } else {
        setError(data.error || `Prediction failed (${response.status}).`);
      }
    } catch (err) {
      setError(`Unable to reach the backend at ${API_BASE_URL}. Make sure the API is running.`);
      console.error("Prediction fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const score = result ? calculateCreditScore(result.probability) : 0;
  const riskLevel = result ? getRiskLevel(score) : "";
  const decision = result ? getLoanDecision(score) : ""; 

  return (
    <div className="app-shell">
      <header className="hero-banner">
        <div>
          <h1>💳 CredLens</h1>
          <p>Advanced Credit Risk Assessment Platform with Real-time Predictions & Analytics</p>
        </div>
      </header>

      <main className="page-content">
        {/* INPUT FORM CARD */}
        <section className="card card-form">
          <h2>📋 Applicant Information</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            {featureFields.map((field) => (
              <label key={field.name} className="field-group">
                <span>
                  <strong>{field.label}</strong>
                  <small className="field-description">{field.description}</small>
                </span>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={`${field.label}`}
                  min={field.range[0]}
                  max={field.range[1]}
                  required
                />
              </label>
            ))}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "⏳ Analyzing..." : "🔍 Predict Risk"}
            </button>
          </form>

          {error && <div className="alert error-alert">❌ {error}</div>}
        </section>

        {/* RESULTS & TABS */}
        {result && (
          <>
            {/* METRICS SECTION */}
            <section className="card metrics-card">
              <h2>📊 Risk Assessment Results</h2>
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
            </section>

            {/* TABS FOR CHARTS */}
            <section className="card tabs-card">
              <div className="tab-buttons">
                <button
                  className={`tab-btn ${activeTab === "prediction" ? "active" : ""}`}
                  onClick={() => setActiveTab("prediction")}
                >
                  📊 Prediction
                </button>
                <button
                  className={`tab-btn ${activeTab === "analysis" ? "active" : ""}`}
                  onClick={() => setActiveTab("analysis")}
                >
                  📈 Analysis
                </button>
                <button
                  className={`tab-btn ${activeTab === "eda" ? "active" : ""}`}
                  onClick={() => setActiveTab("eda")}
                >
                  📊 EDA
                </button>
              </div>

              {/* PREDICTION TAB */}
              {activeTab === "prediction" && (
                <div className="tab-content">
                  <div className="chart-card">
                    <h3>Risk Probability Distribution</h3>
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

                  <div className="chart-card">
                    <h3>Prediction Confidence</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={predictionChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar
                          dataKey="value"
                          fill={result.prediction === 1 ? "#f44336" : "#4caf50"}
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Applicant Input Profile</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={inputProfileData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {inputProfileData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* ANALYSIS TAB */}
              {activeTab === "analysis" && (
                <div className="tab-content">
                  <div className="chart-card">
                    <h3>Prediction Analysis Overview</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={analysisChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" angle={-45} textAnchor="end" height={100} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="value">
                          {analysisChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
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
                      <BarChart
                        data={inputProfileData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {inputProfileData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analysis-summary">
                    <h3>Key Analysis Insights</h3>
                    <ul>
                      {result.analysis ? result.analysis.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      )) : analysisInsights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* EDA TAB */}
              {activeTab === "eda" && (
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
                            <Cell key={`cell-${index}`} fill={entry.fill} />
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
              )}
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>&copy; 2024 CredLens - Advanced Credit Risk Assessment | Powered by Machine Learning</p>
      </footer>
    </div>
  );
}

export default App;
