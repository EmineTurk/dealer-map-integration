import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en');
  };

  return (
    <header className="navbar-header glass-panel">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-turkcell">TURKCELL</span>
          <span className="brand-divider">/</span>
          <span className="brand-portal">{t('brandPortal')}</span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {t('controlPanel')}
          </NavLink>
          <NavLink 
            to="/pasaj" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {t('pasajStocks')}
          </NavLink>
          <NavLink 
            to="/transactions" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {t('transactions')}
          </NavLink>
        </nav>

        <div className="navbar-lang-container">
          <button onClick={toggleLanguage} className="lang-toggle-btn">
            {language === 'en' ? 'TR' : 'EN'}
          </button>
        </div>
      </div>
    </header>
  );
};
