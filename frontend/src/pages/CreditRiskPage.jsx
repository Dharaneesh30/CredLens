import React, { useEffect, useMemo, useState } from "react";

import ApplicantForm from "../components/forms/ApplicantForm";
import ResultsSummary from "../components/results/ResultsSummary";
import AdvisorTab from "../components/tabs/AdvisorTab";
import AnalysisTab from "../components/tabs/AnalysisTab";
import EdaTab from "../components/tabs/EdaTab";
import PredictionTab from "../components/tabs/PredictionTab";
import TabsNav from "../components/tabs/TabsNav";
import { edaInsights, riskDistributionData, ageDistributionData, creditAmountDistribution } from "../data/edaData";
import { featureFields } from "../data/featureFields";
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


function CreditRiskPage() {
  const [formData, setFormData] = useState(
    featureFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("prediction");
  const [chartImages, setChartImages] = useState([]);

  const [advisorQuery, setAdvisorQuery] = useState(
    "Should we approve this loan, and from what perspective should we give the loan?"
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

  const analysisInsights = useMemo(() => {
    if (!result) return [];
    const insights = [];
    const score = result.credit_score ?? calculateCreditScore(result.probability);
    const riskLabel = result.prediction === 1 ? "high risk" : "low risk";
    const carriesMoreRisk = result.prediction === 1
      ? "This profile is likely to be rejected."
      : "This profile looks favorable for approval.";

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
    return [
      { name: "Risk Probability", value: riskProb, fill: result.prediction === 1 ? "#f44336" : "#4caf50" },
      { name: "Safety Margin", value: 100 - riskProb, fill: "#e0e0e0" },
    ];
  }, [result]);

  const analysisChartData = useMemo(() => {
    if (!result) return [];
    const score = result.credit_score ?? calculateCreditScore(result.probability);
    const scorePercent = Math.round(((score - 300) / 550) * 100);
    const riskProb = Math.round(result.probability * 100);
    const confidence = Math.round((result.confidence ?? Math.max(result.probability, 1 - result.probability)) * 100);
    const duration = Number(formData.duration || 0);
    const savings = Number(formData.saving || 0);

    return [
      { metric: "Risk Probability", value: riskProb, fill: "#f44336" },
      { metric: "Approval Confidence", value: confidence, fill: "#4caf50" },
      { metric: "Score Strength", value: scorePercent, fill: "#2196f3" },
      { metric: "Duration Impact", value: Math.min(100, Math.round((duration / 60) * 100)), fill: "#ff9800" },
      { metric: "Savings Strength", value: Math.min(100, Math.round((savings / 3) * 100)), fill: "#9c27b0" },
    ];
  }, [result, formData]);

  const inputProfileData = useMemo(() => {
    if (!result) return [];
    return [
      { name: "Credit Amount", value: Number(formData.credit || 0), fill: "#3f51b5" },
      { name: "Duration", value: Number(formData.duration || 0), fill: "#009688" },
      { name: "Savings", value: Number(formData.saving || 0) * 25, fill: "#ff9800" },
      { name: "Job", value: Number(formData.job || 0) * 25, fill: "#607d8b" },
      { name: "Housing", value: Number(formData.housing || 0) * 33, fill: "#795548" },
    ];
  }, [result, formData]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
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
      setActiveTab("analysis");
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
      <header className="hero-banner">
        <div>
          <h1>CredLens</h1>
          <p>Machine Learning-Based Credit Risk Scoring System</p>
        </div>
      </header>

      <main className="page-content">
        <ApplicantForm
          featureFields={featureFields}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handlePredictionSubmit}
          loading={loading}
          error={error}
        />

        {result && (
          <>
            <ResultsSummary result={result} score={score} riskLevel={riskLevel} decision={decision} />

            <section className="card tabs-card">
              <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />

              {activeTab === "prediction" && (
                <PredictionTab
                  predictionChartData={predictionChartData}
                  inputProfileData={inputProfileData}
                  result={result}
                />
              )}

              {activeTab === "analysis" && (
                <AnalysisTab
                  analysisChartData={analysisChartData}
                  inputProfileData={inputProfileData}
                  result={result}
                  analysisInsights={analysisInsights}
                />
              )}

              {activeTab === "eda" && (
                <EdaTab
                  riskDistributionData={riskDistributionData}
                  ageDistributionData={ageDistributionData}
                  creditAmountDistribution={creditAmountDistribution}
                  edaInsights={edaInsights}
                  chartImages={chartImages}
                />
              )}

              {activeTab === "advisor" && (
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
              )}
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 CredLens - Advanced Credit Risk Assessment | Powered by Machine Learning</p>
      </footer>
    </div>
  );
}


export default CreditRiskPage;
