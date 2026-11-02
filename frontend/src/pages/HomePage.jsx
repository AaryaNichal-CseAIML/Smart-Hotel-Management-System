import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Star, Sparkles, Utensils, Waves, Award } from 'lucide-react';
import { useHotelData, formatINR } from '../context/HotelDataContext';
import SimpleBookingModal from '../components/SimpleBookingModal';

export default function HomePage() {
  const { rooms } = useHotelData();
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [searchCheckIn, setSearchCheckIn] = useState(todayStr);
  const [searchCheckOut, setSearchCheckOut] = useState(defaultOut);
  const [searchGuests, setSearchGuests] = useState('2');

  const featuredRooms = rooms.slice(0, 4);

  return (
    <div className="home-page-wrapper">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="gold-text" />
            <span>HERITAGE PALACE • UDAIPUR, INDIA</span>
          </div>
          <h1 className="hero-title">
            Timeless Grandeur, <br />
            <span className="gold-gradient-text">Royal Indian Hospitality</span>
          </h1>
          <p className="hero-subtitle">
            Immerse yourself in authentic Rajputana elegance on the tranquil shores of Lake Pichola. Handcrafted suites, Michelin-inspired cuisine, and bespoke palace service.
          </p>

          {/* Clean Quick Reservation Bar */}
          <div className="quick-search-card">
            <div className="search-field">
              <label><Calendar size={14} className="gold-text" /> Check-In</label>
              <input
                type="date"
                min={todayStr}
                value={searchCheckIn}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="search-field">
              <label><Calendar size={14} className="gold-text" /> Check-Out</label>
              <input
                type="date"
                min={searchCheckIn || todayStr}
                value={searchCheckOut}
                onChange={(e) => setSearchCheckOut(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="search-field">
              <label><Users size={14} className="gold-text" /> Guests</label>
              <select
                value={searchGuests}
                onChange={(e) => setSearchGuests(e.target.value)}
                className="search-input"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Royal Guests</option>
              </select>
            </div>

            <div className="search-btn-col">
              <Link to="/rooms" className="btn-primary search-action-btn">
                <span>View Available Suites</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Testing Guide Notice */}
      <section className="role-guide-strip">
        
          
      </section>

      {/* Featured Luxury Suites with Indian Pricing */}
      <section className="section-padding featured-section">
        <div className="container">
          <div className="section-header-center">
            <span className="gold-subheading">PALATIAL ACCOMMODATIONS</span>
            <h2 className="section-heading">Featured Rooms &amp; Suites</h2>
            <p className="section-subtext">
              Each chamber blends historic Rajputana craftsmanship with state-of-the-art modern comforts. All rates quoted in Indian Rupees (₹).
            </p>
          </div>

          <div className="featured-rooms-grid">
            {featuredRooms.map((room) => (
              <div key={room.id} className="room-card luxury-card">
                <div className="room-image-wrap">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="room-card-img"
                    onError={(e) => {
                      e.target.src = '/images/hero.jpg';
                    }}
                  />
                  <span className="room-cat-tag">{room.category}</span>
                  <span className="room-status-indicator" data-status={room.status}>
                    {room.status === 'Ready' ? 'Available' : room.status}
                  </span>
                </div>

                <div className="room-card-body">
                  <div className="room-specs-row">
                    <span>{room.bedType}</span>
                    <span>•</span>
                    <span>{room.sizeSqFt} sq ft</span>
                    <span>•</span>
                    <span>Max {room.maxOccupancy} Guests</span>
                  </div>

                  <h3 className="room-card-title">{room.name}</h3>
                  <p className="room-card-desc">{room.description}</p>

                  <div className="room-card-footer">
                    <div className="pricing-group">
                      <span className="card-price">{formatINR(room.basePrice)}</span>
                      <span className="card-unit">/ night (excl. 18% GST)</span>
                    </div>

                    <button
                      onClick={() => setSelectedRoomForBooking(room)}
                      className="btn-primary room-book-btn"
                    >
                      Book Sanctuary
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/rooms" className="btn-outline view-all-btn">
              Explore All 8 Palace Sanctuaries <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Royal Experiences */}
      <section className="section-padding experiences-section">
        <div className="container">
          <div className="section-header-center">
            <span className="gold-subheading">PALACE AMENITIES</span>
            <h2 className="section-heading">Curated Royal Experiences</h2>
            <p className="section-subtext">
              Unmatched luxury tailored to the heritage traditions of Indian royal courts.
            </p>
          </div>

          <div className="amenities-grid">
            <div className="amenity-card">
              <div className="amenity-icon-box">
                <Utensils size={28} className="gold-text" />
              </div>
              <h3 className="amenity-title">Mughal &amp; Rajputana Dining</h3>
              <p className="amenity-desc">
                Relish 24-karat gold leaf delicacies, authentic royal thalis, and tandoori specialties prepared by master chefs under starlit palace courtyards.
              </p>
            </div>

            <div className="amenity-card">
              <div className="amenity-icon-box">
                <Waves size={28} className="gold-text" />
              </div>
              <h3 className="amenity-title">Ayurvedic Wellness Spa</h3>
              <p className="amenity-desc">
                Centuries-old therapeutic wellness rituals, personalized herbal oils, meditation pavilions, and steam therapies overlooking peaceful lotus gardens.
              </p>
            </div>

            <div className="amenity-card">
              <div className="amenity-icon-box">
                <Sparkles size={28} className="gold-text" />
              </div>
              <h3 className="amenity-title">Lake Pichola Solar Cruise</h3>
              <p className="amenity-desc">
                Private sunset cruises aboard silently gliding solar-powered royal barges with champagne and canapés against the shimmering City Palace.
              </p>
            </div>

            <div className="amenity-card">
              <div className="amenity-icon-box">
                <Award size={28} className="gold-text" />
              </div>
              <h3 className="amenity-title">24/7 Dedicated Royal Butler</h3>
              <p className="amenity-desc">
                Discreet, intuitive service catering to every whim—from custom bath preparations and wardrobe pressing to private itinerary curation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Testimonials */}
      <section className="section-padding reviews-section">
        <div className="container">
          <div className="section-header-center">
            <span className="gold-subheading">ROYAL ENDORSEMENTS</span>
            <h2 className="section-heading">Words From Our Distinguished Guests</h2>
          </div>

          <div className="reviews-grid">
            <div className="review-card luxury-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                ))}
              </div>
              <p className="review-quote">
                &ldquo;The Maharaja Imperial Suite was beyond breathtaking. The lake views at dawn, the exceptional hospitality, and the royal Rajasthani Thali made this the most memorable stay of our lives.&rdquo;
              </p>
              <div className="reviewer-info">
                <strong>Alexander Wright</strong>
                <span>London, United Kingdom • Stayed in Suite 201</span>
              </div>
            </div>

            <div className="review-card luxury-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                ))}
              </div>
              <p className="review-quote">
                &ldquo;Royal Hotel represents authentic Indian luxury at its finest. The seamless front-desk team, prompt room service, and flawless palace maintenance reflect genuine five-star caliber.&rdquo;
              </p>
              <div className="reviewer-info">
                <strong>Vikramaditya Rathore</strong>
                <span>Jaipur, India • Stayed in Penthouse 302</span>
              </div>
            </div>

            <div className="review-card luxury-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                ))}
              </div>
              <p className="review-quote">
                &ldquo;From the traditional aarti welcome with marigold garlands to the serene Ayurvedic spa treatments, every detail was executed to royal perfection. An absolute gem in Udaipur.&rdquo;
              </p>
              <div className="reviewer-info">
                <strong>Dr. Ananya Iyer</strong>
                <span>Mumbai, India • Stayed in Chamber 101</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Booking Modal */}
      <SimpleBookingModal
        room={selectedRoomForBooking}
        isOpen={!!selectedRoomForBooking}
        onClose={() => setSelectedRoomForBooking(null)}
      />

      <style>{`
        .hero-banner {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          background-image: url('/images/hero.jpg');
          background-size: cover;
          background-position: center;
          padding: 5rem 0;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(7, 10, 17, 0.72) 0%, rgba(7, 10, 17, 0.92) 100%);
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 960px;
          text-align: center;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(197, 160, 89, 0.15);
          border: 1px solid var(--border-gold);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: var(--text-main);
          margin-bottom: 1.5rem;
        }
        .hero-title {
          font-size: clamp(2.4rem, 5.5vw, 4.2rem);
          line-height: 1.15;
          margin-bottom: 1.25rem;
          font-weight: 700;
        }
        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: #cbd5e1;
          max-width: 720px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }
        .quick-search-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-gold);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1.2fr;
          gap: 1.25rem;
          text-align: left;
        }
        .search-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .search-field label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .search-input {
          padding: 0.75rem 0.85rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          font-family: inherit;
          font-size: 0.9rem;
        }
        .search-btn-col {
          display: flex;
          align-items: flex-end;
        }
        .search-action-btn {
          width: 100%;
          height: 44px;
        }
        .role-guide-strip {
          background: var(--accent-gold-muted);
          border-bottom: 1px solid var(--border-gold);
          padding: 0.75rem 0;
          text-align: center;
          font-size: 0.88rem;
          color: var(--text-main);
        }
        .section-header-center {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 3.5rem;
        }
        .section-heading {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          margin-bottom: 0.8rem;
        }
        .section-subtext {
          font-size: 1rem;
          color: var(--text-muted);
        }
        .featured-rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .room-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .room-image-wrap {
          position: relative;
          height: 220px;
          overflow: hidden;
        }
        .room-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .room-card:hover .room-card-img {
          transform: scale(1.05);
        }
        .room-cat-tag {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(7, 10, 17, 0.8);
          color: var(--accent-gold);
          border: 1px solid var(--border-gold);
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.08em;
        }
        .room-status-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.85);
          color: #ffffff;
        }
        .room-status-indicator[data-status="Occupied"] {
          background: rgba(59, 130, 246, 0.85);
        }
        .room-status-indicator[data-status="Cleaning"] {
          background: rgba(245, 158, 11, 0.85);
        }
        .room-status-indicator[data-status="Maintenance"] {
          background: rgba(239, 68, 68, 0.85);
        }
        .room-card-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .room-specs-row {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          gap: 0.4rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        .room-card-title {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .room-card-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          line-height: 1.5;
          flex-grow: 1;
        }
        .room-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
          gap: 0.75rem;
        }
        .card-price {
          display: block;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--accent-gold);
        }
        .card-unit {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .room-book-btn {
          padding: 0.6rem 1.1rem;
          font-size: 0.85rem;
        }
        .text-center {
          text-align: center;
        }
        .mt-8 {
          margin-top: 2.5rem;
        }
        .view-all-btn {
          padding: 0.9rem 2rem;
        }
        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 2rem;
        }
        .amenity-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 2rem;
          text-align: center;
          transition: transform 0.2s, border-color 0.2s;
        }
        .amenity-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-gold);
        }
        .amenity-icon-box {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--accent-gold-muted);
          border: 1px solid var(--border-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .amenity-title {
          font-size: 1.15rem;
          margin-bottom: 0.75rem;
        }
        .amenity-desc {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--text-muted);
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }
        .review-card {
          display: flex;
          flex-direction: column;
        }
        .stars-row {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1rem;
        }
        .review-quote {
          font-size: 0.95rem;
          font-style: italic;
          line-height: 1.6;
          color: var(--text-main);
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }
        .reviewer-info {
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;
          font-size: 0.85rem;
        }
        .reviewer-info strong {
          color: var(--text-main);
        }
        .reviewer-info span {
          color: var(--text-muted);
          font-size: 0.78rem;
        }
        @media (max-width: 900px) {
          .quick-search-card {
            grid-template-columns: 1fr 1fr;
          }
          .search-btn-col {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 600px) {
          .quick-search-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
