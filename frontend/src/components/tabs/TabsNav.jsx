import React from "react";


const tabs = [
  { key: "prediction", label: "Portfolio Overview" },
  { key: "analysis", label: "Applicants Data" },
  { key: "eda", label: "Portfolio Analytics" },
  { key: "advisor", label: "AI Advisor" },
];


function TabsNav({ activeTab, onTabChange }) {
  return (
    <div className="tab-buttons">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => onTabChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}


export default TabsNav;
