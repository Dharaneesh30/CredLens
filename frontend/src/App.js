import { useState } from 'react';
import './App.css';

const riskSignals = [
  { label: 'Low risk', value: '1.8% PD', tone: 'success' },
  { label: 'Medium risk', value: '7.4% PD', tone: 'warning' },
  { label: 'High risk', value: '14.1% PD', tone: 'danger' },
];

const exposureBars = [
  { label: 'Mon', height: '34%', tone: 'danger' },
  { label: 'Tue', height: '49%', tone: 'warning' },
  { label: 'Wed', height: '58%', tone: 'success' },
  { label: 'Thu', height: '72%', tone: 'success' },
  { label: 'Fri', height: '64%', tone: 'warning' },
  { label: 'Sat', height: '82%', tone: 'success' },
];

const modelStats = [
  { name: 'Random Forest', accuracy: '100%', auc: '100%' },
  { name: 'XGBoost', accuracy: '100%', auc: '100%' },
  { name: 'Gradient Boosting', accuracy: '100%', auc: '100%' },
  { name: 'Logistic Regression', accuracy: '100%', auc: '100%' },
];

const dashboardStats = [
  { label: 'Applications today', value: '128' },
  { label: 'Average score', value: '742' },
  { label: 'Review queue', value: '09' },
  { label: 'Risk drift', value: '-3.2%' },
];

const queue = [
  { name: 'Nadia Patel', lane: 'Retail lending', score: '782', decision: 'Approve' },
  { name: 'Arjun Rao', lane: 'Vehicle loan', score: '689', decision: 'Review' },
  { name: 'Maya Johnson', lane: 'SME credit', score: '611', decision: 'Decline' },
];

