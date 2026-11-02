import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, MapPin, Phone, Mail, ShieldCheck, IndianRupee } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <Crown size={24} className="gold-text" />
            <span className="brand-title">ROYAL HOTEL</span>
          </div>
          <p className="footer-desc">
            A sanctuary of majestic Rajputana heritage, serene lake panoramas, and Michelin-inspired Indian gastronomy. Experience genuine royal hospitality.
          </p>
        
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Home Palace</Link></li>
            <li><Link to="/rooms">Rooms &amp; Suites</Link></li>
            <li><Link to="/customer">Customer Hub (My Bookings)</Link></li>
            <li><Link to="/staff">Staff Front Desk Console</Link></li>
            <li><Link to="/admin">Admin &amp; Financials</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Royal Experiences</h4>
          <ul className="footer-links">
            <li><span>Mughal Courtyard Dining</span></li>
            <li><span>Jiva Ayurvedic Spa &amp; Wellness</span></li>
            <li><span>Lake Pichola Solar Sunset Cruise</span></li>
            <li><span>Private Chauffeur Airport Service</span></li>
            <li><span>Heritage Architecture Walk</span></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Heritage Concierge</h4>
          <div className="contact-item">
            <MapPin size={16} className="gold-text" />
            <span>Palace Road, Lake Pichola, Udaipur, Rajasthan 313001, India</span>
          </div>
          <div className="contact-item">
            <Phone size={16} className="gold-text" />
            <span>+91 294 242 8800 / +91 98765 43210</span>
          </div>
          <div className="contact-item">
            <Mail size={16} className="gold-text" />
            <span>concierge@royalhotel.in</span>
          </div>
          <div className="contact-item">
            <ShieldCheck size={16} className="gold-text" />
            <span>24/7 Front Desk Operations</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-row">
          <p>© {new Date().getFullYear()} Royal Hotel &amp; Grand Spa Ltd. All rights reserved.</p>
        
        </div>
      </div>

      <style>{`
        .site-footer {
          background: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          color: var(--text-muted);
          padding-top: 4rem;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 2.5rem;
          padding-bottom: 3rem;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .footer-logo .brand-title {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: 0.08em;
        }
        .footer-desc {
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
          max-width: 380px;
        }
        .gst-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-gold);
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          color: var(--text-main);
        }
        .footer-heading {
          font-family: var(--font-serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          font-size: 0.88rem;
        }
        .footer-links a, .footer-links span {
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: var(--accent-gold);
        }
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.88rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .footer-bottom {
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
          padding: 1.25rem 0;
          font-size: 0.8rem;
        }
        .bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .payment-support-text {
          color: var(--accent-gold);
        }
        @media (max-width: 900px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
