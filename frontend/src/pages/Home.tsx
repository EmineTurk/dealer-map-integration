import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Pages.css';

const PasajIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
    {/* Curved handle on top */}
    <path d="M24 22C24 16 28 12 32 12C36 12 40 16 40 22" stroke="var(--turkcell-yellow)" strokeWidth="5.5" strokeLinecap="round"/>
    {/* Outer stylized P bag body */}
    <path d="M24 49V26C24 20 30 18 39 18C48 18 53 23 53 31.5C53 40 45 44.5 36.5 44.5H29.5V33C29.5 29 35 28 38 31C41 33.5 39 39.5 33 39.5" stroke="var(--turkcell-yellow)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TurkcellIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
    {/* Solid yellow circle base */}
    <circle cx="32" cy="32" r="28" fill="var(--turkcell-yellow)"/>
    {/* Left shorter feeler */}
    <path d="M19 46C20 40 24 35 30 33C33 32 35 33 36 35C37 37 35 40 31 41C27 42 24 45 23 48" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
    <circle cx="36" cy="35" r="3.5" fill="white"/>
    {/* Right longer feeler */}
    <path d="M26 48C28 36 36 26 48 20C51 18.5 53 20 53 22C53 24 50 27 45 29C39 31.5 33 39 31 50" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
    <circle cx="53" cy="22" r="3.5" fill="white"/>
  </svg>
);

const AnimatedCounter: React.FC<{ target: number }> = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    const duration = 1000; // 1 second total animation
    const steps = 30; // 30 updates
    const increment = Math.max(1, Math.ceil(end / steps));
    const stepTime = duration / (end / increment);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <>{count}</>;
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="page-container home-page animate-fade-in">
      <section className="hero-section">
        <h1 className="hero-title">
          {t('title')}
        </h1>
        <p className="hero-subtitle">
          {t('subtitle')}
        </p>
      </section>

      <div className="modules-grid">
        {/* Module 1: Pasaj Stocks */}
        <div className="module-card glass-panel" onClick={() => navigate('/pasaj')}>
          <div className="card-accent-blue"></div>
          <div className="module-icon-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <PasajIcon />
          </div>
          <h2 className="module-title">{t('pasajTitle')}</h2>
          <h3 className="module-subtitle">{t('pasajSubtitle')}</h3>
          <p className="module-desc">
            {t('pasajDesc')}
          </p>
          <button className="module-btn">{t('searchBtn')}</button>
        </div>

        {/* Module 2: Transactions */}
        <div className="module-card glass-panel" onClick={() => navigate('/transactions')}>
          <div className="card-accent-yellow"></div>
          <div className="module-icon-container" style={{ display: 'flex', justifyContent: 'center' }}>
            <TurkcellIcon />
          </div>
          <h2 className="module-title">{t('transTitle')}</h2>
          <h3 className="module-subtitle">{t('transSubtitle')}</h3>
          <p className="module-desc">
            {t('transDesc')}
          </p>
          <button className="module-btn yellow-btn">{t('discoverBtn')}</button>
        </div>
      </div>

      {/* Metrics Section */}
      <section className="system-metrics">
        <h3 className="section-heading">{t('metricsTitle')}</h3>
        <div className="metrics-grid">
          <div className="metric-box glass-panel">
            <span className="metric-value">
              <AnimatedCounter target={100} />
            </span>
            <span className="metric-label">{t('metric1Label')}</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-value">
              <AnimatedCounter target={20} />
            </span>
            <span className="metric-label">{t('metric2Label')}</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-value">
              <AnimatedCounter target={5} />
            </span>
            <span className="metric-label">{t('metric3Label')}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
