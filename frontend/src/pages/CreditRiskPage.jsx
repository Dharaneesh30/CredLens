import React, { useEffect, useMemo, useState } from "react";

import ApplicantForm from "../components/forms/ApplicantForm";
import ResultsSummary from "../components/results/ResultsSummary";
import AdvisorTab from "../components/tabs/AdvisorTab";
import AnalysisTab from "../components/tabs/AnalysisTab";
import EdaTab from "../components/tabs/EdaTab";
import PredictionTab from "../components/tabs/PredictionTab";
import TabsNav from "../components/tabs/TabsNav";
import { edaInsights, riskDistributionData, ageDistributionData, creditAmountDistribution } from "../data/edaData";
import { featureFields, fieldSections, initializeFormData, sampleApplicantProfile } from "../data/featureFields";
import {
  fetchAdvisorSuggestion,
  fetchBackendHealth,
  fetchAdvisorHistory,
  fetchCharts,
  fetchModelHealth,
  fetchOllamaHealth,
  fetchPrediction,
} from "../services/api";
import { calculateCreditScore, getLoanDecision, getRiskLevel } from "../utils/risk";


const barPalette = ["#3b82f6", "#34d399", "#f59e0b", "#f97316", "#0ea5e9", "#a3e635", "#f43f5e", "#22d3ee"];


