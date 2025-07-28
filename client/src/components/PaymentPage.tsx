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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="card-premium max-w-md w-full p-8 relative">
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl transition-colors" 
            onClick={onClose}
          >
            ×
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold gradient-text mb-4">Payment Submitted!</h2>
            <p className="text-gray-300 mb-6">You'll receive access within 3 hours after payment confirmation.</p>
            <button 
              onClick={onClose}
              className="btn-premium px-8 py-3"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-premium max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button 
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl transition-colors" 
          onClick={onClose}
        >
          ×
        </button>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 glass-effect px-4 py-2 mb-4">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-sm font-medium">Premium Access</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Unlock <span className="gradient-text">Premium Events</span>
          </h1>
          <p className="text-xl text-gray-300">₱5,000 Monthly Subscription</p>
        </div>
        
        {/* GCash Payment Section */}
        <div className="glass-effect p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
            GCash Payment
          </h3>
          <div className="flex justify-center mb-4">
            <img src="/IMG_1509.JPG" alt="GCash QR Code" className="w-64 h-64 object-contain rounded-lg shadow-lg" />
          </div>
          <p className="text-center">
            <span className="text-gray-300">GCash Number: </span>
            <span className="gradient-text font-semibold">09291860540</span>
          </p>
        </div>
        
        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Your Contact Details
            </h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="input-premium w-full"
              />
              <input
                type="tel"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="input-premium w-full"
              />
            </div>
          </div>
          
          {/* Subscription Info */}
          <div className="glass-effect p-6">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
              <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Monthly Subscription
            </h3>
            <p className="text-2xl font-bold gradient-text mb-2">₱5,000</p>
            <p className="text-gray-300 text-sm">Recurring payment required each month</p>
          </div>
          
          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Payment Instructions
            </h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start space-x-3">
                <span className="badge-premium text-xs">1</span>
                <p>Send ₱5,000 via GCash to the number above</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="badge-premium text-xs">2</span>
                <p>Fill out your contact details above</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="badge-premium text-xs">3</span>
                <p>Wait for access confirmation (within 3 hours) - I will send an update through your email and phone number to notify you when your account has access to the premium events</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              className="btn-premium flex-1" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Payment Info'
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
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