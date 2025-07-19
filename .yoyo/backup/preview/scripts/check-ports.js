#!/usr/bin/env node

import { execSync } from 'child_process';

const checkPort = (port) => {
  try {
    const result = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
    return result.trim().split('\n').length > 1; // More than just the header
  } catch (error) {
    return false;
  }
};

const getServerPort = () => {
  try {
    const response = execSync('curl -s http://localhost:3001/api/health', { encoding: 'utf8' });
    return 3001;
  } catch (error) {
    try {
      const response = execSync('curl -s http://localhost:5002/api/health', { encoding: 'utf8' });
      return 5002;
    } catch (error) {
      return null;
    }
  }
};

console.log('🔍 Checking Kairos v2.0 Port Configuration...\n');

// Check what's running on common ports
const ports = [3001, 5002, 5173, 5174];
const portStatus = {};

ports.forEach(port => {
  portStatus[port] = checkPort(port);
});

console.log('📊 Port Status:');
Object.entries(portStatus).forEach(([port, inUse]) => {
  const status = inUse ? '🟢 In Use' : '⚪ Available';
  console.log(`  Port ${port}: ${status}`);
});

// Check server health
const serverPort = getServerPort();
if (serverPort) {
  console.log(`\n✅ Server is running on port ${serverPort}`);
  console.log(`📝 Frontend should connect to: http://localhost:${serverPort}/api`);
} else {
  console.log('\n❌ No server detected on common ports (3001, 5002)');
  console.log('💡 Start your server with: npm run server');
}

console.log('\n🔧 To start both services: npm run dev');
console.log('🔧 To start server only: npm run server');
console.log('🔧 To start client only: npm run client'); 