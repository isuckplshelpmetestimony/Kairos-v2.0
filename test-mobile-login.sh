#!/bin/bash

echo "🧪 Testing Mobile Login Fix..."
echo ""

# Test if the API is accessible
echo "1. Testing API accessibility..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://kairos-v2-0.onrender.com/api/health)
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API is accessible (HTTP $API_STATUS)"
else
    echo "❌ API is not accessible (HTTP $API_STATUS)"
fi

echo ""

# Test login endpoint
echo "2. Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST https://kairos-v2-0.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}')

if echo "$LOGIN_RESPONSE" | grep -q "Invalid email or password"; then
    echo "✅ Login endpoint is working (returns expected error for invalid credentials)"
else
    echo "❌ Login endpoint might have issues"
    echo "Response: $LOGIN_RESPONSE"
fi

echo ""
echo "📱 To test on your phone:"
echo "1. Go to: https://kairos-v2-0.onrender.com/login"
echo "2. Try logging in with your credentials"
echo "3. If you still get 'unexpected error', check Render environment variables"
echo ""
echo "🔧 If still broken, ensure VITE_API_URL is set to:"
echo "   https://kairos-v2-0.onrender.com/api" 