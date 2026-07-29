import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { apiStatus } from '../api/client';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const [isFallback, setIsFallback] = useState(apiStatus.isUsingFallback);

  // Poll status periodically to react to fallback state changes reactively
  useEffect(() => {
    const interval = setInterval(() => {
      if (apiStatus.isUsingFallback !== isFallback) {
        setIsFallback(apiStatus.isUsingFallback);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isFallback]);

  const statusClass = isFallback ? 'status-fallback' : 'status-real';

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

        <div className={`navbar-status ${statusClass}`}>
          <span className="status-dot"></span>
          <span className="status-label">
            {isFallback ? 'Simüle API Aktif' : 'Gerçek API Aktif'}
          </span>
        </div>
      </div>
    </header>
  );
};
