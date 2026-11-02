import React, { useState } from 'react';
import { X, Calendar, Users, CheckCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { useHotelData, formatINR } from '../context/HotelDataContext';

export default function SimpleBookingModal({ room, isOpen, onClose, onSuccess }) {
  const { createBooking, currentUser } = useHotelData();

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [guests, setGuests] = useState(room?.maxOccupancy > 1 ? 2 : 1);
  const [guestName, setGuestName] = useState(currentUser?.name || 'Alexander Wright');
  const [guestEmail, setGuestEmail] = useState(currentUser?.email || 'alexander@royalhotel.in');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [specialRequests, setSpecialRequests] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handleClose = React.useCallback(() => {
    setConfirmedBooking(null);
    onClose();
  }, [onClose]);

  // Prevent background scroll while modal is active & support Escape key
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') handleClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen || !room) return null;

  // Calculation in INR
  const nights = Math.max(
    1,
    Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1
  );
  const subtotal = room.basePrice * nights;
  const taxGst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + taxGst;

  const handleConfirm = (e) => {
    e.preventDefault();
    const booking = createBooking({
      roomId: room.id,
      roomName: room.name,
      roomNumber: room.number,
      checkIn,
      checkOut,
      guests,
      basePricePerNight: room.basePrice,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
    });
    setConfirmedBooking(booking);
    if (onSuccess) onSuccess(booking);
  };


  return (
    <div className="simple-modal-backdrop" onClick={handleClose}>
      <div className="simple-modal-card modal-pop-in" onClick={(e) => e.stopPropagation()}>
        <button className="simple-modal-close-btn" onClick={handleClose} aria-label="Close">
          <X size={20} />
        </button>

        {confirmedBooking ? (
          <div className="booking-success-view">
            <div className="success-icon-badge">
              <CheckCircle size={48} className="gold-text" />
            </div>
            <h2 className="success-title">Reservation Confirmed!</h2>
            <p className="success-subtitle">
              Thank you for choosing Royal Hotel. Your royal sanctuary awaits.
            </p>

            <div className="booking-receipt-box">
              <div className="receipt-row">
                <span>Booking Reference</span>
                <strong className="gold-text">{confirmedBooking.id}</strong>
              </div>
              <div className="receipt-row">
                <span>Sanctuary</span>
                <strong>{confirmedBooking.roomName}</strong>
              </div>
              <div className="receipt-row">
                <span>Allocated Room</span>
                <strong>Room {confirmedBooking.roomNumber}</strong>
              </div>
              <div className="receipt-row">
                <span>Duration</span>
                <span>{confirmedBooking.checkIn} to {confirmedBooking.checkOut} ({confirmedBooking.nights} Nights)</span>
              </div>
              <div className="receipt-row total-highlight">
                <span>Total Amount Paid (Inc. 18% GST)</span>
                <span className="gold-text font-bold">{formatINR(confirmedBooking.totalAmount)}</span>
              </div>
            </div>

            <div className="success-actions">
              <button
                className="btn-primary w-full"
                onClick={() => {
                  handleClose();
                  window.location.href = '/customer';
                }}
              >
                View in Customer Portal
              </button>
              <button className="btn-outline w-full" onClick={handleClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="booking-form-view">
            {/* Header with Room Summary */}
            <div className="booking-header">
              <div className="room-meta">
                <span className="room-badge">{room.category}</span>
                <h2 className="room-title">{room.name}</h2>
                <p className="room-subtitle">
                  {room.bedType} • {room.view} • {room.sizeSqFt} sq ft
                </p>
              </div>
              <div className="room-price-tag">
                <span className="price-val">{formatINR(room.basePrice)}</span>
                <span className="price-unit">/ night + GST</span>
              </div>
            </div>

            {/* Date and Guests Selection */}
            <div className="booking-inputs-grid">
              <div className="input-field-group">
                <label className="field-label">
                  <Calendar size={14} /> Check-In Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="simple-input"
                  required
                />
              </div>

              <div className="input-field-group">
                <label className="field-label">
                  <Calendar size={14} /> Check-Out Date
                </label>
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="simple-input"
                  required
                />
              </div>

              <div className="input-field-group">
                <label className="field-label">
                  <Users size={14} /> Total Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="simple-input"
                >
                  {Array.from({ length: room.maxOccupancy }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guest Details */}
            <div className="guest-details-grid">
              <div className="input-field-group">
                <label className="field-label">Primary Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="simple-input"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="input-field-group">
                <label className="field-label">Contact Phone</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="simple-input"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div className="input-field-group full-width">
                <label className="field-label">Email Address for Confirmation</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="simple-input"
                  placeholder="email@domain.com"
                  required
                />
              </div>
              <div className="input-field-group full-width">
                <label className="field-label">Special Requests (Optional)</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="simple-input"
                  placeholder="Early check-in, dietary preferences, extra bedding, etc."
                />
              </div>
            </div>

            {/* Price Breakdown in Indian Rupees */}
            <div className="price-breakdown-card">
              <div className="price-row">
                <span>Room Tariff ({formatINR(room.basePrice)} × {nights} Night{nights > 1 ? 's' : ''})</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="price-row">
                <span>Hospitality GST (18%)</span>
                <span>{formatINR(taxGst)}</span>
              </div>
              <div className="price-row grand-total">
                <span>Total Payable Amount</span>
                <span className="total-gold">{formatINR(totalAmount)}</span>
              </div>
              <div className="payment-security-note">
                <ShieldCheck size={16} className="gold-text" />
                <span>Instant Confirmation • All Indian Cards, UPI, NetBanking Accepted</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer-actions">
              <button type="button" className="btn-outline" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <CreditCard size={18} /> Confirm &amp; Reserve ({formatINR(totalAmount)})
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .simple-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(7, 10, 17, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .simple-modal-card {
          position: relative;
          background: var(--bg-surface);
          border: 1px solid var(--border-gold);
          border-radius: var(--radius-md);
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
          padding: 2rem;
          color: var(--text-main);
        }
        .simple-modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .simple-modal-close-btn:hover {
          color: var(--text-main);
          border-color: var(--accent-gold);
        }
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1.5rem;
          gap: 1rem;
        }
        .room-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent-gold);
          background: var(--accent-gold-muted);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          margin-bottom: 0.4rem;
        }
        .room-title {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .room-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .room-price-tag {
          text-align: right;
        }
        .price-val {
          display: block;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--accent-gold);
        }
        .price-unit {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .booking-inputs-grid, .guest-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .guest-details-grid .full-width {
          grid-column: 1 / -1;
        }
        .input-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .field-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-muted);
        }
        .simple-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          font-size: 0.9rem;
          font-family: inherit;
        }
        .simple-input:focus {
          outline: none;
          border-color: var(--accent-gold);
        }
        .price-breakdown-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: var(--text-muted);
        }
        .price-row.grand-total {
          border-top: 1px dashed var(--border-subtle);
          padding-top: 0.75rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .total-gold {
          font-size: 1.3rem;
          color: var(--accent-gold);
          font-weight: 700;
        }
        .payment-security-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
        }
        .modal-footer-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .booking-success-view {
          text-align: center;
          padding: 1rem 0;
        }
        .success-icon-badge {
          margin-bottom: 1rem;
        }
        .success-title {
          font-size: 1.7rem;
          margin-bottom: 0.5rem;
        }
        .success-subtitle {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }
        .booking-receipt-box {
          background: var(--bg-elevated);
          border: 1px solid var(--border-gold);
          border-radius: var(--radius-sm);
          padding: 1.25rem;
          text-align: left;
          margin-bottom: 1.5rem;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0;
          font-size: 0.9rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .receipt-row:last-child {
          border-bottom: none;
        }
        .receipt-row.total-highlight {
          padding-top: 0.75rem;
          font-size: 1rem;
        }
        .success-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .w-full {
          width: 100%;
        }
        @media (max-width: 600px) {
          .booking-inputs-grid, .guest-details-grid {
            grid-template-columns: 1fr;
          }
          .booking-header {
            flex-direction: column;
          }
          .room-price-tag {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}
