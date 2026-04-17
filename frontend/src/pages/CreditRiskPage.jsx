import React, { useEffect, useMemo, useState } from "react";

import AnalysisTab from "../components/tabs/AnalysisTab";
import ApplicationsPage from "./ApplicationsPage";
import DatasetResultsPage from "./DatasetResultsPage";
import HomePage from "./HomePage";
import PortfolioAnalyticsPage from "./PortfolioAnalyticsPage";
import WorkspacePage from "./WorkspacePage";
import {
  analyzeDataset,
  fetchAdvisorHistory,
  fetchAdvisorSuggestion,
  fetchBackendHealth,
  fetchCharts,
  fetchModelHealth,
  fetchOllamaHealth,
} from "../services/api";


const PAGE_CONFIG = {
  home: { label: "Home" },
  workspace: { label: "Workspace" },
  applications: { label: "Applications" },
  results: { label: "Dataset Results" },
  portfolio: { label: "Portfolio Analytics" },
};

const DATASET_STORAGE_KEY = "credlens_dataset_result";
const REVIEW_STORAGE_KEY = "credlens_review_actions";
const DECISION_COLORS = {
  Approve: "#41c985",
  "Conditional Approval": "#f4b942",
  "Manual Review": "#5da9ff",
  "Review / Reject": "#ff6b6b",
};

const resolveApplicantDecision = (applicant, reviewAction) => {
  if (reviewAction === "Approved") {
    return "Approve";
  }

  if (reviewAction === "Rejected") {
    return "Review / Reject";
  }

  return applicant.decision;
};

const resolveReviewStatus = (applicant, reviewAction) => {
  if (reviewAction) {
    return reviewAction;
  }

  if (applicant.decision === "Approve") {
    return "Approved";
  }

  if (applicant.decision === "Review / Reject") {
    return "Rejected";
  }

  return "Pending";
};

const resolveRiskBand = (probability) => {
  if (probability < 0.2) return "Low";
  if (probability < 0.4) return "Guarded";
  if (probability < 0.6) return "Elevated";
  return "High";
};

const parseHashRoute = () => {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return PAGE_CONFIG[hash] ? hash : "home";
};


