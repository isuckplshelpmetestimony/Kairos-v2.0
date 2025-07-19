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
      <div className="payment-modal-overlay">
        <div className="payment-modal card-premium">
          <button className="close-btn text-white" onClick={onClose}>×</button>
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-white mb-4">Payment Submitted!</h2>
            <p className="text-gray-300">You'll receive access within 24 hours after payment confirmation.</p>
            <button 
              onClick={onClose}
              className="mt-6 px-6 py-2 btn-premium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal card-premium">
        <button className="close-btn text-white" onClick={onClose}>×</button>
        <h1 className="text-2xl font-bold text-white mb-6">🔒 Unlock Premium Events - ₱3,000</h1>
        
        <div className="qr-section">
          <h3 className="text-lg font-semibold text-white mb-4">📱 GCash Payment</h3>
          <div className="flex justify-center">
            <img src="/IMG_1509.JPG" alt="GCash QR Code" className="qr-code rounded-lg" />
          </div>
          <p className="mt-3 font-semibold text-center gradient-text">
            GCash Number: 09291860540
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold text-white">✉️ Your Contact Details:</h3>
          <input
            type="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-3 input-premium"
          />
          <input
            type="tel"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full px-4 py-3 input-premium"
          />
          
          <div className="subscription-info card-premium">
            <h3 className="text-lg font-semibold text-white mb-2">💳 Monthly Subscription: ₱3,000</h3>
            <p className="text-gray-300">(Recurring payment required each month)</p>
          </div>
          
          <div className="instructions">
            <h3 className="text-lg font-semibold text-white mb-3">📝 Payment Instructions:</h3>
            <ol className="text-gray-300 space-y-2">
              <li>1. Send ₱3,000 via GCash to the number above</li>
              <li>2. Fill out your contact details above</li>
              <li>3. Wait for access confirmation (within 3 hours) - I will send an update through your email and phone number to notify you when your account has access to the premium events</li>
            </ol>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn btn-premium" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment Info'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage; 