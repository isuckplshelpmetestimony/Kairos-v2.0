const https = require('https');
const http = require('http');

async function testChatAuth() {
  console.log('🧪 Testing Chat Authentication Fix...');
  
  try {
    // Test the chat endpoint with a simple message
    const postData = JSON.stringify({
      message: 'Test message to verify authentication fix',
      session_id: 'test_session_' + Date.now()
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
      console.log('📋 Response Headers:', res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Chat request successful!');
          console.log('📄 Response data:', data);
        } else {
          console.log('❌ Chat request failed');
          console.log('📄 Error response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testChatAuth();
}

module.exports = { testChatAuth }; 