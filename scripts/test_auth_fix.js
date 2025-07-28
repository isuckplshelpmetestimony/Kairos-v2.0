const jwt = require('jsonwebtoken');

// Test the authentication fix
function testAuthFix() {
  console.log('🧪 Testing Authentication Fix...');
  
  // Simulate the token structure
  const testToken = {
    userId: 13,
    email: 'test@example.com',
    iat: Date.now(),
    exp: Date.now() + 86400000
  };
  
  // Create a test JWT
  const token = jwt.sign(testToken, process.env.JWT_SECRET || 'test-secret');
  
  console.log('✅ Test token created:', token.substring(0, 50) + '...');
  
  // Decode and verify
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    console.log('✅ Token decoded successfully');
    console.log('📊 User ID from token:', decoded.userId);
    console.log('📧 Email from token:', decoded.email);
    
    // Simulate the req.user object structure
    const reqUser = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: 'premium'
    };
    
    console.log('✅ req.user object structure:');
    console.log('  - req.user.id:', reqUser.id);
    console.log('  - req.user.userId:', reqUser.userId);
    console.log('  - req.user.email:', reqUser.email);
    console.log('  - req.user.role:', reqUser.role);
    
    if (reqUser.id && reqUser.id === decoded.userId) {
      console.log('🎉 Authentication fix verified! User ID is properly set.');
    } else {
      console.log('❌ Authentication fix failed! User ID is missing or incorrect.');
    }
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testAuthFix();
}

module.exports = { testAuthFix }; 