import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { apiStatus } from '../api/client';
import './Navbar.css';

type ApiMode = 'real' | 'fallback' | 'unavailable';

const getApiMode = (): ApiMode => {
  if (apiStatus.isUnavailable) return 'unavailable';
  if (apiStatus.isUsingFallback) return 'fallback';
  return 'real';
};

export const Navbar: React.FC = () => {
  const [apiMode, setApiMode] = useState<ApiMode>(getApiMode);

  // Poll the shared API status object so the badge follows request outcomes.
  useEffect(() => {
    const interval = setInterval(() => {
      setApiMode(currentMode => {
        const nextMode = getApiMode();
        return currentMode === nextMode ? currentMode : nextMode;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusLabels: Record<ApiMode, string> = {
    real: 'Gerçek API Aktif',
    fallback: 'Simüle API Aktif',
    unavailable: 'API Bağlantısı Yok'
  };

  return (
    <header className="navbar-header glass-panel">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-turkcell">TURKCELL</span>
          <span className="brand-divider">/</span>
          <span className="brand-portal">Bayi Portalı</span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Kontrol Paneli
          </NavLink>
          <NavLink 
            to="/pasaj" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Pasaj (Stoklar)
          </NavLink>
          <NavLink 
            to="/transactions" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            com.tr (İşlemler)
          </NavLink>
        </nav>

        <div
          className={`navbar-status status-${apiMode}`}
          title={apiStatus.lastErrorMessage || statusLabels[apiMode]}
        >
          <span className="status-dot"></span>
          <span className="status-label">{statusLabels[apiMode]}</span>
        </div>
      </div>
    </header>
  );
};
