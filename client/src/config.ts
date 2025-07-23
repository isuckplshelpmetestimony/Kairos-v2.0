// Configuration for Kairos application
export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Feature Flags
  DISABLE_PREMIUM_REQUIREMENTS: true, // Set to true to make all features free, false to enable paywall
  
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