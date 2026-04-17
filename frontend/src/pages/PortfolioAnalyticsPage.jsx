import React from "react";

import EdaTab from "../components/tabs/EdaTab";


function PortfolioAnalyticsPage({ hasData, datasetResult, summary, chartImages }) {
  if (!hasData || !datasetResult || !summary) {
    return (
      <section className="card empty-state-card">
        <span className="eyebrow">Portfolio Analytics</span>
        <h2>No portfolio loaded yet</h2>
        <p>Analyze a dataset to unlock score distribution, purpose concentration, and exposure analytics.</p>
      </section>
    );
  }

  return (
    <section className="card tabs-card">
      <div className="tabs-card__header">
        <div>
          <span className="eyebrow">Portfolio Analytics</span>
          <h2>Explore score bands, purpose mix, exposure concentration, and model diagnostics.</h2>
        </div>
        <div className="tabs-card__meta">
          <span>Approval Rate: {summary.approval_rate}%</span>
          <span>Default Rate: {summary.actual_default_rate ?? "N/A"}{summary.actual_default_rate != null ? "%" : ""}</span>
        </div>
      </div>

      <EdaTab
        charts={datasetResult.charts}
        summary={summary}
        edaInsights={datasetResult.portfolio_insights}
        chartImages={chartImages}
      />
    </section>
  );
}


export default PortfolioAnalyticsPage;
