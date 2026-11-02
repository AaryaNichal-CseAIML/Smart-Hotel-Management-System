import React, { useState } from 'react';
import { IndianRupee, Users, Bed, Edit2, Check, Plus, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { useHotelData, formatINR } from '../context/HotelDataContext';
import SimpleInvoiceModal from '../components/SimpleInvoiceModal';

export default function AdminPage() {
  const {
    bookings,
    rooms,
    staffList,
    serviceRequests,
    totalRevenue,
    occupancyPercentage,
    totalOccupiedRooms,
    updateRoomPrice,
    addStaffMember,
    resetToDefaults,
    currentUser,
  } = useHotelData();

  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' | 'ledger' | 'staff' | 'financials'
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [newPriceValue, setNewPriceValue] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);
  const [adminFeedback, setAdminFeedback] = useState(null);

  // New staff form state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffDept, setStaffDept] = useState('Front Office');
  const [staffShift, setStaffShift] = useState('Day (09:00 - 17:30)');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('+91 98111 ');

  const showFeedback = (msg) => {
    setAdminFeedback(msg);
    setTimeout(() => setAdminFeedback(null), 4000);
  };

  const handleStartEditPrice = (room) => {
    setEditingRoomId(room.id);
    setNewPriceValue(room.basePrice.toString());
  };

  const handleSavePrice = (roomId) => {
    const parsed = Number(newPriceValue);
    if (!parsed || parsed <= 0) {
      alert('Please enter a valid tariff in INR (₹).');
      return;
    }
    updateRoomPrice(roomId, parsed);
    setEditingRoomId(null);
    showFeedback(`Charges updated to ${formatINR(parsed)} / night!`);
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffRole) {
      alert('Please fill out all required fields.');
      return;
    }
    addStaffMember({
      name: staffName,
      role: staffRole,
      department: staffDept,
      shift: staffShift,
      email: staffEmail,
      phone: staffPhone,
    });
    setShowAddStaffModal(false);
    setStaffName('');
    setStaffRole('');
    setStaffEmail('');
    showFeedback(`Staff member ${staffName} added successfully.`);
  };

  // Filtered ledger bookings
  const filteredLedger = bookings.filter((b) => {
    const query = ledgerSearch.toLowerCase();
    return (
      b.id.toLowerCase().includes(query) ||
      b.guestName.toLowerCase().includes(query) ||
      b.roomName.toLowerCase().includes(query) ||
      b.status.toLowerCase().includes(query)
    );
  });

  // Financial Breakdown calculations
  const totalRoomRevenue = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.subtotal || 0), 0);

  const totalGstCollected = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + (b.taxGst || 0), 0);

  const totalDiningRevenue = serviceRequests
    .filter((s) => s.status === 'Completed')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="admin-page-wrapper">
      {/* Admin Header */}
      <section className="admin-header-section">
        <div className="container">
          <div className="admin-profile-banner">
            <div>
              <span className="admin-role-chip">Executive Administration Portal</span>
              <h1 className="admin-title">Hotel Executive Dashboard</h1>
              <p className="admin-meta">
                Logged in as: <strong>{currentUser.name}</strong> • {currentUser.title}
              </p>
            </div>

            <div className="admin-kpi-row">
              <div className="kpi-card gold-border">
                <span className="kpi-label">Total Revenue</span>
                <span className="kpi-num gold-text">{formatINR(totalRevenue)}</span>
                <span className="kpi-sub">Room Stays &amp; Services</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Palace Occupancy</span>
                <span className="kpi-num">{occupancyPercentage}%</span>
                <span className="kpi-sub">{totalOccupiedRooms} of {rooms.length} Rooms Occupied</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Active Bookings</span>
                <span className="kpi-num">{bookings.length}</span>
                <span className="kpi-sub">Master Ledger Records</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Staff On Duty</span>
                <span className="kpi-num">{staffList.length}</span>
                <span className="kpi-sub">Across All Shifts</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="admin-tabs-bar">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`admin-tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            >
              <Bed size={16} />
              <span>Room Tariffs &amp; Pricing (₹)</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`admin-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
            >
              <FileText size={16} />
              <span>Master Bookings Ledger ({bookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`admin-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            >
              <Users size={16} />
              <span>Staff &amp; Human Resources ({staffList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`admin-tab-btn ${activeTab === 'financials' ? 'active' : ''}`}
            >
              <IndianRupee size={16} />
              <span>Financial Audit &amp; Controls</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="section-padding">
        <div className="container">
          {adminFeedback && (
            <div className="admin-alert-banner fade-in">
              <Check size={18} /> {adminFeedback}
            </div>
          )}

          {/* TAB 1: ROOM TARIFFS & PRICING */}
          {activeTab === 'pricing' && (
            <div className="tab-pricing-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Room Tariffs &amp; Dynamic Pricing Manager</h2>
                  <p className="tab-subtext">
                    Directly modify base night prices in Indian Rupees (₹). Changes apply instantly across the booking engine.
                  </p>
                </div>
              </div>

              <div className="table-wrapper luxury-card">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Room #</th>
                      <th>Chamber Name</th>
                      <th>Category &amp; Floor</th>
                      <th>Max Guests</th>
                      <th>Operational Status</th>
                      <th>Base Tariff (₹ / Night)</th>
                      <th className="text-right">Edit Charges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id}>
                        <td>
                          <span className="room-pill">Room {room.number}</span>
                        </td>
                        <td>
                          <strong>{room.name}</strong>
                          <div className="tiny-sub">{room.bedType} • {room.sizeSqFt} sq ft</div>
                        </td>
                        <td>
                          <span>{room.category}</span>
                          <div className="tiny-sub">{room.floor}</div>
                        </td>
                        <td>{room.maxOccupancy} Guests</td>
                        <td>
                          <span className="status-badge" data-status={room.status}>
                            {room.status}
                          </span>
                        </td>
                        <td>
                          {editingRoomId === room.id ? (
                            <div className="price-edit-group">
                              <span className="rupee-symbol">₹</span>
                              <input
                                type="number"
                                value={newPriceValue}
                                onChange={(e) => setNewPriceValue(e.target.value)}
                                className="price-inline-input"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <span className="gold-text font-bold text-base">
                              {formatINR(room.basePrice)}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          {editingRoomId === room.id ? (
                            <div className="edit-btn-group">
                              <button
                                onClick={() => handleSavePrice(room.id)}
                                className="btn-primary action-btn-small"
                              >
                                <Check size={14} /> Save
                              </button>
                              <button
                                onClick={() => setEditingRoomId(null)}
                                className="btn-outline action-btn-small"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditPrice(room)}
                              className="btn-outline action-btn-small"
                            >
                              <Edit2 size={13} /> Edit Charges
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MASTER BOOKINGS LEDGER */}
          {activeTab === 'ledger' && (
            <div className="tab-ledger-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Master Reservations Ledger</h2>
                  <p className="tab-subtext">Complete audit log of all guest reservations, revenue, and status.</p>
                </div>

                <div className="search-ledger-box">
                  <input
                    type="text"
                    placeholder="Search by ref, guest name, status..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="ledger-input"
                  />
                </div>
              </div>

              <div className="table-wrapper luxury-card">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Guest Details</th>
                      <th>Sanctuary</th>
                      <th>Dates &amp; Nights</th>
                      <th>Total (INR ₹)</th>
                      <th>Status</th>
                      <th className="text-right">Audit Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLedger.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong className="gold-text">{b.id}</strong>
                          <div className="tiny-sub">{b.createdDate}</div>
                        </td>
                        <td>
                          <strong>{b.guestName}</strong>
                          <div className="tiny-sub">{b.guestEmail} • {b.guestPhone}</div>
                        </td>
                        <td>
                          <span>{b.roomName}</span>
                          <div className="tiny-sub">Room {b.roomNumber}</div>
                        </td>
                        <td>
                          <span>{b.checkIn} to {b.checkOut}</span>
                          <div className="tiny-sub">{b.nights} Nights • {b.guests} Guests</div>
                        </td>
                        <td>
                          <span className="font-bold gold-text">{formatINR(b.totalAmount)}</span>
                          <div className="tiny-sub">Includes 18% GST</div>
                        </td>
                        <td>
                          <span className="status-badge" data-status={b.status}>
                            {b.status}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => setSelectedBookingForInvoice(b)}
                            className="btn-outline action-btn-small"
                            title="View GST Tax Invoice"
                          >
                            <FileText size={13} /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF & HUMAN RESOURCES */}
          {activeTab === 'staff' && (
            <div className="tab-staff-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Staff &amp; Human Resources Directory</h2>
                  <p className="tab-subtext">Manage operational staff, departmental allocations, and duty shifts.</p>
                </div>

                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="btn-primary"
                >
                  <Plus size={16} /> Add Team Member
                </button>
              </div>

              <div className="table-wrapper luxury-card">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Role &amp; Title</th>
                      <th>Department</th>
                      <th>Shift Schedule</th>
                      <th>Contact Info</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((emp) => (
                      <tr key={emp.id}>
                        <td>
                          <strong>{emp.name}</strong>
                        </td>
                        <td>{emp.role}</td>
                        <td>
                          <span className="dept-tag">{emp.department}</span>
                        </td>
                        <td>{emp.shift}</td>
                        <td>
                          <div>{emp.email}</div>
                          <div className="tiny-sub">{emp.phone}</div>
                        </td>
                        <td>
                          <span className="duty-status-badge">
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL AUDIT & CONTROLS */}
          {activeTab === 'financials' && (
            <div className="tab-financials-view fade-in">
              <div className="section-sub-header">
                <div>
                  <h2 className="tab-heading">Financial Audit &amp; System Administration</h2>
                  <p className="tab-subtext">Comprehensive revenue breakdown in Indian Rupees (₹) and data controls.</p>
                </div>
              </div>

              <div className="financials-cards-grid">
                <div className="fin-card luxury-card">
                  <span className="fin-title">Room Accommodation Gross</span>
                  <span className="fin-amount gold-text">{formatINR(totalRoomRevenue)}</span>
                  <p className="fin-desc">Base tariffs collected from all confirmed &amp; checked-in stays.</p>
                </div>

                <div className="fin-card luxury-card">
                  <span className="fin-title">In-Room Dining &amp; Butler Services</span>
                  <span className="fin-amount gold-text">{formatINR(totalDiningRevenue)}</span>
                  <p className="fin-desc">Delivered culinary orders, chauffeurs, and concierge requests.</p>
                </div>

                <div className="fin-card luxury-card">
                  <span className="fin-title">Total GST Collected (18%)</span>
                  <span className="fin-amount gold-text">{formatINR(totalGstCollected)}</span>
                  <p className="fin-desc">Govt. hospitality tax (9% CGST + 9% SGST).</p>
                </div>

                <div className="fin-card luxury-card highlight-card">
                  <span className="fin-title">Net Hotel Revenue</span>
                  <span className="fin-amount gold-gradient-text text-2xl font-bold">{formatINR(totalRevenue)}</span>
                  <p className="fin-desc">Total audited turnover across all palace operations.</p>
                </div>
              </div>

              {/* Reset Data Control */}
              <div className="system-reset-box luxury-card mt-8">
                <div className="reset-info">
                  <AlertTriangle size={24} className="amber-text" />
                  <div>
                    <h3 className="reset-title">Reset Demonstration State</h3>
                    <p className="reset-desc">
                      Reset all bookings, room statuses, tariffs, and service requests back to factory demonstration data.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all hotel data back to initial seed state?')) {
                      resetToDefaults();
                      showFeedback('Hotel state reset to initial demo data successfully.');
                    }
                  }}
                  className="btn-outline reset-btn"
                >
                  <RefreshCw size={15} /> Reset Demo Data
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Add Staff Simple Modal */}
      {showAddStaffModal && (
        <div className="simple-modal-backdrop" onClick={() => setShowAddStaffModal(false)}>
          <div className="simple-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title mb-4">Add Staff Team Member</h2>
            <form onSubmit={handleCreateStaff}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Ramesh Chandra"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Role / Designation</label>
                <input
                  type="text"
                  required
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Concierge Officer"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Department</label>
                <select
                  value={staffDept}
                  onChange={(e) => setStaffDept(e.target.value)}
                  className="input-field"
                >
                  <option value="Front Office">Front Office &amp; Reception</option>
                  <option value="Housekeeping">Housekeeping &amp; Laundry</option>
                  <option value="Food & Beverage">Food &amp; Beverage</option>
                  <option value="Engineering">Engineering &amp; Maintenance</option>
                  <option value="Accounts">Accounts &amp; Finance</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Shift Schedule</label>
                <select
                  value={staffShift}
                  onChange={(e) => setStaffShift(e.target.value)}
                  className="input-field"
                >
                  <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
                  <option value="Day (09:00 - 17:30)">Day (09:00 - 17:30)</option>
                  <option value="Evening (14:00 - 23:00)">Evening (14:00 - 23:00)</option>
                  <option value="Night (22:30 - 07:30)">Night (22:30 - 07:30)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Work Email</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="input-field"
                  placeholder="name@royalhotel.in"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Contact</label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="modal-footer-actions mt-4">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <SimpleInvoiceModal
        booking={selectedBookingForInvoice}
        isOpen={!!selectedBookingForInvoice}
        onClose={() => setSelectedBookingForInvoice(null)}
      />

      <style>{`
        .admin-header-section {
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-subtle);
          padding-top: 3rem;
        }
        .admin-profile-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .admin-role-chip {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #c5a059;
          background: rgba(197, 160, 89, 0.15);
          padding: 0.25rem 0.7rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.5rem;
        }
        .admin-title {
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          margin-bottom: 0.4rem;
        }
        .admin-meta {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .admin-kpi-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .kpi-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          min-width: 130px;
        }
        .kpi-card.gold-border {
          border-color: var(--border-gold);
        }
        .kpi-num {
          font-size: 1.45rem;
          font-weight: 700;
        }
        .kpi-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .admin-tabs-bar {
          display: flex;
          gap: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;
          overflow-x: auto;
        }
        .admin-tab-btn {
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
        .admin-tab-btn:hover {
          color: var(--accent-gold);
        }
        .admin-tab-btn.active {
          color: var(--accent-gold);
          border-bottom-color: var(--accent-gold);
        }
        .admin-alert-banner {
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
        .admin-data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }
        .admin-data-table th {
          background: var(--bg-elevated);
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .admin-data-table td {
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .room-pill {
          font-weight: 700;
          color: var(--accent-gold);
          font-size: 0.85rem;
        }
        .price-edit-group {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .rupee-symbol {
          font-weight: 700;
          color: var(--accent-gold);
        }
        .price-inline-input {
          width: 100px;
          padding: 0.35rem 0.5rem;
          border: 1px solid var(--accent-gold);
          border-radius: 4px;
          background: var(--bg-surface);
          color: var(--text-main);
          font-size: 0.9rem;
          font-weight: 700;
        }
        .edit-btn-group {
          display: flex;
          gap: 0.4rem;
          justify-content: flex-end;
        }
        .search-ledger-box .ledger-input {
          padding: 0.55rem 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          color: var(--text-main);
          font-size: 0.88rem;
          min-width: 280px;
        }
        .dept-tag {
          font-size: 0.78rem;
          background: var(--bg-elevated);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border-subtle);
        }
        .duty-status-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 600;
          color: #10b981;
          background: rgba(16, 185, 129, 0.12);
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
        }
        .financials-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .fin-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .fin-title {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .fin-amount {
          font-size: 1.8rem;
          font-weight: 700;
        }
        .fin-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .highlight-card {
          border-color: var(--border-gold);
          background: var(--bg-elevated);
        }
        .system-reset-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          border-color: rgba(245, 158, 11, 0.3);
          flex-wrap: wrap;
        }
        .reset-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .reset-title {
          font-size: 1.1rem;
          margin-bottom: 0.2rem;
        }
        .reset-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .reset-btn {
          border-color: #f59e0b;
          color: #f59e0b;
        }
        .reset-btn:hover {
          background: rgba(245, 158, 11, 0.15);
        }
      `}</style>
    </div>
  );
}
