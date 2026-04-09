import React from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";


function Home() {
  const navigate = useNavigate();

  return (
    <div className="fraud-app fraud-home">
      <div className="ambient-orb orb-one" aria-hidden="true" />
      <div className="ambient-orb orb-two" aria-hidden="true" />
      <div className="ambient-orb orb-three" aria-hidden="true" />

      <header className="app-topbar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <strong>CredLens Sentinel</strong>
            <small>Financial Threat Monitoring</small>
          </div>
        </div>
        <div className="topbar-pills">
          <span>Model Uptime 99.7%</span>
          <span>24h Alerts 19</span>
          <span>Latency 2.3 min</span>
        </div>
      </header>

      <main className="home-hero">
        <section className="home-copy">
          <span className="home-kicker">Fraud Intelligence Platform</span>
          <h1>Financial Fraud Detection Analysis</h1>
          <p>
            Monitor transaction risk in real time, prioritize suspicious activity, and move from raw
            payments data to actionable fraud decisions in one focused workspace.
          </p>

          <div className="home-cta-row">
            <button className="btn btn-primary" type="button" onClick={() => navigate("/dashboard")}>
              Open Dashboard
            </button>
            <button className="btn btn-outline" type="button">
              View Documentation
            </button>
          </div>

          <div className="feature-row">
            <div className="feature-chip">
              <strong>Realtime Scoring</strong>
              <span>Velocity, amount, and channel patterns</span>
            </div>
            <div className="feature-chip">
              <strong>Analyst Workflow</strong>
              <span>Severity-ranked alerts with action guidance</span>
            </div>
            <div className="feature-chip">
              <strong>Portfolio Oversight</strong>
              <span>Live KPI trend view for risk leadership</span>
            </div>
          </div>
        </section>

        <aside className="glass-panel home-preview">
          <h2>Today&apos;s Security Snapshot</h2>
          <div className="preview-grid">
            <div className="preview-item">
              <span>Monitored Transactions</span>
              <strong>1,245</strong>
            </div>
            <div className="preview-item">
              <span>Critical Alerts</span>
              <strong>19</strong>
            </div>
            <div className="preview-item">
              <span>Fraud Prevention Rate</span>
              <strong>92.7%</strong>
            </div>
            <div className="preview-item">
              <span>Avg Response Time</span>
              <strong>2.3 min</strong>
            </div>
          </div>

          <div className="mini-chart">
            <div className="mini-chart-bar bar-a" />
            <div className="mini-chart-bar bar-b" />
            <div className="mini-chart-bar bar-c" />
            <div className="mini-chart-bar bar-d" />
            <div className="mini-chart-bar bar-e" />
            <div className="mini-chart-bar bar-f" />
          </div>
        </aside>
      </main>
    </div>
  );
}


export default Home;
