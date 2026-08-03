import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import emocanImg from '../assets/emocan.png';
import './Pages.css';

const PasajIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
    {/* Top Handle */}
    <path d="M26 21C26 15.5 38 15.5 38 21" stroke="var(--turkcell-yellow)" strokeWidth="4.5" strokeLinecap="round"/>
    {/* Outer Bag Body */}
    <path d="M26 24C19 24 16 29 16 38V44C16 52 23 58 32 58C41 58 48 52 48 44V38C48 29 41 24 38 24" stroke="var(--turkcell-yellow)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Inner P (Stem & Loop) */}
    <path d="M26 24V48" stroke="var(--turkcell-yellow)" strokeWidth="4.5" strokeLinecap="round"/>
    <path d="M26 24H36C41 24 41 36 36 36H26" stroke="var(--turkcell-yellow)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TurkcellIcon = () => (
  <svg width="64" height="64" viewBox="0 0 18.031 18.031" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
    <path d="M9.0155 0C4.0356 0 0 4.03 0 9c0 .119.0042.2387.0099.3584.8696-1.697 2.5913-3.649 5.0369-4.827-.0042-.0543-.0092-.1106-.0092-.1677 0-1.1442.9288-2.0716 2.076-2.0716 1.1456 0 2.0744.9274 2.0744 2.0716 0 1.1443-.9288 2.071-2.0745 2.071-.6746 0-1.2731-.3232-1.652-.8218-2.5385 1.4964-3.8546 4.5652-4.0377 8.2374a8.979 8.979 0 001.7365 1.9858c1.4738-3.5004 3.935-6.001 8.6958-7.5572-.0007-.0281-.0042-.0542-.0042-.0824 0-1.1435.9288-2.071 2.0745-2.071 1.1464 0 2.0752.9282 2.0752 2.071 0 1.1443-.9288 2.071-2.0752 2.071-.6866 0-1.2936-.333-1.671-.8478-3.6779 1.6907-6.022 5.4784-6.127 8.1036a8.9882 8.9882 0 002.8885.4746c4.9799 0 9.0155-4.0272 9.0155-8.9993C18.031 4.03 13.996 0 9.0154 0z" fill="var(--turkcell-yellow)"/>
  </svg>
);

const WavingMascot = () => (
  <div className="mascot-container">
    <div className="emocan-wrapper">
      <img src={emocanImg} alt="Turkcell Emocan" className="emocan-img" />
    </div>
  </div>
);

const AnimatedCounter: React.FC<{ target: number; isVisible: boolean }> = ({ target, isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }

    let start = 0;
    const end = target;
    const duration = 2500; // Slower count speed (2.5 seconds)
    const totalSteps = 60; // 60 smooth update frames
    const stepTime = duration / totalSteps;

    const timer = setInterval(() => {
      start += 1;
      const currentVal = Math.min(end, Math.ceil((start / totalSteps) * end));
      setCount(currentVal);
      if (start >= totalSteps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  return <>{count}</>;
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [metricsVisible, setMetricsVisible] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMetricsVisible(true);
        }
      },
      { threshold: 0.15 } // Trigger when 15% of the element is visible
    );

    if (metricsRef.current) {
      observer.observe(metricsRef.current);
    }

    return () => {
      if (metricsRef.current) {
        observer.unobserve(metricsRef.current);
      }
    };
  }, []);

  return (
    <div className="page-container home-page animate-fade-in">
      <section className="hero-section">
        <WavingMascot />
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
      <section className="system-metrics" ref={metricsRef}>
        <h3 className="section-heading">{t('metricsTitle')}</h3>
        <div className="metrics-grid">
          <div className="metric-box glass-panel">
            <span className="metric-value">
              <AnimatedCounter target={100} isVisible={metricsVisible} />
            </span>
            <span className="metric-label">{t('metric1Label')}</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-value">
              <AnimatedCounter target={20} isVisible={metricsVisible} />
            </span>
            <span className="metric-label">{t('metric2Label')}</span>
          </div>
          <div className="metric-box glass-panel">
            <span className="metric-value">
              <AnimatedCounter target={5} isVisible={metricsVisible} />
            </span>
            <span className="metric-label">{t('metric3Label')}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
