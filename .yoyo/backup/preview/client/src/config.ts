// Get the API base URL from environment variables or use defaults
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://kairos-v2-0.onrender.com/api';
  }
  
  // In development, use the same port as the server
  const serverPort = import.meta.env.VITE_SERVER_PORT || '3001';
  return `http://localhost:${serverPort}/api`;
};

export const API_BASE_URL = getApiBaseUrl(); 