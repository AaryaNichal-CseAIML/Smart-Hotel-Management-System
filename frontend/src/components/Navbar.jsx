import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Crown, Sun, Moon, User, Shield, Briefcase, Menu, X, IndianRupee } from 'lucide-react';
import { useHotelData } from '../context/HotelDataContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { activeRole, switchRole, currentUser } = useHotelData();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleRoleChange = (role) => {
    switchRole(role);
    if (role === 'customer') navigate('/customer');
    if (role === 'staff') navigate('/staff');
    if (role === 'admin') navigate('/admin');
  };

  return (
    <header className="site-header">
      {/* Top Utility Bar with Quick Role Switcher */}
      <div className="top-role-bar">
        <div className="container role-bar-container">
          <div className="role-bar-left">
           
          </div>

          <div className="role-switcher-group">
            <span className="role-label">Active Role:</span>
            <div className="role-pills">
              <button
                type="button"
                onClick={() => handleRoleChange('customer')}
                className={`role-pill-btn ${activeRole === 'customer' ? 'active' : ''}`}
                title="Switch to Customer / Guest mode"
              >
                <User size={13} />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('staff')}
                className={`role-pill-btn ${activeRole === 'staff' ? 'active' : ''}`}
                title="Switch to Staff (Front Desk & Housekeeping) mode"
              >
                <Briefcase size={13} />
                <span>Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`role-pill-btn ${activeRole === 'admin' ? 'active' : ''}`}
                title="Switch to Admin (General Manager & Financials) mode"
              >
                <Shield size={13} />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="main-navbar">
        <div className="container nav-content">
          {/* Logo */}
          <Link to="/" className="brand-logo">
            <div className="crown-box">
              <Crown size={22} className="gold-text" />
            </div>
            <div className="brand-titles">
              <span className="brand-main">ROYAL HOTEL</span>
              <span className="brand-sub">UDAIPUR PALACE &amp; GRAND SPA</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="nav-links-desktop">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/rooms" className={`nav-link ${isActive('/rooms') ? 'active' : ''}`}>
              Rooms &amp; Suites
            </Link>
            <Link to="/customer" className={`nav-link ${isActive('/customer') ? 'active' : ''}`}>
              Customer Hub
            </Link>
            <Link to="/staff" className={`nav-link ${isActive('/staff') ? 'active' : ''}`}>
              Staff Console
            </Link>
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              Admin Panel
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="nav-right-actions">
            <button
              onClick={toggleTheme}
              className="theme-btn"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} className="gold-text" /> : <Moon size={18} className="gold-text" />}
            </button>

            {/* Current User Pill */}
            <div className="current-user-tag" title={currentUser.title}>
              <div className="avatar-circle">{currentUser.avatar}</div>
              <div className="user-text-meta">
                <span className="user-full-name">{currentUser.name}</span>
                <span className="user-role-badge">{currentUser.badge}</span>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-toggle-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-dropdown fade-in">
            <div className="container mobile-nav-links">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Home
              </Link>
              <Link to="/rooms" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Rooms &amp; Suites
              </Link>
              <Link to="/customer" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Customer Hub (My Bookings &amp; Service)
              </Link>
              <Link to="/staff" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Staff Console (Front Desk &amp; Rooms)
              </Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Admin Panel (Financials &amp; Tariffs)
              </Link>

              <div className="mobile-role-selector">
                <span className="mobile-role-title">Switch Active Role:</span>
                <div className="mobile-role-buttons">
                  <button
                    onClick={() => {
                      handleRoleChange('customer');
                      setMobileMenuOpen(false);
                    }}
                    className={`role-pill-btn ${activeRole === 'customer' ? 'active' : ''}`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => {
                      handleRoleChange('staff');
                      setMobileMenuOpen(false);
                    }}
                    className={`role-pill-btn ${activeRole === 'staff' ? 'active' : ''}`}
                  >
                    Staff
                  </button>
                  <button
                    onClick={() => {
                      handleRoleChange('admin');
                      setMobileMenuOpen(false);
                    }}
                    className={`role-pill-btn ${activeRole === 'admin' ? 'active' : ''}`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-sm);
        }
        .top-role-bar {
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
          padding: 0.4rem 0;
          font-size: 0.8rem;
        }
        .role-bar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        .currency-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--accent-gold);
          font-weight: 500;
        }
        .role-switcher-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .role-label {
          color: var(--text-muted);
          font-weight: 500;
        }
        .role-pills {
          display: inline-flex;
          background: var(--bg-surface);
          padding: 2px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-gold);
        }
        .role-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          transition: all 0.2s;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .role-pill-btn:hover {
          color: var(--text-main);
        }
        .role-pill-btn.active {
          background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-hover) 100%);
          color: #0b111e;
          box-shadow: 0 2px 8px var(--accent-gold-glow);
        }
        .main-navbar {
          padding: 0.75rem 0;
        }
        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .crown-box {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          background: var(--accent-gold-muted);
          border: 1px solid var(--border-gold);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-titles {
          display: flex;
          flex-direction: column;
        }
        .brand-main {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-main);
          line-height: 1.1;
        }
        .brand-sub {
          font-size: 0.65rem;
          letter-spacing: 0.18em;
          color: var(--accent-gold);
          font-weight: 600;
        }
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          transition: color 0.2s;
          position: relative;
          padding: 0.35rem 0;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--accent-gold);
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--accent-gold);
          border-radius: 2px;
        }
        .nav-right-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .theme-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .theme-btn:hover {
          border-color: var(--accent-gold);
        }
        .current-user-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.65rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
        }
        .avatar-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent-gold-muted);
          color: var(--accent-gold);
          font-weight: 700;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-gold);
        }
        .user-text-meta {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .user-full-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .user-role-badge {
          font-size: 0.68rem;
          color: var(--accent-gold);
        }
        .mobile-toggle-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-main);
          cursor: pointer;
        }
        .mobile-menu-dropdown {
          background: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          padding: 1.25rem 0;
        }
        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mobile-nav-link {
          font-size: 1rem;
          padding: 0.5rem 0;
          color: var(--text-main);
          border-bottom: 1px solid var(--border-subtle);
        }
        .mobile-role-selector {
          margin-top: 1rem;
          padding-top: 0.75rem;
        }
        .mobile-role-title {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          display: block;
        }
        .mobile-role-buttons {
          display: flex;
          gap: 0.5rem;
        }
        @media (max-width: 900px) {
          .nav-links-desktop, .current-user-tag {
            display: none;
          }
          .mobile-toggle-btn {
            display: block;
          }
          .role-label {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