function CreditRiskPage() {
  const [formData, setFormData] = useState(() => initializeFormData());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("eda");
  const [chartImages, setChartImages] = useState([]);

  const [advisorQuery, setAdvisorQuery] = useState(
    "Should we approve this loan, and from what perspective should we lend?"
  );
  const [advisorModel, setAdvisorModel] = useState("llama3.2");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState(null);
  const [advisorResponse, setAdvisorResponse] = useState(null);
  const [healthStatus, setHealthStatus] = useState({
    backend: "unknown",
    model: "unknown",
    ollama: "unknown",
  });
  const [advisorHistory, setAdvisorHistory] = useState([]);

  useEffect(() => {
    const loadCharts = async () => {
      try {
        const images = await fetchCharts();
        setChartImages(images);
      } catch {
        setChartImages([]);
      }
    };

    loadCharts();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchAdvisorHistory(15);
        setAdvisorHistory(data.records || []);
      } catch {
        setAdvisorHistory([]);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const [backend, model, ollama] = await Promise.all([
          fetchBackendHealth(),
          fetchModelHealth(),
          fetchOllamaHealth(),
        ]);
        setHealthStatus({
          backend: backend.status || "unknown",
          model: model.status || "unknown",
          ollama: ollama.status || "unknown",
        });
      } catch {
        setHealthStatus({ backend: "error", model: "error", ollama: "error" });
      }
    };

    checkHealth();
  }, []);

  const completion = useMemo(() => {
    const filled = featureFields.filter((field) => String(formData[field.name]).trim() !== "").length;
    return Math.round((filled / featureFields.length) * 100);
  }, [formData]);

  const analysisInsights = useMemo(() => {
    if (!result) {
      return [];
    }

    const insights = [];
    const score = result.credit_score ?? calculateCreditScore(result.probability);
    const credit = Number(formData.credit || 0);
    const duration = Number(formData.duration || 0);
    const saving = Number(formData.saving || 0);
    const job = Number(formData.job || 0);
    const housing = Number(formData.housing || 0);

    insights.push(`Predicted risk probability is ${(result.probability * 100).toFixed(1)}% with score ${score}.`);
    insights.push(`This application is currently classified as ${result.prediction === 1 ? "high risk" : "low risk"}.`);

    if (credit > 20000) {
      insights.push("Requested exposure is high and may require collateral or stricter covenants.");
    } else if (credit > 10000) {
      insights.push("Requested amount is moderate, so repayment duration strongly influences risk.");
    } else {
      insights.push("Requested amount is comparatively low, which usually improves affordability.");
    }

    if (duration > 36) {
      insights.push("Long tenure increases default uncertainty and should be monitored carefully.");
    } else {
      insights.push("Shorter tenure generally supports stronger repayment confidence.");
    }

    if (saving <= 1) {
      insights.push("Savings profile is weak and indicates limited financial buffer.");
    } else {
      insights.push("Savings category suggests better resilience against income shocks.");
    }

    if (job >= 3) {
      insights.push("Higher job level is a positive signal for stable repayment behavior.");
    } else if (job <= 1) {
      insights.push("Lower job level may indicate unstable income and elevated risk.");
    }

    if (housing === 1) {
      insights.push("Rental status can add recurring expense pressure compared with ownership.");
    }

    return insights;
  }, [result, formData]);

  const predictionChartData = useMemo(() => {
    if (!result) {
      return [];
    }
    const riskProb = Math.round(result.probability * 100);
    return [
      { name: "Risk Probability", value: riskProb, fill: "#f97316" },
      { name: "Safety Margin", value: 100 - riskProb, fill: "#22c55e" },
    ];
  }, [result]);

  const analysisChartData = useMemo(() => {
    if (!result) {
      return [];
    }

    const score = result.credit_score ?? calculateCreditScore(result.probability);
    const scorePercent = Math.round(((score - 300) / 550) * 100);
    const riskProb = Math.round(result.probability * 100);
    const confidence = Math.round((result.confidence ?? Math.max(result.probability, 1 - result.probability)) * 100);
    const duration = Number(formData.duration || 0);
    const savings = Number(formData.saving || 0);

    return [
      { metric: "Risk Probability", value: riskProb, fill: "#f97316" },
      { metric: "Approval Confidence", value: confidence, fill: "#22c55e" },
      { metric: "Score Strength", value: scorePercent, fill: "#3b82f6" },
      { metric: "Duration Impact", value: Math.min(100, Math.round((duration / 60) * 100)), fill: "#f59e0b" },
      { metric: "Savings Strength", value: Math.min(100, Math.round((savings / 3) * 100)), fill: "#0ea5e9" },
    ];
  }, [result, formData]);

  const inputProfileData = useMemo(() => {
    if (!result) {
      return [];
    }

    return featureFields.map((field, index) => {
      const value = Number(formData[field.name] || 0);
      const min = typeof field.min === "number" ? field.min : 0;
      const max = typeof field.max === "number" ? field.max : (field.options ? field.options.length - 1 : 100);
      const normalized = max > min ? Math.round(((value - min) / (max - min)) * 100) : 0;

      return {
        name: field.label,
        value: Math.max(0, Math.min(100, normalized)),
        fill: barPalette[index % barPalette.length],
      };
    });
  }, [result, formData]);

  const snapshotItems = useMemo(
    () => [
      { label: "Credit Amount", value: formData.credit ? `$${Number(formData.credit).toLocaleString()}` : "Not set" },
      { label: "Duration", value: formData.duration ? `${formData.duration} months` : "Not set" },
      { label: "Job Level", value: formData.job || "Not set" },
      { label: "Savings Band", value: formData.saving || "Not set" },
      { label: "Housing", value: formData.housing || "Not set" },
      { label: "Purpose", value: formData.purpose || "Not set" },
    ],
    [formData]
  );

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setAdvisorResponse(null);
    setAdvisorError(null);
  };

  const handleLoadSample = () => {
    setFormData(sampleApplicantProfile);
    clearResults();
  };

  const handleReset = () => {
    setFormData(initializeFormData());
    clearResults();
  };

  const handlePredictionSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setAdvisorResponse(null);
    setAdvisorError(null);
    setLoading(true);

    const inputArray = featureFields.map((field) => Number(formData[field.name] || 0));
    try {
      const data = await fetchPrediction(inputArray);
      setResult(data);
      setActiveTab("prediction");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvisorSubmit = async (event) => {
    event.preventDefault();
    if (!result) {
      setAdvisorError("Run prediction first, then ask the advisor.");
      return;
    }

    setAdvisorError(null);
    setAdvisorResponse(null);
    setAdvisorLoading(true);

    const applicantData = featureFields.reduce((acc, field) => {
      acc[field.name] = Number(formData[field.name] || 0);
      return acc;
    }, {});

    try {
      const response = await fetchAdvisorSuggestion({
        applicant_data: applicantData,
        prediction_result: {
          prediction: result.prediction,
          probability: result.probability,
          confidence: result.confidence ?? Math.max(result.probability, 1 - result.probability),
          credit_score: result.credit_score ?? calculateCreditScore(result.probability),
          decision: result.decision ?? getLoanDecision(result.credit_score ?? calculateCreditScore(result.probability)),
        },
        user_query: advisorQuery,
        model: advisorModel,
      });
      setAdvisorResponse(response);

      try {
        const data = await fetchAdvisorHistory(15);
        setAdvisorHistory(data.records || []);
      } catch {
        // no-op
      }

      setActiveTab("advisor");
    } catch (err) {
      setAdvisorError(err.message);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const score = result ? (result.credit_score ?? calculateCreditScore(result.probability)) : 0;
  const riskLevel = result ? getRiskLevel(score) : "";
  const decision = result ? getLoanDecision(score) : "";

  return (
    <div className="app-shell">
      <div className="bg-orb orb-a" aria-hidden="true" />
      <div className="bg-orb orb-b" aria-hidden="true" />
      <div className="bg-orb orb-c" aria-hidden="true" />

      <header className="hero">
        <div className="hero-copy">
          <span className="hero-tag">CredLens Underwriting Suite</span>
          <h1>CredLens</h1>
          <p>
            Professional credit-risk decisioning with ML scoring, policy reasoning, exploratory analytics,
            and AI-assisted loan perspective in one interface.
          </p>
          <div className="health-strip">
            <span>Backend: {healthStatus.backend}</span>
            <span>Model: {healthStatus.model}</span>
            <span>Ollama: {healthStatus.ollama}</span>
          </div>
        </div>
        <aside className="panel hero-card">
          <h2>Decision Modes</h2>
          <ul>
            <li>Prediction for immediate risk and confidence scoring.</li>
            <li>Analysis for deeper factor-level interpretation.</li>
            <li>EDA for portfolio-level risk context and diagnostics.</li>
            <li>AI Advisor for approval perspective and mitigation strategies.</li>
          </ul>
        </aside>
      </header>

      <main className="page-content">
        <section className="layout-two">
          <ApplicantForm
            fieldSections={fieldSections}
            featureFields={featureFields}
            formData={formData}
            completion={completion}
            onChange={handleFormChange}
            onSubmit={handlePredictionSubmit}
            onLoadSample={handleLoadSample}
            onReset={handleReset}
            loading={loading}
            error={error}
          />

          <aside className="side-column">
            <section className="panel side-panel">
              <span className="kicker">Applicant Snapshot</span>
              <h3>Current Input State</h3>
              <div className="snapshot-grid">
                {snapshotItems.map((item) => (
                  <div className="snapshot-item" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel side-panel">
              <span className="kicker">Checklist</span>
              <h3>Before You Submit</h3>
              <ul>
                <li>Confirm all select fields are mapped to the correct encoded category.</li>
                <li>Review amount and duration for underwriting feasibility.</li>
                <li>Use sample profile for a quick demo run of the full dashboard.</li>
              </ul>
            </section>
          </aside>
        </section>

        {result && <ResultsSummary result={result} score={score} riskLevel={riskLevel} decision={decision} />}

        <section className="panel workspace-panel">
          <div className="workspace-head">
            <div>
              <span className="kicker">Decision Workspace</span>
              <h2>Prediction, Analytics, and Advisory Views</h2>
              <p>EDA is always available; prediction-specific views unlock after scoring an applicant.</p>
            </div>
            {result && (
              <button className="btn btn-ghost" type="button" onClick={clearResults}>
                Clear Results
              </button>
            )}
          </div>

          <TabsNav activeTab={activeTab} onTabChange={setActiveTab} hasResult={Boolean(result)} />

          {activeTab === "prediction" &&
            (result ? (
              <PredictionTab
                predictionChartData={predictionChartData}
                inputProfileData={inputProfileData}
                result={result}
              />
            ) : (
              <div className="panel empty-panel">
                Run a prediction first to open the Prediction and Analysis tabs.
              </div>
            ))}

          {activeTab === "analysis" &&
            (result ? (
              <AnalysisTab analysisChartData={analysisChartData} result={result} analysisInsights={analysisInsights} />
            ) : (
              <div className="panel empty-panel">
                Analysis requires model output. Submit the form to continue.
              </div>
            ))}

          {activeTab === "eda" && (
            <EdaTab
              riskDistributionData={riskDistributionData}
              ageDistributionData={ageDistributionData}
              creditAmountDistribution={creditAmountDistribution}
              edaInsights={edaInsights}
              chartImages={chartImages}
            />
          )}

          {activeTab === "advisor" &&
            (result ? (
              <AdvisorTab
                advisorModel={advisorModel}
                setAdvisorModel={setAdvisorModel}
                advisorQuery={advisorQuery}
                setAdvisorQuery={setAdvisorQuery}
                onSubmit={handleAdvisorSubmit}
                loading={advisorLoading}
                error={advisorError}
                response={advisorResponse}
                healthStatus={healthStatus}
                history={advisorHistory}
              />
            ) : (
              <div className="panel empty-panel">
                Ask the AI advisor after a prediction so it can use both inputs and model results.
              </div>
            ))}
        </section>
      </main>

      <footer className="app-footer">
        <p>CredLens | Machine-learning credit risk platform for responsible lending decisions.</p>
      </footer>
    </div>
  );
}


export default CreditRiskPage;
