import React from "react";


const tabs = [
  { key: "prediction", label: "Prediction", caption: "Core probability view", requiresResult: true },
  { key: "analysis", label: "Analysis", caption: "Factor interpretation", requiresResult: true },
  { key: "eda", label: "EDA", caption: "Portfolio context", requiresResult: false },
  { key: "advisor", label: "AI Advisor", caption: "Lending narrative", requiresResult: true },
];


function TabsNav({ activeTab, onTabChange, hasResult }) {
  return (
    <div className="tabs-nav" role="tablist" aria-label="CredLens views">
      {tabs.map((tab) => {
        const isDisabled = tab.requiresResult && !hasResult;

        return (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => onTabChange(tab.key)}
            disabled={isDisabled}
          >
            <span>{tab.label}</span>
            <small>{tab.caption}</small>
          </button>
        );
      })}
    </div>
  );
}


export default TabsNav;
