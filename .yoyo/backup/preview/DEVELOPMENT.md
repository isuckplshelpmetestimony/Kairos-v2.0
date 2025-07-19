# Kairos v2.0 Development Guide

## 🚀 Quick Start

### Start Both Services (Recommended)
```bash
npm run dev
```
This starts both server (port 3001) and client (port 5173/5174) with synchronized configurations.

### Start Services Individually
```bash
# Start server only
npm run server

# Start client only  
npm run client
```

## 🔍 Port Configuration Check

Always verify your port configuration before debugging:
```bash
npm run check-ports
```

This will show you:
- Which ports are in use
- What port your server is running on
- What port your frontend should connect to

## 🛠️ Troubleshooting Port Issues

### 1. Check Current Status
```bash
npm run check-ports
```

### 2. Kill Conflicting Processes
```bash
# Kill all Node.js processes
pkill -f "node.*server"

# Or kill specific port
lsof -ti:5002 | xargs kill -9
```

### 3. Restart with Correct Configuration
```bash
npm run dev
```

## 📋 Common Issues & Solutions

### Issue: "Failed to load resource: net::ERR_CONNECTION_REFUSED"
**Cause:** Frontend trying to connect to wrong port
**Solution:** 
1. Run `npm run check-ports`
2. Ensure frontend config matches server port
3. Restart both services with `npm run dev`

### Issue: "Port already in use"
**Cause:** Multiple servers running on same port
**Solution:**
1. Kill existing processes: `pkill -f "node.*server"`
2. Start fresh: `npm run dev`

### Issue: Authentication errors
**Cause:** Server not running or wrong port
**Solution:**
1. Check server health: `curl http://localhost:3001/api/health`
2. Verify port configuration: `npm run check-ports`

## 🔧 Configuration Files

### Server Port Configuration
- **File:** `server/index.js`
- **Default:** `process.env.PORT || 3001`
- **Override:** Set `PORT=3001` in environment

### Frontend API Configuration  
- **File:** `client/src/config.ts`
- **Default:** `http://localhost:3001/api`
- **Override:** Set `VITE_SERVER_PORT=3001` in environment

## 📝 Best Practices

1. **Always use `npm run dev`** to start both services together
2. **Check ports before debugging** with `npm run check-ports`
3. **Use environment variables** for port configuration
4. **Kill old processes** before starting new ones
5. **Verify server health** with the health endpoint

## 🚨 Emergency Reset

If everything is broken:
```bash
# Kill all Node processes
pkill -f node

# Clear any cached processes
lsof -ti:3001,5002,5173,5174 | xargs kill -9 2>/dev/null || true

# Start fresh
npm run dev
``` 