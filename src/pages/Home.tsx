import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container home-page animate-fade-in">
      <section className="hero-section">
        <h1 className="hero-title">
          Dealer Map Integration
        </h1>
        <p className="hero-subtitle">
          A unified, high-performance location engine orchestrating stock levels and capability operations across Turkcell dealer channels.
        </p>
      </section>

      <div className="modules-grid">
        {/* Module 1: Pasaj Stocks */}
        <div className="module-card glass-panel" onClick={() => navigate('/pasaj')}>
          <div className="card-accent-blue"></div>
          <div className="module-icon">📦</div>
          <h2 className="module-title">Pasaj</h2>
          <h3 className="module-subtitle">"Stock Near Me"</h3>
          <p className="module-desc">
            Search physical device stock catalog (e.g. iPhone 15, Galaxy S24) and locate matching store dealers in real-time within your radius.
          </p>
          <div className="module-badge stock-badge">Stock-Service</div>
          <button className="module-btn">Launch Locator &rarr;</button>
        </div>

        {/* Module 2: Transactions */}
        <div className="module-card glass-panel" onClick={() => navigate('/transactions')}>
          <div className="card-accent-yellow"></div>
          <div className="module-icon">⚡</div>
          <h2 className="module-title">turkcell.com.tr</h2>
          <h3 className="module-subtitle">"Transaction Near Me"</h3>
          <p className="module-desc">
            Filter dealers by transactional capabilities (e.g. eSIM Activation, Device Repairs) and navigate to the nearest eligible location.
          </p>
          <div className="module-badge capability-badge">Capability-Service</div>
          <button className="module-btn yellow-btn">Explore Transactions &rarr;</button>
        </div>
      </div>

      {/* Metrics Section */}
      <section className="system-metrics">
        <h3 className="section-heading">System Master Data Summary</h3>
        <div className="metrics-grid">
          <div className="metric-box glass-panel">
            <span className="metric-value">15</span>
            <span className="metric-label">Active TIM & Franchise Stores</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-value">10</span>
            <span className="metric-label">Catalog Products Seeded</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-value">5</span>
            <span className="metric-label">Operations Logged</span>
          </div>
        </div>
      </section>

      {/* Microservice Architecture Visualizer */}
      <section className="architecture-section glass-panel">
        <h3 className="arch-heading">Architecture Topology</h3>
        <div className="arch-map">
          <div className="arch-node node-client">React App (SPA)</div>
          <div className="arch-line">&darr;</div>
          <div className="arch-node node-gateway">API Gateway (Port 8080)</div>
          <div className="arch-line-split">
            <div className="split-branch">
              <div className="arch-line-diagonal"></div>
              <div className="arch-node node-svc">stock-service</div>
            </div>
            <div className="split-branch">
              <div className="arch-line-straight"></div>
              <div className="arch-node node-svc-shared">store-service (Shared)</div>
            </div>
            <div className="split-branch">
              <div className="arch-line-diagonal-right"></div>
              <div className="arch-node node-svc">capability-service</div>
            </div>
          </div>
          <div className="arch-line">&darr;</div>
          <div className="arch-node node-redis">Redis Cache Layer</div>
        </div>
      </section>
    </div>
  );
};
