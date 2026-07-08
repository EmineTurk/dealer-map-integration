import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar-header glass-panel">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-turkcell">TURKCELL</span>
          <span className="brand-divider">/</span>
          <span className="brand-portal">Dealer Portal</span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/pasaj" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Pasaj (Stocks)
          </NavLink>
          <NavLink 
            to="/transactions" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            com.tr (Transactions)
          </NavLink>
        </nav>

        <div className="navbar-status">
          <span className="status-dot"></span>
          <span className="status-label">Mock API Active</span>
        </div>
      </div>
    </header>
  );
};
