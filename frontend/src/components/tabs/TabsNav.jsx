import React from "react";


const tabs = [
  { key: "prediction", label: "Prediction" },
  { key: "analysis", label: "Analysis" },
  { key: "eda", label: "EDA" },
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
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}


export default TabsNav;
