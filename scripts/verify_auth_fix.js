// Simple verification script to check if the auth fix is working
console.log('🔍 Verifying Authentication Fix...');

// Test the fix by making a request and checking server logs
const http = require('http');

function testAuthFix() {
  console.log('🧪 Making test request to verify user ID is set...');
  
  const postData = JSON.stringify({
    message: 'Test authentication fix',
    session_id: 'verify_session_' + Date.now()
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/crisis/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzLCJlbWFpbCI6InNlYW5tYWNhbGludGFsMDQwOUBnbWFpbC5jb20iLCJpYXQiOjE3NTM3MDEyNzYsImV4cCI6MTc1NDMwNjA3Nn0.joUql_mDA-jGkDj7ukiB5OiDhcIub-T5vokVvWNdMFs'
    }
  };

  const req = http.request(options, (res) => {
    console.log('📊 Response Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Request successful!');
        console.log('📋 Check the server logs above for:');
        console.log('   - "📊 User ID: 13" (should show actual ID, not undefined)');
        console.log('   - "✅ Database connected successfully"');
        console.log('   - No "Failed to save chat conversation" errors');
        console.log('');
        console.log('🎯 If you see "📊 User ID: 13" instead of "📊 User ID: undefined", the fix is working!');
      } else {
        console.log('❌ Request failed with status:', res.statusCode);
        console.log('📄 Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

// Run the test
testAuthFix(); 