function CreditRiskPage() {
  const [currentPage, setCurrentPage] = useState(parseHashRoute);
  const [datasetFile, setDatasetFile] = useState(null);
  const [datasetResult, setDatasetResult] = useState(() => {
    try {
      const raw = window.localStorage.getItem(DATASET_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [reviewActions, setReviewActions] = useState(() => {
    try {
      const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartImages, setChartImages] = useState([]);

  const [advisorQuery, setAdvisorQuery] = useState(
    "Should we approve this applicant, under what conditions, and what lending perspective should the platform take?"
  );
  const [advisorModel, setAdvisorModel] = useState("llama3.2");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState(null);
  const [advisorResponse, setAdvisorResponse] = useState(null);
  const [advisorHistory, setAdvisorHistory] = useState([]);
  const [healthStatus, setHealthStatus] = useState({
    backend: "unknown",
    model: "unknown",
    ollama: "unknown",
  });

  useEffect(() => {
    const onHashChange = () => setCurrentPage(parseHashRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    try {
      if (datasetResult) {
        window.localStorage.setItem(DATASET_STORAGE_KEY, JSON.stringify(datasetResult));
      }
    } catch {
      // no-op
    }
  }, [datasetResult]);

  useEffect(() => {
    try {
      window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviewActions));
    } catch {
      // no-op
    }
  }, [reviewActions]);

  useEffect(() => {
    const loadCharts = async () => {
      try {
        const images = await fetchCharts();
        setChartImages(images);
      } catch {
        setChartImages([]);
      }
    };

    const loadHistory = async () => {
      try {
        const data = await fetchAdvisorHistory(12);
        setAdvisorHistory(data.records || []);
      } catch {
        setAdvisorHistory([]);
      }
    };

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

    loadCharts();
    loadHistory();
    checkHealth();
  }, []);

  const navigate = (page) => {
    window.location.hash = `/${page}`;
  };

  const applicants = useMemo(() => {
    const rawApplicants = datasetResult?.applicants || [];
    return rawApplicants.map((item) => ({
      ...item,
      review_action: reviewActions[item.applicant_id] || null,
      final_decision: resolveApplicantDecision(item, reviewActions[item.applicant_id] || null),
      review_status: resolveReviewStatus(item, reviewActions[item.applicant_id] || null),
    }));
  }, [datasetResult, reviewActions]);

  const filteredApplicants = useMemo(() => {
    if (applicationFilter === "all") return applicants;
    return applicants.filter((item) => item.review_status === applicationFilter);
  }, [applicants, applicationFilter]);

  const summary = useMemo(() => {
    if (!datasetResult?.summary) {
      return null;
    }

    const totalApplicants = applicants.length;
    const approveCount = applicants.filter((item) => item.final_decision === "Approve").length;
    const conditionalApprovalCount = applicants.filter((item) => item.final_decision === "Conditional Approval").length;
    const manualReviewCount = applicants.filter((item) => item.final_decision === "Manual Review").length;
    const reviewRejectCount = applicants.filter((item) => item.final_decision === "Review / Reject").length;
    const reviewedCount = applicants.filter((item) => item.review_action != null).length;
    const rejectedCount = applicants.filter((item) => item.review_status === "Rejected").length;
    const pendingReviewCount = applicants.filter((item) => item.review_status === "Pending").length;
    const averageRiskProbability =
      totalApplicants === 0
        ? 0
        : (
            applicants.reduce((total, item) => total + Number(item.probability || 0), 0) /
            totalApplicants *
            100
          ).toFixed(1);

    return {
      ...datasetResult.summary,
      total_applicants: totalApplicants,
      approve_count: approveCount,
      conditional_count: conditionalApprovalCount,
      conditional_approval_count: conditionalApprovalCount,
      manual_review_count: manualReviewCount,
      review_count: reviewRejectCount,
      reviewed_count: reviewedCount,
      rejected_count: rejectedCount,
      pending_review_count: pendingReviewCount,
      approval_rate: totalApplicants === 0 ? 0 : ((approveCount / totalApplicants) * 100).toFixed(1),
      average_risk_probability: averageRiskProbability,
    };
  }, [applicants, datasetResult]);

  const derivedCharts = useMemo(() => {
    if (!applicants.length) {
      return null;
    }

    const decisionLabels = ["Approve", "Conditional Approval", "Manual Review", "Review / Reject"];
    const decisionDistribution = decisionLabels.map((name) => ({
      name,
      value: applicants.filter((item) => item.final_decision === name).length,
      fill: DECISION_COLORS[name],
    }));

    const riskBandLabels = ["Low", "Guarded", "Elevated", "High"];
    const riskBandColors = {
      Low: "#41c985",
      Guarded: "#7df0d6",
      Elevated: "#f4b942",
      High: "#ff6b6b",
    };
    const riskBandDistribution = riskBandLabels.map((name) => ({
      name,
      value: applicants.filter((item) => resolveRiskBand(Number(item.probability || 0)) === name).length,
      fill: riskBandColors[name],
    }));

    const purposeCounts = applicants.reduce((acc, applicant) => {
      const key = String(applicant.applicant_data.purpose || "Other");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const purposeDistribution = Object.entries(purposeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const scoreBands = [
      { range: "300-399", count: 0 },
      { range: "400-499", count: 0 },
      { range: "500-599", count: 0 },
      { range: "600-699", count: 0 },
      { range: "700-850", count: 0 },
    ];

    applicants.forEach((applicant) => {
      const score = Number(applicant.credit_score || 0);
      if (score < 400) scoreBands[0].count += 1;
      else if (score < 500) scoreBands[1].count += 1;
      else if (score < 600) scoreBands[2].count += 1;
      else if (score < 700) scoreBands[3].count += 1;
      else scoreBands[4].count += 1;
    });

    return {
      decision_distribution: decisionDistribution,
      risk_band_distribution: riskBandDistribution,
      purpose_distribution: purposeDistribution,
      score_distribution: scoreBands,
    };
  }, [applicants]);

  const selectedApplicant = useMemo(() => {
    if (!applicants.length) return null;
    return applicants.find((item) => item.applicant_id === selectedApplicantId) || applicants[0];
  }, [applicants, selectedApplicantId]);

  useEffect(() => {
    if (applicants.length > 0 && !selectedApplicantId) {
      setSelectedApplicantId(applicants[0].applicant_id);
    }
  }, [applicants, selectedApplicantId]);

  const analysisChartData = useMemo(() => {
    if (!selectedApplicant) return [];
    const incomeStrength = Math.min(100, Math.round((Number(selectedApplicant.applicant_data.income || 0) / 120000) * 100));
    const employmentStrength = Math.min(100, Math.round((Number(selectedApplicant.applicant_data.employment_years || 0) / 12) * 100));
    const dtiLoad = Math.min(100, Math.round(Number(selectedApplicant.applicant_data.debt_to_income || 0) * 100));
    const loanLoad = Math.min(
      100,
      Math.round((Number(selectedApplicant.applicant_data.loan_amount || 0) / Math.max(Number(selectedApplicant.applicant_data.income || 1), 1)) * 100)
    );
    return [
      { metric: "Risk Probability", value: Math.round(selectedApplicant.probability * 100), fill: "#ff6b6b" },
      { metric: "Confidence", value: Math.round(selectedApplicant.confidence * 100), fill: "#41c985" },
      { metric: "Credit Score", value: Math.round(((selectedApplicant.credit_score - 300) / 550) * 100), fill: "#5da9ff" },
      { metric: "Income Strength", value: incomeStrength, fill: "#3dd6d0" },
      { metric: "Employment", value: employmentStrength, fill: "#ae8bff" },
      { metric: "DTI Load", value: dtiLoad, fill: "#f4b942" },
      { metric: "Loan Load", value: loanLoad, fill: "#ff8f6b" },
    ];
  }, [selectedApplicant]);

  const inputProfileData = useMemo(() => {
    if (!selectedApplicant) return [];
    return [
      { name: "Age", value: Number(selectedApplicant.applicant_data.age || 0), fill: "#5da9ff" },
      { name: "Income", value: Number(selectedApplicant.applicant_data.income || 0), fill: "#41c985" },
      { name: "Loan Amount", value: Number(selectedApplicant.applicant_data.loan_amount || 0), fill: "#ae8bff" },
      { name: "Credit Score", value: Number(selectedApplicant.applicant_data.credit_score || 0), fill: "#5da9ff" },
      { name: "DTI", value: Number(selectedApplicant.applicant_data.debt_to_income || 0) * 100, fill: "#f4b942" },
      { name: "Employment", value: Number(selectedApplicant.applicant_data.employment_years || 0) * 8, fill: "#3dd6d0" },
      { name: "Credit Lines", value: Number(selectedApplicant.applicant_data.num_credit_lines || 0) * 10, fill: "#ff8f6b" },
    ];
  }, [selectedApplicant]);

  const analysisInsights = useMemo(() => {
    if (!selectedApplicant) return [];

    const insights = [
      `${selectedApplicant.applicant_id} is scored at ${selectedApplicant.credit_score} with ${(selectedApplicant.probability * 100).toFixed(1)}% default risk.`,
      `The policy engine recommends ${selectedApplicant.decision.toLowerCase()} with ${(selectedApplicant.confidence * 100).toFixed(1)}% confidence.`,
    ];

    if (selectedApplicant.review_action) {
      insights.push(`Underwriter review decision has been marked as ${selectedApplicant.review_action.toLowerCase()}.`);
    }

    if (Array.isArray(selectedApplicant.policy_reasons) && selectedApplicant.policy_reasons.length > 0) {
      insights.push(...selectedApplicant.policy_reasons);
    }

    if (Number(selectedApplicant.applicant_data.loan_amount || 0) > 20000) {
      insights.push("Requested loan amount is on the higher side, so approval should be paired with stronger controls.");
    }

    if (Number(selectedApplicant.applicant_data.debt_to_income || 0) > 0.45) {
      insights.push("Debt-to-income is elevated, which makes repayment capacity more fragile.");
    }

    if (Number(selectedApplicant.applicant_data.employment_years || 0) < 2) {
      insights.push("Short employment history reduces confidence in stable income continuity.");
    }

    if (selectedApplicant.actual_target != null) {
      insights.push(
        selectedApplicant.actual_target === 1
          ? "The uploaded target labels this applicant as a historical default case."
          : "The uploaded target labels this applicant as a historical non-default case."
      );
    }

    return insights.slice(0, 8);
  }, [selectedApplicant]);

  const handleDatasetSubmit = async (event) => {
    event.preventDefault();
    if (!datasetFile) {
      setError("Choose a CSV dataset to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setDatasetResult(null);
    setAdvisorResponse(null);
    setAdvisorError(null);

    try {
      const data = await analyzeDataset(datasetFile);
      setReviewActions({});
      setDatasetResult(data);
      setSelectedApplicantId(data.applicants?.[0]?.applicant_id || null);
      navigate("workspace");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvisorSubmit = async (event) => {
    event.preventDefault();
    if (!selectedApplicant) {
      setAdvisorError("Upload and analyze a dataset first, then select an applicant.");
      return;
    }

    setAdvisorLoading(true);
    setAdvisorError(null);
    setAdvisorResponse(null);

    try {
      const response = await fetchAdvisorSuggestion({
        applicant_data: selectedApplicant.applicant_data,
        prediction_result: {
          prediction: selectedApplicant.prediction,
          probability: selectedApplicant.probability,
          confidence: selectedApplicant.confidence,
          credit_score: selectedApplicant.credit_score,
          decision: selectedApplicant.decision,
        },
        user_query: advisorQuery,
        model: advisorModel,
      });
      setAdvisorResponse(response);
      try {
        const data = await fetchAdvisorHistory(12);
        setAdvisorHistory(data.records || []);
      } catch {
        // no-op
      }
    } catch (err) {
      setAdvisorError(err.message);
    } finally {
      setAdvisorLoading(false);
    }
  };

  const handleInspectApplicant = (applicantId) => {
    setSelectedApplicantId(applicantId);
    setIsReviewModalOpen(true);
  };

  const handleSetReviewAction = (applicantId, action) => {
    setReviewActions((prev) => ({
      ...prev,
      [applicantId]: action,
    }));
  };

  const hasData = Boolean(datasetResult && summary && selectedApplicant);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "workspace":
        return (
          <WorkspacePage
            datasetFile={datasetFile}
            setDatasetFile={setDatasetFile}
            onSubmit={handleDatasetSubmit}
            loading={loading}
            error={error}
            summary={summary}
            datasetResult={datasetResult}
          />
        );
      case "applications":
        return (
          <ApplicationsPage
            hasData={hasData}
            applicants={filteredApplicants}
            charts={derivedCharts}
            selectedApplicantId={selectedApplicant?.applicant_id}
            onInspectApplicant={handleInspectApplicant}
            summary={summary}
            applicationFilter={applicationFilter}
            onFilterChange={setApplicationFilter}
          />
        );
      case "results":
        return (
          <DatasetResultsPage
            hasData={hasData}
            summary={summary}
            applicants={applicants}
            charts={derivedCharts}
          />
        );
      case "portfolio":
        return (
          <PortfolioAnalyticsPage
            hasData={hasData}
            datasetResult={datasetResult}
            summary={summary}
            chartImages={chartImages}
          />
        );
      case "home":
      default:
        return <HomePage onNavigate={navigate} hasData={hasData} applicants={applicants} onInspectApplicant={handleInspectApplicant} />;
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="topbar__mark">CL</div>
          <div>
            <strong>CredLens</strong>
            <span>Digital lending risk workspace</span>
          </div>
        </div>

        <nav className="topbar__nav" aria-label="Primary">
          {Object.entries(PAGE_CONFIG).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`topbar__link ${currentPage === key ? "topbar__link--active" : ""}`}
              onClick={() => navigate(key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {currentPage !== "home" && (
        <section className="workspace-hero">
          <div className="workspace-hero__copy">
            <span className="eyebrow">Active Page</span>
            <h1>{PAGE_CONFIG[currentPage].label}</h1>
            <p>
              Upload your loan default dataset, move across dedicated pages, inspect applicants in their
              own workspace views, and make underwriting decisions with a cleaner product-style workflow.
            </p>
          </div>

          <div className="workspace-hero__status">
            <div className="status-pill">
              <span>Backend</span>
              <strong>{healthStatus.backend}</strong>
            </div>
            <div className="status-pill">
              <span>Model</span>
              <strong>{healthStatus.model}</strong>
            </div>
            <div className="status-pill">
              <span>Ollama</span>
              <strong>{healthStatus.ollama}</strong>
            </div>
          </div>
        </section>
      )}

      <main className="page-content">{renderCurrentPage()}</main>

      {isReviewModalOpen && selectedApplicant && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Applicant review">
          <div className="modal-shell">
            <div className="modal-header">
              <div>
                <span className="eyebrow">Applicant Popup Review</span>
                <h2>{selectedApplicant.applicant_id}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setIsReviewModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="workspace-highlight">
              <div className="detail-card">
                <span>Applicant</span>
                <strong>{selectedApplicant.applicant_id}</strong>
              </div>
              <div className="detail-card">
                <span>Current Status</span>
                <strong>{selectedApplicant.review_status}</strong>
              </div>
              <div className="detail-card">
                <span>Risk</span>
                <strong>{(selectedApplicant.probability * 100).toFixed(1)}%</strong>
              </div>
            </div>

            <AnalysisTab
              analysisChartData={analysisChartData}
              inputProfileData={inputProfileData}
              result={selectedApplicant}
              analysisInsights={analysisInsights}
              advisorModel={advisorModel}
              setAdvisorModel={setAdvisorModel}
              advisorQuery={advisorQuery}
              setAdvisorQuery={setAdvisorQuery}
              onAdvisorSubmit={handleAdvisorSubmit}
              advisorLoading={advisorLoading}
              advisorError={advisorError}
              advisorResponse={advisorResponse}
              healthStatus={healthStatus}
              advisorHistory={advisorHistory}
              onSetReviewAction={handleSetReviewAction}
            />
          </div>
        </div>
      )}
    </div>
  );
}


export default CreditRiskPage;
