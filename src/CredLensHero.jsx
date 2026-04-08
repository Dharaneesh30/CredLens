import React from "react";
import "./CredLensHero.css";

const riskSignals = [
  { label: "Low risk", value: "1.8% PD", tone: "success" },
  { label: "Medium risk", value: "7.4% PD", tone: "warning" },
  { label: "High risk", value: "14.1% PD", tone: "danger" },
];

const exposureBars = [
  { label: "Mon", height: "34%", tone: "danger" },
  { label: "Tue", height: "49%", tone: "warning" },
  { label: "Wed", height: "58%", tone: "success" },
  { label: "Thu", height: "72%", tone: "success" },
  { label: "Fri", height: "64%", tone: "warning" },
  { label: "Sat", height: "82%", tone: "success" },
];

function CredLensHero() {
  return (
    <main className="hero-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-kicker">CredLens - AI Credit Risk System</span>

          <div className="hero-badges">
            <span className="hero-badge">High Accuracy</span>
            <span className="hero-badge">Real-time Analysis</span>
          </div>

          <h1 className="hero-title">AI-Powered Credit Risk Intelligence</h1>

          <p className="hero-description">
            Analyze financial risk instantly with machine learning and real-time
            scoring.
          </p>

          <div className="hero-actions">
            <button className="hero-button hero-button--primary" type="button">
              Predict Now
            </button>
            <button className="hero-button hero-button--secondary" type="button">
              View Dashboard
            </button>
          </div>

          <p className="hero-trust-copy">Powered by Machine Learning Models</p>

          <div className="hero-stat-row">
            <div className="hero-stat-card">
              <span>Approval confidence</span>
              <strong>98.2%</strong>
            </div>
            <div className="hero-stat-card">
              <span>Decision speed</span>
              <strong>1.2s</strong>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="dashboard-preview">
            <div className="dashboard-preview__glow" />

            <div className="dashboard-header">
              <div className="window-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="live-indicator">Live scoring engine</div>
            </div>

            <div className="dashboard-grid">
              <section className="dashboard-card dashboard-card--primary">
                <div className="card-header">
                  <div>
                    <span className="card-label">Borrower Snapshot</span>
                    <h2>Credit score profile</h2>
                  </div>
                  <span className="status-chip status-chip--success">
                    Low Risk
                  </span>
                </div>

                <div className="score-panel">
                  <div className="score-gauge">
                    <div className="score-gauge__inner">
                      <strong>782</strong>
                      <span>Credit Score</span>
                    </div>
                  </div>

                  <div className="score-summary">
                    <div className="score-trend">
                      <span className="card-label">Risk Confidence</span>
                      <strong>98.2%</strong>
                    </div>

                    <p>
                      Income stability, repayment behavior, and utilization
                      trends remain within low-risk tolerance bands.
                    </p>

                    <div className="score-metrics">
                      <div>
                        <span>Debt ratio</span>
                        <strong>24%</strong>
                      </div>
                      <div>
                        <span>Fraud check</span>
                        <strong>Clear</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="signal-strip">
                  {riskSignals.map((signal) => (
                    <div
                      key={signal.label}
                      className={`signal-pill signal-pill--${signal.tone}`}
                    >
                      <small>{signal.label}</small>
                      <strong>{signal.value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="dashboard-card dashboard-card--analytics">
                <div className="card-header card-header--stacked">
                  <div>
                    <span className="card-label">Portfolio Signals</span>
                    <h2>Real-time exposure</h2>
                  </div>
                </div>

                <div className="bar-chart">
                  {exposureBars.map((bar) => (
                    <div key={bar.label} className="bar-chart__item">
                      <div
                        className={`bar-chart__bar bar-chart__bar--${bar.tone}`}
                        style={{ height: bar.height }}
                      />
                      <span>{bar.label}</span>
                    </div>
                  ))}
                </div>

                <div className="analytics-footer">
                  <span>Low-risk applicants</span>
                  <strong>84%</strong>
                </div>
              </section>

              <section className="dashboard-card dashboard-card--metric dashboard-card--success">
                <span className="card-label">Approval Likelihood</span>
                <strong>91%</strong>
                <p>Pre-qualified based on cash flow consistency and score trend.</p>
              </section>

              <section className="dashboard-card dashboard-card--metric dashboard-card--neutral">
                <span className="card-label">Decision Latency</span>
                <strong>1.2s</strong>
                <p>Scoring updates refresh in near real time for every request.</p>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CredLensHero;
