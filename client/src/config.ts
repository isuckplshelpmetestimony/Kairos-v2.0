export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://kairos-v2-backend.onrender.com/api'
  : 'http://localhost:5002/api'; 