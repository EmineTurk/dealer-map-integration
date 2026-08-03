import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Pages.css';

const PasajIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
    {/* Handle */}
    <path d="M25 21C25 15.5 28.1 12 32 12C35.9 12 39 15.5 39 21" stroke="var(--turkcell-yellow)" strokeWidth="5" strokeLinecap="round"/>
    {/* Inner P shape */}
    <path d="M28 50V30C28 25 31.5 23 37 23C43.5 23 48.5 27 48.5 34C48.5 41 43.5 45 37 45H28" stroke="var(--turkcell-yellow)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Outer bag wrap */}
    <path d="M24 26C18.5 28.5 15 34 15 41C15 50.5 22.5 58 32 58C41.5 58 49 50.5 49 41C49 37 47.5 33.5 45 31" stroke="var(--turkcell-yellow)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TurkcellIcon = () => (
  <svg width="64" height="64" viewBox="0 0 18.031 18.031" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
    <path d="M9.0155 0C4.0356 0 0 4.03 0 9c0 .119.0042.2387.0099.3584.8696-1.697 2.5913-3.649 5.0369-4.827-.0042-.0543-.0092-.1106-.0092-.1677 0-1.1442.9288-2.0716 2.076-2.0716 1.1456 0 2.0744.9274 2.0744 2.0716 0 1.1443-.9288 2.071-2.0745 2.071-.6746 0-1.2731-.3232-1.652-.8218-2.5385 1.4964-3.8546 4.5652-4.0377 8.2374a8.979 8.979 0 001.7365 1.9858c1.4738-3.5004 3.935-6.001 8.6958-7.5572-.0007-.0281-.0042-.0542-.0042-.0824 0-1.1435.9288-2.071 2.0745-2.071 1.1464 0 2.0752.9282 2.0752 2.071 0 1.1443-.9288 2.071-2.0752 2.071-.6866 0-1.2936-.333-1.671-.8478-3.6779 1.6907-6.022 5.4784-6.127 8.1036a8.9882 8.9882 0 002.8885.4746c4.9799 0 9.0155-4.0272 9.0155-8.9993C18.031 4.03 13.996 0 9.0154 0z" fill="var(--turkcell-yellow)"/>
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
