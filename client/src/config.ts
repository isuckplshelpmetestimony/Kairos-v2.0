// Configuration for Kairos application
const getApiBaseUrl = () => {
  // Check if we're in development (localhost) or production
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api';
  }
  return 'https://kairos-v2-0.onrender.com/api';
};

export const config = {
  // API Configuration
  apiBaseUrl: getApiBaseUrl(),
  
  // Feature Flags
  DISABLE_PREMIUM_REQUIREMENTS: false, // Set to false to enable paywall and blur effects
  
  // Admin Configuration
  ADMIN_EMAIL: 'seanmacalintal0409@gmail.com',
  ADMIN_PHONE: '09291860540',
  
  // Event Configuration
  FEATURED_EVENTS_LIMIT: 6,
  SEARCH_RESULTS_LIMIT: 20,
  
  // UI Configuration
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
}; 