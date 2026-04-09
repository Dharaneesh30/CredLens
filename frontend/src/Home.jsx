import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="main-box">
        <h1>Financial Fraud Detection Analysis</h1>

        <div
          className="button-box"
          onClick={() => navigate("/dashboard")}
        >
          Open Dashboard
        </div>
      </div>
    </div>
  );
}

export default Home;