import React, { useEffect } from 'react';
import { X, Printer, Crown, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatINR } from '../context/HotelDataContext';

export default function SimpleInvoiceModal({ booking, isOpen, onClose }) {
  // Prevent background scroll while modal is active & support Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="simple-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="invoice-popup-card modal-pop-in" onClick={(e) => e.stopPropagation()}>
        {/* Top Floating Control Bar */}
        <div className="invoice-controls-bar no-print">
          <div className="invoice-status-pill">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Official GST Tax Invoice</span>
          </div>

          <div className="ctrl-buttons-group">
            <button
              type="button"
              className="print-action-btn"
              onClick={handlePrint}
              title="Print or Save as PDF"
            >
              <Printer size={15} />
              <span>Print / Download PDF</span>
            </button>

            <button
              type="button"
              className="invoice-close-icon-btn"
              onClick={onClose}
              aria-label="Close Invoice"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Bill Area */}
        <div className="printable-invoice-sheet">
          {/* Header Row */}
          <div className="invoice-brand-row">
            <div className="hotel-title-group">
              <div className="invoice-crown-box">
                <Crown size={26} color="#b38b3f" />
              </div>
              <div>
                <h1 className="hotel-name">ROYAL HOTEL &amp; GRAND SPA</h1>
                <p className="hotel-location">Palace Road, Lake Pichola, Udaipur, Rajasthan 313001, India</p>
                <p className="hotel-contact">Tel: +91 294 242 8800 • Email: billing@royalhotel.in</p>
              </div>
            </div>

            <div className="invoice-meta-box">
              <span className="tax-invoice-heading">TAX INVOICE</span>
              <div className="meta-lines">
                <p><strong>GSTIN:</strong> 08AAACR1234F1Z5</p>
                <p><strong>Invoice No:</strong> INV-{booking.id?.replace('ROY-', '2026-')}</p>
                <p><strong>Date of Issue:</strong> {booking.createdDate || '2026-10-31'}</p>
                <p><strong>Currency:</strong> INR (₹)</p>
              </div>
            </div>
          </div>

          <div className="invoice-divider" />

          {/* Guest and Stay Details Grid */}
          <div className="invoice-details-grid">
            <div className="details-col guest-col">
              <h3 className="section-title">Billed To (Guest Details)</h3>
              <p className="primary-guest-name">{booking.guestName}</p>
              <p className="detail-line">{booking.guestEmail}</p>
              <p className="detail-line">{booking.guestPhone}</p>
              <p className="detail-line"><strong>Guests:</strong> {booking.guests} Adult(s)</p>
            </div>

            <div className="details-col stay-col">
              <h3 className="section-title">Reservation Particulars</h3>
              <p className="detail-line"><strong>Booking Reference:</strong> <span className="ref-tag">{booking.id}</span></p>
              <p className="detail-line"><strong>Sanctuary:</strong> {booking.roomName}</p>
              <p className="detail-line"><strong>Chamber Number:</strong> Room {booking.roomNumber}</p>
              <p className="detail-line">
                <strong>Stay Period:</strong> {booking.checkIn} to {booking.checkOut} ({booking.nights} Night{booking.nights > 1 ? 's' : ''})
              </p>
            </div>
          </div>

          {/* Itemized Tariffs Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-center">SAC Code</th>
                <th className="text-center">Tariff / Night</th>
                <th className="text-center">Nights</th>
                <th className="text-right">Taxable Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Luxury Palatial Accommodation</strong>
                  <div className="item-sub-desc">{booking.roomName} — Chamber {booking.roomNumber}</div>
                </td>
                <td className="text-center">996311</td>
                <td className="text-center">{formatINR(booking.basePricePerNight)}</td>
                <td className="text-center">{booking.nights}</td>
                <td className="text-right font-medium">{formatINR(booking.subtotal)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-right footer-label">Taxable Subtotal:</td>
                <td className="text-right footer-val">{formatINR(booking.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right footer-label">Central GST (CGST @ 9.0%):</td>
                <td className="text-right footer-val">{formatINR(Math.round(booking.taxGst / 2))}</td>
              </tr>
              <tr>
                <td colSpan="4" className="text-right footer-label">State GST (SGST @ 9.0%):</td>
                <td className="text-right footer-val">{formatINR(Math.round(booking.taxGst / 2))}</td>
              </tr>
              <tr className="grand-total-row">
                <td colSpan="4" className="text-right grand-label">Total Amount Payable (INR):</td>
                <td className="text-right grand-value">{formatINR(booking.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Settlement Badge & Signatory Seal */}
          <div className="invoice-footer-row">
            <div className="settlement-info">
              <div className="paid-status-chip">
                <CheckCircle2 size={16} />
                <span>{booking.paymentStatus || 'Payment Settled via Electronic Transfer'}</span>
              </div>
              <p className="computer-gen-note">
                This is a computer-generated tax invoice verified under the Indian GST Act. No physical signature required.
              </p>
            </div>

            <div className="signatory-box">
              <div className="auth-stamp">
                <span className="hotel-firm">ROYAL HOTEL HOSPITALITY LTD</span>
                <span className="seal-tag">UDAIPUR PALACE ESTATE</span>
              </div>
              <span className="auth-signatory-line">Authorized Signatory</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Popup Card Centered */
        .invoice-popup-card {
          background: #ffffff;
          color: #1e293b;
          border-radius: 16px;
          width: 100%;
          max-width: 760px;
          max-height: 92vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(197, 160, 89, 0.35);
          position: relative;
          margin: auto;
          display: flex;
          flex-direction: column;
        }

        .invoice-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.75rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          border-radius: 16px 16px 0 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .invoice-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #065f46;
          background: #d1fae5;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
        }

        .ctrl-buttons-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .print-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #0f172a;
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .print-action-btn:hover {
          background: #334155;
        }

        .invoice-close-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .invoice-close-icon-btn:hover {
          color: #0f172a;
          border-color: #94a3b8;
          background: #f1f5f9;
        }

        .printable-invoice-sheet {
          padding: 2.25rem 2.5rem;
        }

        .invoice-brand-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .hotel-title-group {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .invoice-crown-box {
          width: 48px;
          height: 48px;
          background: rgba(179, 139, 63, 0.12);
          border: 1px solid rgba(179, 139, 63, 0.35);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hotel-name {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.05em;
          line-height: 1.2;
          margin-bottom: 0.3rem;
        }

        .hotel-location, .hotel-contact {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.4;
        }

        .invoice-meta-box {
          text-align: right;
        }

        .tax-invoice-heading {
          display: inline-block;
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #b38b3f;
          margin-bottom: 0.5rem;
        }

        .meta-lines {
          font-size: 0.82rem;
          color: #334155;
          line-height: 1.5;
        }

        .invoice-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 1.75rem 0;
        }

        .invoice-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 0.6rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.3rem;
        }

        .primary-guest-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .detail-line {
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.6;
        }

        .ref-tag {
          font-weight: 700;
          color: #b38b3f;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
          font-size: 0.88rem;
        }

        .invoice-table th {
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          border-bottom: 2px solid #cbd5e1;
          padding: 0.75rem 0.85rem;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
          letter-spacing: 0.05em;
        }

        .invoice-table td {
          padding: 0.9rem 0.85rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }

        .item-sub-desc {
          font-size: 0.78rem;
          color: #64748b;
          margin-top: 0.2rem;
        }

        .invoice-table tfoot td {
          border-bottom: none;
          padding: 0.45rem 0.85rem;
        }

        .footer-label {
          font-size: 0.85rem;
          color: #64748b;
        }

        .footer-val {
          font-size: 0.88rem;
          color: #0f172a;
        }

        .grand-total-row td {
          border-top: 2px solid #0f172a !important;
          border-bottom: 2px solid #0f172a !important;
          padding-top: 0.75rem !important;
          padding-bottom: 0.75rem !important;
        }

        .grand-label {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .grand-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: #b38b3f;
        }

        .invoice-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 2rem;
          padding-top: 1rem;
        }

        .paid-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 0.6rem;
        }

        .computer-gen-note {
          font-size: 0.72rem;
          color: #94a3b8;
          max-width: 340px;
          line-height: 1.4;
        }

        .signatory-box {
          text-align: right;
        }

        .auth-stamp {
          border: 1px dashed #b38b3f;
          padding: 0.5rem 0.85rem;
          border-radius: 6px;
          display: inline-block;
          background: rgba(179, 139, 63, 0.05);
          margin-bottom: 0.5rem;
        }

        .hotel-firm {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.05em;
        }

        .seal-tag {
          font-size: 0.65rem;
          color: #b38b3f;
          font-weight: 600;
        }

        .auth-signatory-line {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.5rem;
          padding-top: 0.25rem;
        }

        @media (max-width: 680px) {
          .invoice-brand-row, .invoice-details-grid, .invoice-footer-row {
            grid-template-columns: 1fr;
            flex-direction: column;
            text-align: left;
          }
          .invoice-meta-box, .signatory-box {
            text-align: left;
          }
          .printable-invoice-sheet {
            padding: 1.5rem 1.25rem;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .simple-modal-backdrop {
            position: static !important;
            background: none !important;
            padding: 0 !important;
          }
          .invoice-popup-card {
            box-shadow: none !important;
            max-width: 100% !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
