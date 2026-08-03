import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Pages.css';

const PasajIcon = () => (
  <svg width="54" height="54" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
    <path d="M15 17V12C15 9.23858 17.2386 7 20 7H28C30.7614 7 33 9.23858 33 12V17" stroke="var(--turkcell-yellow)" strokeWidth="3.5" strokeLinecap="round"/>
    <rect x="8" y="16" width="32" height="25" rx="5" fill="rgba(255, 199, 44, 0.1)" stroke="var(--turkcell-yellow)" strokeWidth="3.5"/>
    <circle cx="24" cy="28" r="4" fill="var(--turkcell-yellow)"/>
    <path d="M20 28H28" stroke="var(--turkcell-yellow)" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const TurkcellIcon = () => (
  <svg width="54" height="54" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
    <circle cx="24" cy="24" r="18" fill="rgba(0, 86, 179, 0.15)" stroke="var(--turkcell-blue-light)" strokeWidth="3.5"/>
    <circle cx="24" cy="24" r="7" fill="var(--turkcell-yellow)" stroke="white" strokeWidth="2"/>
    <path d="M14 18C14 14.5 17.5 11 24 11C30.5 11 34 14.5 34 18" stroke="var(--turkcell-yellow)" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M11 15L7 10" stroke="var(--turkcell-yellow)" strokeWidth="3" strokeLinecap="round"/>
    <path d="M37 15L41 10" stroke="var(--turkcell-yellow)" strokeWidth="3" strokeLinecap="round"/>
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
