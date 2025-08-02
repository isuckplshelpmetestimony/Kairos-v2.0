# Kairos v2.0 Setup Guide

## Quick Start (Basic Setup)

### 1. Environment Variables
Copy `env.example` to `.env` and set the required variables:

```bash
# Required for basic functionality
DATABASE_URL=your_database_connection_string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key

# Optional - for AI chat responses
GEMINI_API_KEY=your-gemini-api-key
```

### 2. Start the Application
```bash
npm run dev
```

This will start both the backend (port 3001) and frontend (port 5173).

## Features by Configuration Level

### 🟢 Basic Setup (Works out of the box)
- ✅ User authentication (login/register)
- ✅ User management
- ✅ Payment processing
- ✅ Basic chat functionality
- ✅ Database operations
- ✅ All API endpoints

### 🟡 Enhanced Setup (Add AI responses)
- ✅ All basic features
- ✅ AI-powered chat responses (requires GEMINI_API_KEY)

### 🔵 Full Setup (Add web scraping)
- ✅ All enhanced features
- ✅ Web scraping for real-time data (requires FIRECRAWL_URL and FIRECRAWL_API_KEY)

## Environment Variables Explained

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `SESSION_SECRET` - Secret key for sessions

### Optional Variables
- `GEMINI_API_KEY` - Google Gemini API key for AI responses
- `FIRECRAWL_URL` - Firecrawl API URL for web scraping
- `FIRECRAWL_API_KEY` - Firecrawl API key for web scraping

## Troubleshooting

### Chat Not Working?
1. Check if `GEMINI_API_KEY` is set for AI responses
2. Check server logs for specific error messages
3. Verify database connection with `DATABASE_URL`

### Web Scraping Not Working?
1. Ensure `FIRECRAWL_URL` and `FIRECRAWL_API_KEY` are set
2. Check Firecrawl API credentials
3. Web scraping is optional - chat works without it

### Database Issues?
1. Verify `DATABASE_URL` is correct
2. Ensure database is accessible
3. Check database schema is properly set up

## Development vs Production

### Development
- Use basic setup for local development
- Optional features can be added incrementally
- Focus on core functionality first

### Production
- Set all environment variables
- Use strong, unique secrets
- Enable all features for full functionality

## Testing

Run the test suite to verify everything works:

```bash
cd server
npm test
```

All tests should pass with basic configuration. 