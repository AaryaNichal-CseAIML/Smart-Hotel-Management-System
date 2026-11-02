import React, { useState } from 'react';
import { Search, Users, Maximize2, Bed, Check, Sparkles } from 'lucide-react';
import { useHotelData, formatINR } from '../context/HotelDataContext';
import SimpleBookingModal from '../components/SimpleBookingModal';

export default function RoomsPage() {
  const { rooms } = useHotelData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  const categories = ['All', 'Deluxe', 'Suite', 'Royal Suite', 'Villa'];

  const filteredRooms = rooms.filter((room) => {
    const matchesCat = selectedCategory === 'All' || room.category === selectedCategory;
    const matchesQuery =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.amenities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="rooms-page-wrapper">
      {/* Header Banner */}
      <section className="rooms-hero-header">
        <div className="container text-center">
          <span className="gold-subheading">SANCTUARY INVENTORY</span>
          <h1 className="page-hero-title">Rooms, Suites &amp; Royal Villas</h1>
          <p className="page-hero-subtitle">
            Palatial architecture crafted with pure Rajputana heritage, luxury Italian marble, and bespoke Indian craftsmanship. All rates shown in Indian Rupees (INR ₹).
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="rooms-filter-section">
        <div className="container filter-container">
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat === 'All' ? 'All Sanctuaries' : cat}
              </button>
            ))}
          </div>

          <div className="search-input-box">
            <Search size={16} className="gold-text" />
            <input
              type="text"
              placeholder="Search by suite name, bed or amenity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rooms-search-field"
            />
          </div>
        </div>
      </section>

      {/* Rooms Listing Grid */}
      <section className="section-padding rooms-grid-section">
        <div className="container">
          <div className="rooms-count-bar">
            <span>Showing <strong>{filteredRooms.length}</strong> palace rooms &amp; suites</span>
          </div>

          <div className="all-rooms-grid">
            {filteredRooms.map((room) => (
              <div key={room.id} className="room-item-card luxury-card">
                <div className="room-thumb-wrap">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="room-thumb-img"
                    onError={(e) => {
                      e.target.src = '/images/hero.jpg';
                    }}
                  />
                  <span className="room-tag-category">{room.category}</span>
                  <span className="room-roomno-badge">Room {room.number}</span>
                  <span className="room-status-chip" data-status={room.status}>
                    {room.status}
                  </span>
                </div>

                <div className="room-details-box">
                  <div className="room-attributes">
                    <span className="attr-item"><Bed size={14} /> {room.bedType}</span>
                    <span className="attr-item"><Maximize2 size={14} /> {room.sizeSqFt} sq ft</span>
                    <span className="attr-item"><Users size={14} /> Up to {room.maxOccupancy} Guests</span>
                  </div>

                  <h2 className="room-heading">{room.name}</h2>
                  <p className="room-view-info"><strong>View:</strong> {room.view}</p>
                  <p className="room-description-text">{room.description}</p>

                  <div className="room-amenities-tags">
                    {room.amenities.map((amenity, idx) => (
                      <span key={idx} className="amenity-chip">
                        <Check size={12} className="gold-text" /> {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="room-booking-row">
                    <div className="room-pricing-meta">
                      <span className="price-number">{formatINR(room.basePrice)}</span>
                      <span className="price-sub">/ night (excl. 18% GST)</span>
                    </div>

                    <button
                      onClick={() => setSelectedRoomForBooking(room)}
                      className="btn-primary book-action-btn"
                    >
                      <Sparkles size={15} /> Book Sanctuary
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="empty-rooms-view">
              <p>No rooms found matching your search. Try adjusting filters.</p>
              <button
                className="btn-outline mt-4"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      <SimpleBookingModal
        room={selectedRoomForBooking}
        isOpen={!!selectedRoomForBooking}
        onClose={() => setSelectedRoomForBooking(null)}
      />

      <style>{`
        .rooms-hero-header {
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
          padding: 4rem 0 3rem;
        }
        .page-hero-title {
          font-size: clamp(2.2rem, 4.5vw, 3.4rem);
          margin-bottom: 0.75rem;
        }
        .page-hero-subtitle {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .rooms-filter-section {
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
          padding: 1.25rem 0;
          position: sticky;
          top: 104px;
          z-index: 50;
        }
        .filter-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .category-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .category-pill {
          padding: 0.45rem 1.1rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .category-pill:hover {
          border-color: var(--border-gold);
          color: var(--text-main);
        }
        .category-pill.active {
          background: var(--accent-gold);
          border-color: var(--accent-gold);
          color: #0d121c;
          font-weight: 600;
        }
        .search-input-box {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.85rem;
          min-width: 300px;
        }
        .rooms-search-field {
          border: none;
          background: transparent;
          color: var(--text-main);
          font-size: 0.88rem;
          width: 100%;
          outline: none;
        }
        .rooms-count-bar {
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .all-rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2.25rem;
        }
        .room-item-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .room-thumb-wrap {
          position: relative;
          height: 240px;
          overflow: hidden;
        }
        .room-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .room-item-card:hover .room-thumb-img {
          transform: scale(1.05);
        }
        .room-tag-category {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(7, 10, 17, 0.85);
          color: var(--accent-gold);
          border: 1px solid var(--border-gold);
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
        }
        .room-roomno-badge {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(7, 10, 17, 0.85);
          color: #f8fafc;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .room-status-chip {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          background: rgba(16, 185, 129, 0.9);
          color: #ffffff;
        }
        .room-status-chip[data-status="Occupied"] {
          background: rgba(59, 130, 246, 0.9);
        }
        .room-status-chip[data-status="Cleaning"] {
          background: rgba(245, 158, 11, 0.9);
        }
        .room-status-chip[data-status="Maintenance"] {
          background: rgba(239, 68, 68, 0.9);
        }
        .room-details-box {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .room-attributes {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .attr-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .room-heading {
          font-size: 1.4rem;
          margin-bottom: 0.4rem;
        }
        .room-view-info {
          font-size: 0.85rem;
          color: var(--accent-gold);
          margin-bottom: 0.75rem;
        }
        .room-description-text {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1.25rem;
          flex-grow: 1;
        }
        .room-amenities-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 1.5rem;
        }
        .amenity-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: var(--bg-elevated);
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
        }
        .room-booking-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-subtle);
          gap: 1rem;
        }
        .price-number {
          display: block;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--accent-gold);
        }
        .price-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .book-action-btn {
          padding: 0.65rem 1.25rem;
          font-size: 0.88rem;
        }
        .empty-rooms-view {
          text-align: center;
          padding: 4rem 1rem;
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          border: 1px dashed var(--border-subtle);
        }
        @media (max-width: 768px) {
          .all-rooms-grid {
            grid-template-columns: 1fr;
          }
          .rooms-filter-section {
            top: 60px;
          }
        }
      `}</style>
    </div>
  );
}
