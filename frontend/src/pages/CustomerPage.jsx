import React, { useState } from 'react';
import { Calendar, Clock, FileText, XCircle, Utensils, Bell, CheckCircle, ShieldCheck, Plus, Sparkles, MapPin } from 'lucide-react';
import { useHotelData, formatINR } from '../context/HotelDataContext';
import SimpleInvoiceModal from '../components/SimpleInvoiceModal';

export default function CustomerPage() {
  const { bookings, cancelBooking, serviceRequests, addServiceRequest, currentUser } = useHotelData();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'service' | 'concierge'
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);

  // Filter bookings for current customer
  const myBookings = bookings.filter(
    (b) => b.guestEmail?.toLowerCase() === currentUser.email?.toLowerCase() || b.guestName === currentUser.name
  );

  // Filter service requests for current customer
  const myRequests = serviceRequests.filter(
    (r) => r.guestName === currentUser.name || r.roomNumber === '102'
  );

  // Room service form state
  const [selectedCategory, setSelectedCategory] = useState('Dining');
  const [selectedItem, setSelectedItem] = useState('');
  const [itemPrice, setItemPrice] = useState(0);
  const [roomNumber, setRoomNumber] = useState('102');
  const [specialNote, setSpecialNote] = useState('');
  const [orderFeedback, setOrderFeedback] = useState(null);

  const menuItems = [
    { name: 'Royal Rajasthani Thali (Dal Baati Churma, Gatte & Kheer)', category: 'Dining', price: 650 },
    { name: 'Murgh Makhani (Butter Chicken) with Garlic Naan (2 pcs)', category: 'Dining', price: 550 },
    { name: 'Paneer Tikka Angara Platter with Mint Chutney', category: 'Dining', price: 420 },
    { name: 'Masala Cutting Chai with Crispy Gourmet Samosas (3 pcs)', category: 'Dining', price: 180 },
    { name: 'Royal Continental Breakfast (Croissant, Eggs, Fresh Juice, Coffee)', category: 'Dining', price: 450 },
    { name: 'Kesar Pista Kulfi with Rose Falooda', category: 'Dining', price: 220 },
    { name: 'Fresh Egyptian Cotton Towels & Extra Pillow Set', category: 'Housekeeping', price: 0 },
    { name: 'Complete In-Room Housekeeping & Bed Linen Change', category: 'Housekeeping', price: 0 },
    { name: 'Evening Turn-down Service & Herbal Night Tea', category: 'Housekeeping', price: 0 },
    { name: 'Private Mercedes Sedan Airport Chauffeur Transfer', category: 'Concierge', price: 1800 },
    { name: 'Lake Pichola Heritage Sunset Boat Tour Ticket (2 Guests)', category: 'Concierge', price: 2400 },
  ];

  const handleSelectItem = (item) => {
    setSelectedItem(item.name);
    setItemPrice(item.price);
    setSelectedCategory(item.category);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!selectedItem) {
      alert('Please select an item from the menu below.');
      return;
    }

    addServiceRequest({
      roomNumber,
      guestName: currentUser.name,
      category: selectedCategory,
      item: selectedItem,
      amount: itemPrice,
      notes: specialNote,
    });

    setOrderFeedback(`Order placed successfully for Room ${roomNumber}! Staff has been notified.`);
    setSpecialNote('');
    setTimeout(() => setOrderFeedback(null), 5000);
  };

  return (
    <div className="customer-page-wrapper">
      {/* Customer Header */}
      <section className="customer-header-section">
        <div className="container">
          <div className="customer-profile-banner">
            <div className="profile-details">
              <span className="customer-role-chip">Customer &amp; Guest Portal</span>
              <h1 className="customer-title">Welcome, {currentUser.name}</h1>
              <p className="customer-meta">
                {currentUser.email} • {currentUser.phone} • <strong>Loyalty Gold Member</strong>
              </p>
            </div>

            <div className="customer-stats-cards">
              <div className="stat-card">
                <span className="stat-val">{myBookings.length}</span>
                <span className="stat-label">Total Stays</span>
              </div>
              <div className="stat-card">
                <span className="stat-val">Room 102</span>
                <span className="stat-label">Current Sanctuary</span>
              </div>
              <div className="stat-card">
                <span className="stat-val gold-text">1,450</span>
                <span className="stat-label">Royal Points</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="customer-tabs-bar">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`customer-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            >
              <Calendar size={16} />
              <span>My Reservations ({myBookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('service')}
              className={`customer-tab-btn ${activeTab === 'service' ? 'active' : ''}`}
            >
              <Utensils size={16} />
              <span>In-Stay Dining &amp; Services ({myRequests.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('concierge')}
              className={`customer-tab-btn ${activeTab === 'concierge' ? 'active' : ''}`}
            >
              <Sparkles size={16} />
              <span>Palace Privileges &amp; Info</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="section-padding">
        <div className="container">
          {/* TAB 1: MY RESERVATIONS */}
          {activeTab === 'bookings' && (
            <div className="tab-bookings-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Your Palace Reservations</h2>
                  <p className="tab-subtext">View stay details, download GST invoices in INR (₹), or manage bookings.</p>
                </div>
                <a href="/rooms" className="btn-primary">
                  <Plus size={16} /> Book Another Sanctuary
                </a>
              </div>

              {myBookings.length === 0 ? (
                <div className="empty-box luxury-card text-center">
                  <p>You have no bookings recorded yet.</p>
                  <a href="/rooms" className="btn-primary mt-4">Browse Palace Suites</a>
                </div>
              ) : (
                <div className="bookings-list-grid">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="booking-item-card luxury-card">
                      <div className="booking-card-top">
                        <div className="booking-ref-block">
                          <span className="ref-number">Booking Ref: {booking.id}</span>
                          <span className="booking-date">Reserved on {booking.createdDate}</span>
                        </div>
                        <span className="status-badge" data-status={booking.status}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="booking-card-body">
                        <h3 className="booking-room-name">{booking.roomName}</h3>
                        <p className="booking-room-no">Allocated Sanctuary: <strong>Room {booking.roomNumber}</strong></p>

                        <div className="booking-dates-row">
                          <div className="date-block">
                            <span className="date-label">Check-In</span>
                            <span className="date-value">{booking.checkIn}</span>
                          </div>
                          <div className="stay-duration-pill">
                            {booking.nights} Night{booking.nights > 1 ? 's' : ''}
                          </div>
                          <div className="date-block">
                            <span className="date-label">Check-Out</span>
                            <span className="date-value">{booking.checkOut}</span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="special-req-note">
                            <strong>Requests:</strong> {booking.specialRequests}
                          </div>
                        )}
                      </div>

                      <div className="booking-card-bottom">
                        <div className="price-summary-tag">
                          <span className="price-tag-label">Total Amount Paid (Inc. 18% GST)</span>
                          <span className="price-tag-value">{formatINR(booking.totalAmount)}</span>
                        </div>

                        <div className="booking-action-buttons">
                          <button
                            onClick={() => setSelectedBookingForInvoice(booking)}
                            className="btn-outline invoice-btn"
                          >
                            <FileText size={15} /> View Tax Invoice (₹)
                          </button>

                          {booking.status === 'Confirmed' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
                                  cancelBooking(booking.id);
                                }
                              }}
                              className="cancel-booking-btn"
                              title="Cancel Reservation"
                            >
                              <XCircle size={15} /> Cancel Stay
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IN-ROOM DINING & SERVICE REQUESTS */}
          {activeTab === 'service' && (
            <div className="tab-service-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">In-Room Dining &amp; Royal Butler Service</h2>
                  <p className="tab-subtext">Order authentic Indian specialties or request housekeeping directly to your sanctuary.</p>
                </div>
              </div>

              {orderFeedback && (
                <div className="alert-success-banner">
                  <CheckCircle size={18} /> {orderFeedback}
                </div>
              )}

              <div className="service-content-grid">
                {/* Left Column: Menu Selector */}
                <div className="menu-selection-col">
                  <h3 className="sub-box-title">1. Select Room Dining or Service</h3>
                  <div className="menu-items-grid">
                    {menuItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectItem(item)}
                        className={`menu-select-card ${selectedItem === item.name ? 'selected' : ''}`}
                      >
                        <div className="menu-item-info">
                          <span className="menu-cat-chip">{item.category}</span>
                          <strong className="item-name">{item.name}</strong>
                        </div>
                        <div className="item-price-tag">
                          {item.price === 0 ? (
                            <span className="free-tag">Complimentary</span>
                          ) : (
                            <span className="price-bold">{formatINR(item.price)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Order Confirmation Form */}
                <div className="order-form-col">
                  <div className="luxury-card sticky-order-box">
                    <h3 className="sub-box-title">2. Order Details</h3>

                    <form onSubmit={handlePlaceOrder}>
                      <div className="input-group">
                        <label className="input-label">Selected Item</label>
                        <input
                          type="text"
                          readOnly
                          value={selectedItem ? `${selectedItem} (${itemPrice === 0 ? 'Free' : formatINR(itemPrice)})` : 'Please pick an item from the left'}
                          className="input-field readonly-field"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">Sanctuary Room Number</label>
                        <select
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          className="input-field"
                        >
                          <option value="101">Room 101 - Deluxe Courtyard</option>
                          <option value="102">Room 102 - Superior Heritage Twin (Current)</option>
                          <option value="201">Room 201 - Executive Palace Suite</option>
                          <option value="301">Room 301 - Maharaja Imperial Suite</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Special Preparation / Time Note</label>
                        <textarea
                          rows="3"
                          value={specialNote}
                          onChange={(e) => setSpecialNote(e.target.value)}
                          placeholder="e.g. Mild spice, extra mint chutney, deliver at 8:30 PM..."
                          className="input-field"
                        />
                      </div>

                      <div className="order-price-row">
                        <span>Total Chargeable (₹):</span>
                        <strong className="gold-text font-bold text-lg">{formatINR(itemPrice)}</strong>
                      </div>

                      <button
                        type="submit"
                        disabled={!selectedItem}
                        className="btn-primary w-full mt-4"
                      >
                        <Bell size={16} /> Place Room Service Order
                      </button>
                    </form>

                    {/* Active Requests List */}
                    <div className="active-requests-section">
                      <h4 className="requests-heading">Recent Order Activity</h4>
                      {myRequests.length === 0 ? (
                        <p className="no-requests-text">No active service orders.</p>
                      ) : (
                        <div className="requests-list">
                          {myRequests.map((req) => (
                            <div key={req.id} className="request-list-item">
                              <div className="req-top">
                                <strong>{req.item}</strong>
                                <span className="req-status-pill" data-status={req.status}>
                                  {req.status}
                                </span>
                              </div>
                              <div className="req-meta">
                                <span>Room {req.roomNumber}</span>
                                <span>•</span>
                                <span>{req.time}</span>
                                {req.amount > 0 && <span>• {formatINR(req.amount)}</span>}
                              </div>
                              {req.notes && <p className="req-note">"{req.notes}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PALACE PRIVILEGES & CONCIERGE */}
          {activeTab === 'concierge' && (
            <div className="tab-concierge-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Royal Guest Privileges</h2>
                  <p className="tab-subtext">Essential hotel guidelines and concierge services for your comfort.</p>
                </div>
              </div>

              <div className="privileges-grid">
                <div className="privilege-card luxury-card">
                  <Clock size={24} className="gold-text mb-3" />
                  <h3>Timings &amp; Schedule</h3>
                  <p><strong>Check-In:</strong> 2:00 PM (Early check-in subject to availability)</p>
                  <p><strong>Check-Out:</strong> 11:00 AM (Late check-out available on request)</p>
                  <p><strong>Royal Breakfast:</strong> 07:00 AM - 10:30 AM at Darbar Courtyard</p>
                  <p><strong>Palace Pool &amp; Spa:</strong> 06:00 AM - 09:00 PM</p>
                </div>

                <div className="privilege-card luxury-card">
                  <ShieldCheck size={24} className="gold-text mb-3" />
                  <h3>Complimentary Guest Amenities</h3>
                  <p>• High-Speed Wi-Fi throughout Palace grounds (SSID: <code>RoyalGuest-5G</code>)</p>
                  <p>• Welcome Aarti &amp; Garlanding ceremony upon arrival</p>
                  <p>• In-room Nespresso machine &amp; artisanal organic teas</p>
                  <p>• Evening Palace courtyard folk dance &amp; sitar performances</p>
                </div>

                <div className="privilege-card luxury-card">
                  <MapPin size={24} className="gold-text mb-3" />
                  <h3>Concierge &amp; Butler Desk</h3>
                  <p><strong>Front Desk Extension:</strong> Dial <code>0</code> from your room phone</p>
                  <p><strong>Housekeeping &amp; Laundry:</strong> Dial <code>2</code></p>
                  <p><strong>Room Service &amp; Kitchen:</strong> Dial <code>3</code></p>
                  <p><strong>Emergency Medical / Security:</strong> Dial <code>9</code></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Invoice Modal */}
      <SimpleInvoiceModal
        booking={selectedBookingForInvoice}
        isOpen={!!selectedBookingForInvoice}
        onClose={() => setSelectedBookingForInvoice(null)}
      />

      <style>{`
        .customer-header-section {
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
          padding-top: 3rem;
        }
        .customer-profile-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .customer-role-chip {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent-gold);
          background: var(--accent-gold-muted);
          padding: 0.25rem 0.7rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.5rem;
        }
        .customer-title {
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          margin-bottom: 0.4rem;
        }
        .customer-meta {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .customer-stats-cards {
          display: flex;
          gap: 1rem;
        }
        .stat-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 110px;
        }
        .stat-val {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.2rem;
        }
        .customer-tabs-bar {
          display: flex;
          gap: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;
          overflow-x: auto;
        }
        .customer-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0.25rem;
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .customer-tab-btn:hover {
          color: var(--accent-gold);
        }
        .customer-tab-btn.active {
          color: var(--accent-gold);
          border-bottom-color: var(--accent-gold);
        }
        .section-sub-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .tab-heading {
          font-size: 1.6rem;
          margin-bottom: 0.25rem;
        }
        .tab-subtext {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .bookings-list-grid {
          display: grid;
          gap: 1.5rem;
        }
        .booking-item-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .booking-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .ref-number {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--accent-gold);
          margin-right: 0.75rem;
        }
        .booking-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .status-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          text-transform: uppercase;
        }
        .status-badge[data-status="Confirmed"] {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .status-badge[data-status="Checked-In"] {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .status-badge[data-status="Completed"] {
          background: rgba(148, 163, 184, 0.15);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }
        .status-badge[data-status="Cancelled"] {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .booking-room-name {
          font-size: 1.3rem;
          margin-bottom: 0.2rem;
        }
        .booking-room-no {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .booking-dates-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: var(--bg-elevated);
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-sm);
          max-width: 480px;
          margin-bottom: 1rem;
        }
        .date-block {
          display: flex;
          flex-direction: column;
        }
        .date-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .date-value {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .stay-duration-pill {
          background: var(--accent-gold-muted);
          color: var(--accent-gold);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
        }
        .special-req-note {
          font-size: 0.85rem;
          color: var(--text-muted);
          background: var(--bg-surface);
          padding: 0.5rem 0.75rem;
          border-left: 2px solid var(--accent-gold);
        }
        .booking-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
          flex-wrap: wrap;
          gap: 1rem;
        }
        .price-tag-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .price-tag-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--accent-gold);
        }
        .booking-action-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .invoice-btn {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }
        .cancel-booking-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #ef4444;
          font-size: 0.82rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          cursor: pointer;
          transition: all 0.2s;
        }
        .cancel-booking-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .service-content-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 2rem;
        }
        .sub-box-title {
          font-size: 1.15rem;
          margin-bottom: 1.25rem;
        }
        .menu-items-grid {
          display: grid;
          gap: 0.75rem;
        }
        .menu-select-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .menu-select-card:hover {
          border-color: var(--border-gold);
          transform: translateX(4px);
        }
        .menu-select-card.selected {
          border-color: var(--accent-gold);
          background: var(--accent-gold-muted);
        }
        .menu-cat-chip {
          display: inline-block;
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--accent-gold);
          margin-bottom: 0.2rem;
        }
        .item-name {
          display: block;
          font-size: 0.92rem;
        }
        .price-bold {
          font-weight: 700;
          color: var(--accent-gold);
          font-size: 1.05rem;
        }
        .free-tag {
          font-size: 0.8rem;
          color: #10b981;
          font-weight: 600;
        }
        .sticky-order-box {
          position: sticky;
          top: 170px;
        }
        .readonly-field {
          background: var(--bg-main);
          color: var(--accent-gold);
          font-weight: 600;
        }
        .order-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-top: 1px dashed var(--border-subtle);
          margin-top: 1rem;
        }
        .active-requests-section {
          margin-top: 2rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.25rem;
        }
        .requests-heading {
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
          color: var(--text-main);
        }
        .no-requests-text {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .request-list-item {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          font-size: 0.85rem;
        }
        .req-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.3rem;
        }
        .req-status-pill {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
        .req-status-pill[data-status="Pending"] {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .req-status-pill[data-status="In Progress"] {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        .req-status-pill[data-status="Completed"] {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        .req-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          gap: 0.4rem;
        }
        .req-note {
          font-size: 0.78rem;
          font-style: italic;
          color: var(--text-muted);
          margin-top: 0.3rem;
        }
        .alert-success-banner {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        .privileges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.75rem;
        }
        .privilege-card p {
          font-size: 0.88rem;
          line-height: 1.6;
          margin-bottom: 0.5rem;
        }
        .privilege-card h3 {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
        }
        .mb-3 { margin-bottom: 0.75rem; }
        @media (max-width: 900px) {
          .service-content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