function DashboardPreview() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="dashboard-preview">
        <div className="dashboard-preview__glow" />
        <div className="dashboard-header">
          <div className="window-dots"><span /><span /><span /></div>
          <div className="live-indicator">Live scoring engine</div>
        </div>
        <div className="dashboard-grid">
          <section className="dashboard-card dashboard-card--primary">
            <div className="card-header">
              <div>
                <span className="card-label">Borrower Snapshot</span>
                <h2>Credit score profile</h2>
              </div>
              <span className="status-chip status-chip--success">Low Risk</span>
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
                <p>Income stability, repayment behavior, and utilization trends remain in low-risk bands.</p>
                <div className="score-metrics">
                  <div><span>Debt ratio</span><strong>24%</strong></div>
                  <div><span>Fraud check</span><strong>Clear</strong></div>
                </div>
              </div>
            </div>
            <div className="signal-strip">
              {riskSignals.map((signal) => (
                <div key={signal.label} className={`signal-pill signal-pill--${signal.tone}`}>
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
                  <div className={`bar-chart__bar bar-chart__bar--${bar.tone}`} style={{ height: bar.height }} />
                  <span>{bar.label}</span>
                </div>
              ))}
            </div>
            <div className="analytics-footer"><span>Low-risk applicants</span><strong>84%</strong></div>
          </section>
          <section className="dashboard-card dashboard-card--metric dashboard-card--success">
            <span className="card-label">Approval Likelihood</span>
            <strong>91%</strong>
            <p>Pre-qualified from score trend, repayment discipline, and cash-flow consistency.</p>
          </section>
          <section className="dashboard-card dashboard-card--metric dashboard-card--neutral">
            <span className="card-label">Decision Latency</span>
            <strong>1.2s</strong>
            <p>Scoring refreshes in near real time for every new application event.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Home({ onOpen }) {
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
            Analyze borrower risk instantly with machine learning, clean decision support,
            and a dashboard made for digital lending teams.
          </p>
          <div className="hero-actions">
            <button className="hero-button hero-button--primary" type="button" onClick={onOpen}>Open Dashboard</button>
            <a className="hero-button hero-button--secondary" href="#models">View Models</a>
          </div>
          <p className="hero-trust-copy">Machine Learning-Based Credit Risk Scoring Model for Digital Lending Platforms</p>
          <div className="hero-stat-row">
            <div className="hero-stat-card"><span>Best ROC-AUC</span><strong>100%</strong></div>
            <div className="hero-stat-card"><span>Models evaluated</span><strong>4</strong></div>
          </div>
        </div>
        <DashboardPreview />
      </section>

      <section className="page-section" id="models">
        <div className="page-section__heading">
          <span className="hero-kicker">Index View</span>
          <h2>This landing page now introduces the full platform instead of the default React starter.</h2>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Explainable scoring</h3>
            <p>Borrower strength, risk confidence, and portfolio context appear in one place.</p>
          </article>
          <article className="feature-card">
            <h3>Production-style dashboard</h3>
            <p>Teams can move from the homepage into an operational dashboard with a single click.</p>
          </article>
          <article className="feature-card">
            <h3>Project metrics</h3>
            <p>Model performance is shown using the current repository outputs for accuracy and ROC-AUC.</p>
          </article>
        </div>
        <div className="model-list">
          {modelStats.map((model) => (
            <div key={model.name} className="model-list__row">
              <strong>{model.name}</strong>
              <span>{model.accuracy} Accuracy</span>
              <span>{model.auc} ROC-AUC</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Dashboard({ onBack }) {
  return (
    <main className="dashboard-shell-live">
      <section className="dashboard-stage">
        <div className="dashboard-stage__top">
          <div>
            <span className="hero-kicker">Dashboard View</span>
            <h1 className="dashboard-stage__title">CredLens decision workspace</h1>
            <p className="dashboard-stage__copy">Track incoming applications, compare model outputs, and review borrower signals from one screen.</p>
          </div>
          <button className="hero-button hero-button--secondary" type="button" onClick={onBack}>Back to Index</button>
        </div>

        <div className="stage-stats">
          {dashboardStats.map((item) => (
            <article key={item.label} className="stage-stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>

        <div className="stage-grid">
          <article className="stage-card stage-card--wide">
            <div className="card-header">
              <div>
                <span className="card-label">Recommended Outcome</span>
                <h2>Nadia Patel - Approve</h2>
              </div>
              <span className="status-chip status-chip--success">4 / 4 Models Agree</span>
            </div>
            <div className="stage-summary">
              <div className="stage-summary__score"><strong>782</strong><span>Score</span></div>
              <div className="stage-summary__details">
                <div><span>Expected PD</span><strong>1.8%</strong></div>
                <div><span>Requested amount</span><strong>$120K</strong></div>
                <div><span>APR band</span><strong>8.4% - 9.1%</strong></div>
              </div>
            </div>
          </article>

          <article className="stage-card">
            <div className="card-header card-header--stacked">
              <div><span className="card-label">Model Board</span><h2>Current comparison</h2></div>
            </div>
            {modelStats.map((model) => (
              <div key={model.name} className="stage-row">
                <strong>{model.name}</strong>
                <span>{model.accuracy} / {model.auc}</span>
              </div>
            ))}
          </article>

          <article className="stage-card">
            <div className="card-header card-header--stacked">
              <div><span className="card-label">Application Queue</span><h2>In review</h2></div>
            </div>
            {queue.map((item) => (
              <div key={item.name} className="stage-row">
                <div><strong>{item.name}</strong><span>{item.lane}</span></div>
                <div><strong>{item.score}</strong><span>{item.decision}</span></div>
              </div>
            ))}
          </article>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [view, setView] = useState('index');

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="topbar__mark">CL</div>
          <div><strong>CredLens</strong><span>Credit intelligence platform</span></div>
        </div>
        <div className="topbar__nav">
          <button className={view === 'index' ? 'topbar__link topbar__link--active' : 'topbar__link'} type="button" onClick={() => setView('index')}>Index</button>
          <button className={view === 'dashboard' ? 'topbar__link topbar__link--active' : 'topbar__link'} type="button" onClick={() => setView('dashboard')}>Dashboard</button>
        </div>
        <button className="hero-button hero-button--primary topbar__cta" type="button" onClick={() => setView('dashboard')}>Launch Workspace</button>
      </header>
      {view === 'index' ? <Home onOpen={() => setView('dashboard')} /> : <Dashboard onBack={() => setView('index')} />}
    </div>
  );
}

export default App;
