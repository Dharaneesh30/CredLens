import React from "react";
import "./App.css";

function Dashboard() {
  return (
    <div style={{ padding: "40px" }}>
      
      {/* Title */}
      <h1 style={{ marginBottom: "20px" }}>
        Financial Fraud Detection Dashboard
      </h1>

      {/* Cards Section */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        
        {/* Card 1 */}
        <div style={cardStyle}>
          <h3>Total Transactions</h3>
          <p>1,245</p>
        </div>

        {/* Card 2 */}
        <div style={cardStyle}>
          <h3>Fraud Detected</h3>
          <p>87</p>
        </div>

        {/* Card 3 */}
        <div style={cardStyle}>
          <h3>Fraud Rate</h3>
          <p>7%</p>
        </div>

      </div>

      {/* Prediction Section */}
      <div style={{ marginTop: "40px" }}>
        <h2>Check Transaction</h2>

        <input
          type="text"
          placeholder="Enter transaction details"
          style={inputStyle}
        />

        <button style={buttonStyle}>
          Predict Fraud
        </button>
      </div>

    </div>
  );
}

const cardStyle = {
  background: "rgba(12, 31, 53, 0.85)",
  padding: "20px",
  borderRadius: "10px",
  minWidth: "200px",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)"
};

const inputStyle = {
  padding: "10px",
  width: "300px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "none"
};

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: "6px",
  border: "none",
  background: "#eff6ff",
  cursor: "pointer",
  fontWeight: "600"
};

export default Dashboard;