import emailjs from '@emailjs/browser';

// Initialize EmailJS (add your service ID, template ID, and public key)
const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
const EMAILJS_PUBLIC_KEY = 'your_public_key';

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

export const submitPaymentRequest = async (formData: PaymentFormData): Promise<PaymentSubmission> => {
  // Store in localStorage for now (later: database)
  const paymentSubmissions: PaymentSubmission[] = JSON.parse(localStorage.getItem('paymentSubmissions') || '[]');

  const newSubmission: PaymentSubmission = {
    id: Date.now(),
    email: formData.email,
    phone: formData.phone,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  paymentSubmissions.push(newSubmission);
  localStorage.setItem('paymentSubmissions', JSON.stringify(paymentSubmissions));

  return newSubmission;
};

export const sendNotificationEmail = async (formData: PaymentFormData): Promise<void> => {
  const templateParams = {
    user_email: formData.email,
    user_phone: formData.phone,
    timestamp: new Date().toLocaleString('en-PH'),
    to_email: 'your-admin-email@gmail.com' // Your email
  };

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
}; 