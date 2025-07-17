import React, { useState } from 'react';

interface PaymentPageProps {
  onClose: () => void;
}

const submitPaymentRequest = async (formData: { email: string; phone: string }) => {
  // TODO: Implement payment submission logic (e.g., API call)
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const sendNotificationEmail = async (formData: { email: string; phone: string }) => {
  // TODO: Implement email notification logic (e.g., API call)
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const PaymentPage: React.FC<PaymentPageProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitPaymentRequest(formData);
    await sendNotificationEmail(formData);
    setIsSubmitted(true);
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
              <li>Fill out your contact details below</li>
              <li>Wait for access confirmation (within 3 hours)</li>
            </ol>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">Submit Payment Info</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage; 