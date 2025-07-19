import emailjs from '@emailjs/browser';
import { apiClient } from './api';

// EmailJS Configuration - Replace with your actual values
const EMAILJS_SERVICE_ID = 'service_tuw06h9';  // Your Service ID
const EMAILJS_TEMPLATE_ID = 'template_jjpcu8x'; // Your Template ID
const EMAILJS_PUBLIC_KEY = 'MIuusJwAlNSUK4zaq';     // Your Public Key

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface PaymentFormData {
  email: string;
  phone: string;
}

export interface PaymentSubmission {
  id: number;
  email: string;
  phone: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const submitPaymentRequest = async (formData: { email: string; phone: string }) => {
  try {
    const response = await apiClient.submitPayment(formData.email, formData.phone);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  } catch (error) {
    console.error('Payment submission error:', error);
    throw error;
  }
};

export const sendNotificationEmail = async (formData: { email: string; phone: string }) => {
  const templateParams = {
    user_email: formData.email,
    user_phone: formData.phone,
    timestamp: new Date().toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    throw error;
  }
};

// Add this to your paymentService.ts for testing
export const testEmailNotification = async () => {
  const testData = {
    email: 'test@example.com',
    phone: '09123456789'
  };

  try {
    await sendNotificationEmail(testData);
    console.log('✅ Test email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return false;
  }
}; 