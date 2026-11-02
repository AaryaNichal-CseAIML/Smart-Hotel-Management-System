import React, { useState } from 'react';
import { UserCheck, LogOut, CheckCircle, Clock, Brush, Coffee } from 'lucide-react';
import { useHotelData, formatINR } from '../context/HotelDataContext';

export default function StaffPage() {
  const {
    bookings,
    rooms,
    serviceRequests,
    checkInBooking,
    checkOutBooking,
    updateRoomStatus,
    updateServiceRequestStatus,
    currentUser,
  } = useHotelData();

  const [activeTab, setActiveTab] = useState('frontdesk'); // 'frontdesk' | 'rooms' | 'requests'
  const [filterBookingStatus, setFilterBookingStatus] = useState('ALL');
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Filtered bookings
  const displayedBookings = bookings.filter((b) => {
    if (filterBookingStatus === 'ALL') return true;
    return b.status === filterBookingStatus;
  });

  // KPI Calculations
  const confirmedArrivals = bookings.filter((b) => b.status === 'Confirmed').length;
  const inHouseGuests = bookings.filter((b) => b.status === 'Checked-In').length;
  const roomsNeedingCleaning = rooms.filter((r) => r.status === 'Cleaning').length;
  const pendingRequests = serviceRequests.filter((r) => r.status !== 'Completed').length;

  return (
    <div className="staff-page-wrapper">
      {/* Staff Header */}
      <section className="staff-header-section">
        <div className="container">
          <div className="staff-profile-banner">
            <div>
              <span className="staff-role-chip">Front Desk &amp; Operations Portal</span>
              <h1 className="staff-title">Operations Console</h1>
              <p className="staff-meta">
                Logged in as: <strong>{currentUser.name}</strong> • {currentUser.title}
              </p>
            </div>

            <div className="staff-kpi-row">
              <div className="kpi-box">
                <span className="kpi-num gold-text">{confirmedArrivals}</span>
                <span className="kpi-label">Expected Arrivals</span>
              </div>
              <div className="kpi-box">
                <span className="kpi-num blue-text">{inHouseGuests}</span>
                <span className="kpi-label">In-House Guests</span>
              </div>
              <div className="kpi-box">
                <span className="kpi-num amber-text">{roomsNeedingCleaning}</span>
                <span className="kpi-label">Rooms to Clean</span>
              </div>
              <div className="kpi-box">
                <span className="kpi-num green-text">{pendingRequests}</span>
                <span className="kpi-label">Active Requests</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="staff-tabs-bar">
            <button
              onClick={() => setActiveTab('frontdesk')}
              className={`staff-tab-btn ${activeTab === 'frontdesk' ? 'active' : ''}`}
            >
              <UserCheck size={16} />
              <span>Front Desk (Arrivals &amp; Departures)</span>
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`staff-tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            >
              <Brush size={16} />
              <span>Housekeeping &amp; Room Status ({rooms.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`staff-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            >
              <Coffee size={16} />
              <span>Guest Orders &amp; Requests ({pendingRequests} Active)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="section-padding">
        <div className="container">
          {feedbackMessage && (
            <div className="staff-alert-banner fade-in">
              <CheckCircle size={18} /> {feedbackMessage}
            </div>
          )}

          {/* TAB 1: FRONT DESK ARRIVALS & DEPARTURES */}
          {activeTab === 'frontdesk' && (
            <div className="tab-frontdesk-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Daily Arrivals &amp; Departures</h2>
                  <p className="tab-subtext">Perform guest check-ins, allocate sanctuaries, and settle checkouts.</p>
                </div>

                <div className="status-filter-pills">
                  {['ALL', 'Confirmed', 'Checked-In', 'Completed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterBookingStatus(st)}
                      className={`filter-pill ${filterBookingStatus === st ? 'active' : ''}`}
                    >
                      {st === 'ALL' ? 'All Reservations' : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-wrapper luxury-card">
                <table className="staff-data-table">
                  <thead>
                    <tr>
                      <th>Ref &amp; Guest</th>
                      <th>Room &amp; Number</th>
                      <th>Dates &amp; Nights</th>
                      <th>Tariff Total (₹)</th>
                      <th>Status</th>
                      <th className="text-right">Front Desk Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedBookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div className="guest-info-cell">
                            <strong className="guest-name">{b.guestName}</strong>
                            <span className="guest-ref">{b.id} • {b.guestPhone}</span>
                          </div>
                        </td>
                        <td>
                          <strong>{b.roomName}</strong>
                          <div className="room-no-tag">Room {b.roomNumber}</div>
                        </td>
                        <td>
                          <div className="dates-cell">
                            <span>{b.checkIn} to {b.checkOut}</span>
                            <span className="tiny-sub">{b.nights} Night(s) • {b.guests} Guest(s)</span>
                          </div>
                        </td>
                        <td>
                          <span className="gold-text font-bold">{formatINR(b.totalAmount)}</span>
                          <div className="tiny-sub">{b.paymentStatus}</div>
                        </td>
                        <td>
                          <span className="status-badge" data-status={b.status}>
                            {b.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => {
                                checkInBooking(b.id, b.roomNumber);
                                showFeedback(`Checked in ${b.guestName} to Room ${b.roomNumber}!`);
                              }}
                              className="btn-primary action-btn-small"
                            >
                              <UserCheck size={14} /> Check In
                            </button>
                          )}

                          {b.status === 'Checked-In' && (
                            <button
                              onClick={() => {
                                checkOutBooking(b.id);
                                showFeedback(`Checked out ${b.guestName} from Room ${b.roomNumber}. Room marked for Cleaning.`);
                              }}
                              className="btn-outline action-btn-small checkout-btn"
                            >
                              <LogOut size={14} /> Check Out
                            </button>
                          )}

                          {b.status === 'Completed' && (
                            <span className="text-muted text-sm">Settled &amp; Checked Out</span>
                          )}

                          {b.status === 'Cancelled' && (
                            <span className="text-red-500 text-sm">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HOUSEKEEPING & ROOM STATUS */}
          {activeTab === 'rooms' && (
            <div className="tab-rooms-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Housekeeping &amp; Chamber Turnover Matrix</h2>
                  <p className="tab-subtext">Monitor real-time room readiness. Update cleaning, ready, or maintenance states with 1 click.</p>
                </div>
              </div>

              <div className="staff-rooms-grid">
                {rooms.map((r) => (
                  <div key={r.id} className="staff-room-card luxury-card">
                    <div className="staff-room-top">
                      <div>
                        <span className="room-card-number">Room {r.number}</span>
                        <h3 className="room-card-name">{r.name}</h3>
                        <span className="room-floor-tag">{r.floor} • {r.bedType}</span>
                      </div>
                      <span className="room-status-badge" data-status={r.status}>
                        {r.status}
                      </span>
                    </div>

                    <div className="staff-room-meta">
                      <div className="meta-pair">
                        <span>Price/Night:</span>
                        <strong className="gold-text">{formatINR(r.basePrice)}</strong>
                      </div>
                      <div className="meta-pair">
                        <span>Occupancy:</span>
                        <span>Max {r.maxOccupancy} Guests</span>
                      </div>
                    </div>

                    <div className="room-action-pills">
                      <span className="action-hint">Change Status:</span>
                      <div className="status-buttons-row">
                        <button
                          onClick={() => {
                            updateRoomStatus(r.id, 'Ready');
                            showFeedback(`Room ${r.number} marked as Ready & Cleaned!`);
                          }}
                          className={`status-btn ready ${r.status === 'Ready' ? 'current' : ''}`}
                          title="Mark Ready for arrival"
                        >
                          Ready
                        </button>

                        <button
                          onClick={() => {
                            updateRoomStatus(r.id, 'Cleaning');
                            showFeedback(`Room ${r.number} sent to Housekeeping for turnover.`);
                          }}
                          className={`status-btn cleaning ${r.status === 'Cleaning' ? 'current' : ''}`}
                          title="Needs Cleaning"
                        >
                          Cleaning
                        </button>

                        <button
                          onClick={() => {
                            updateRoomStatus(r.id, 'Occupied');
                            showFeedback(`Room ${r.number} set to Occupied.`);
                          }}
                          className={`status-btn occupied ${r.status === 'Occupied' ? 'current' : ''}`}
                          title="Occupied by Guest"
                        >
                          Occupied
                        </button>

                        <button
                          onClick={() => {
                            updateRoomStatus(r.id, 'Maintenance');
                            showFeedback(`Room ${r.number} placed under Maintenance.`);
                          }}
                          className={`status-btn maintenance ${r.status === 'Maintenance' ? 'current' : ''}`}
                          title="Maintenance required"
                        >
                          Maint.
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GUEST ORDERS & SERVICE REQUESTS */}
          {activeTab === 'requests' && (
            <div className="tab-requests-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Live Guest Service &amp; Kitchen Queue</h2>
                  <p className="tab-subtext">Manage incoming dining orders, butler requests, and housekeeping calls in real-time.</p>
                </div>
              </div>

              <div className="requests-grid">
                {serviceRequests.map((req) => (
                  <div key={req.id} className="request-card luxury-card">
                    <div className="req-card-header">
                      <div>
                        <span className="req-id">{req.id}</span>
                        <h3 className="req-item-title">{req.item}</h3>
                        <p className="req-room-info">
                          Sanctuary: <strong>Room {req.roomNumber}</strong> • Guest: <strong>{req.guestName}</strong>
                        </p>
                      </div>
                      <span className="req-category-tag">{req.category}</span>
                    </div>

                    {req.notes && (
                      <div className="req-instructions-box">
                        <strong>Guest Note:</strong> "{req.notes}"
                      </div>
                    )}

                    <div className="req-card-footer">
                      <div className="req-price-time">
                        <span className="req-cost">{req.amount === 0 ? 'Complimentary' : formatINR(req.amount)}</span>
                        <span className="req-time"><Clock size={12} /> {req.time}</span>
                      </div>

                      <div className="req-status-actions">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => {
                              updateServiceRequestStatus(req.id, 'In Progress');
                              showFeedback(`Request ${req.id} marked In Progress.`);
                            }}
                            className="btn-outline action-btn-small"
                          >
                            Accept / In Progress
                          </button>
                        )}

                        {req.status === 'In Progress' && (
                          <button
                            onClick={() => {
                              updateServiceRequestStatus(req.id, 'Completed');
                              showFeedback(`Request ${req.id} marked as Delivered & Completed!`);
                            }}
                            className="btn-primary action-btn-small"
                          >
                            <CheckCircle size={14} /> Mark Delivered
                          </button>
                        )}

                        {req.status === 'Completed' && (
                          <span className="completed-badge">
                            <CheckCircle size={14} /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .staff-header-section {
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
          padding-top: 3rem;
        }
        .staff-profile-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .staff-role-chip {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.12);
          padding: 0.25rem 0.7rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.5rem;
        }
        .staff-title {
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          margin-bottom: 0.4rem;
        }
        .staff-meta {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .staff-kpi-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .kpi-box {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 120px;
        }
        .kpi-num {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .blue-text { color: #3b82f6; }
        .amber-text { color: #f59e0b; }
        .green-text { color: #10b981; }
        .kpi-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.2rem;
        }
        .staff-tabs-bar {
          display: flex;
          gap: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;
          overflow-x: auto;
        }
        .staff-tab-btn {
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
        .staff-tab-btn:hover {
          color: var(--accent-gold);
        }
        .staff-tab-btn.active {
          color: var(--accent-gold);
          border-bottom-color: var(--accent-gold);
        }
        .staff-alert-banner {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.75rem;
          font-size: 0.92rem;
        }
        .status-filter-pills {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .filter-pill {
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          color: var(--text-muted);
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-pill.active {
          background: var(--accent-gold);
          color: #0b111e;
          font-weight: 600;
          border-color: var(--accent-gold);
        }
        .table-wrapper {
          overflow-x: auto;
          padding: 0;
        }
        .staff-data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }
        .staff-data-table th {
          background: var(--bg-elevated);
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .staff-data-table td {
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .guest-info-cell {
          display: flex;
          flex-direction: column;
        }
        .guest-name {
          font-size: 0.95rem;
          color: var(--text-main);
        }
        .guest-ref {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .room-no-tag {
          font-size: 0.8rem;
          color: var(--accent-gold);
        }
        .dates-cell {
          display: flex;
          flex-direction: column;
        }
        .tiny-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .action-btn-small {
          padding: 0.45rem 0.85rem;
          font-size: 0.8rem;
        }
        .checkout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: #ef4444;
          color: #ef4444;
        }
        .staff-rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.5rem;
        }
        .staff-room-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .staff-room-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .room-card-number {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .room-card-name {
          font-size: 1.15rem;
          margin: 0.2rem 0;
        }
        .room-floor-tag {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .room-status-badge {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
        }
        .room-status-badge[data-status="Ready"] {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .room-status-badge[data-status="Occupied"] {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .room-status-badge[data-status="Cleaning"] {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .room-status-badge[data-status="Maintenance"] {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .staff-room-meta {
          background: var(--bg-elevated);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          display: flex;
          justify-content: space-between;
        }
        .action-hint {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
        }
        .status-buttons-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }
        .status-btn {
          padding: 0.35rem 0;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: 4px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-elevated);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .status-btn.current {
          box-shadow: 0 0 0 2px var(--accent-gold);
          color: var(--text-main);
          font-weight: 700;
        }
        .status-btn.ready:hover { border-color: #10b981; color: #10b981; }
        .status-btn.cleaning:hover { border-color: #f59e0b; color: #f59e0b; }
        .status-btn.occupied:hover { border-color: #3b82f6; color: #3b82f6; }
        .status-btn.maintenance:hover { border-color: #ef4444; color: #ef4444; }
        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .request-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .req-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .req-id {
          font-size: 0.75rem;
          color: var(--accent-gold);
          font-weight: 700;
        }
        .req-item-title {
          font-size: 1.1rem;
          margin: 0.2rem 0;
        }
        .req-room-info {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .req-category-tag {
          font-size: 0.72rem;
          padding: 0.2rem 0.5rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          color: var(--text-muted);
        }
        .req-instructions-box {
          background: var(--bg-elevated);
          border-left: 2px solid var(--accent-gold);
          padding: 0.6rem 0.85rem;
          font-size: 0.82rem;
          color: var(--text-main);
        }
        .req-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;
          margin-top: auto;
        }
        .req-cost {
          display: block;
          font-weight: 700;
          color: var(--accent-gold);
          font-size: 0.95rem;
        }
        .req-time {
          font-size: 0.72rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .completed-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          color: #10b981;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
