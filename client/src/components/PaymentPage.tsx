import React, { useState } from 'react';
import { submitPaymentRequest, sendNotificationEmail } from '../lib/paymentService';

interface PaymentPageProps {
  onClose: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store payment submission
      await submitPaymentRequest(formData);

      // Send email notification
      try {
        await sendNotificationEmail(formData);
        console.log('✅ Admin notification sent successfully');
      } catch (emailError) {
        console.error('⚠️ Payment saved but email notification failed:', emailError);
        // Don't block user - payment is still recorded
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Error submitting payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="payment-success">
        <h2>Payment Submitted!</h2>
        <p>You'll receive access within 24 hours after payment confirmation.</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h1>🔒 Unlock Premium Events - ₱3,000</h1>
        <div className="qr-section">
          <h3>📱 GCash Payment</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src="/IMG_1509.JPG" alt="GCash QR Code" className="qr-code" />
          </div>
          <p style={{ marginTop: '12px', fontWeight: 600, textAlign: 'center' }}>
            GCash Number: 09291860540
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <h3>✉️ Your Contact Details:</h3>
          <input
            type="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <div className="subscription-info">
            <h3>💳 Monthly Subscription: ₱3,000</h3>
            <p>(Recurring payment required each month)</p>
          </div>
          <div className="instructions">
            <h3>📝 Payment Instructions:</h3>
            <ol>
              <li>Send ₱3,000 via GCash to the number above</li>
              <li>Fill out your contact details above</li>
              <li>Wait for access confirmation (within 3 hours) - I will send an update through your email and phone number to notify you when your account has access to the premium events</li>
            </ol>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Payment Info'}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage; 