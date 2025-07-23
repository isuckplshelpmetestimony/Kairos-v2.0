# Paywall Configuration Guide

## Overview
The Kairos application has a configurable paywall system that can be easily enabled or disabled without removing any payment-related code.

## Current Status
**PAYWALL IS DISABLED** - All premium features are currently free for all authenticated users.

## How to Re-enable the Paywall

### Frontend Configuration
Edit `client/src/config.ts`:
```typescript
export const config = {
  // ... other config
  DISABLE_PREMIUM_REQUIREMENTS: false, // Set to false to enable paywall
  // ... other config
};
```

### Backend Configuration
Edit `server/middleware/auth.js`:
```javascript
// Configuration flag to disable premium requirements
// Set to true to make all features free, false to enable paywall
const DISABLE_PREMIUM_REQUIREMENTS = false; // Set to false to enable paywall
```

## Premium Features
When the paywall is enabled, the following features require premium access:

### Backend API Endpoints
- `POST /api/crisis/chat` - Kairos AI Chatbot
- `GET /api/crisis/chat/history` - Chat history
- `GET /api/crisis/companies` - Crisis intelligence data
- `GET /api/crisis/companies/:id` - Individual company details

### Frontend Features
- Crisis Intelligence navigation link
- Company Intelligence search interface
- Premium event details (beyond first 3 events)
- Advanced search results (beyond first result when filtered)

## Payment System
The payment system remains fully functional and includes:
- Payment submission endpoints (`/api/payments/submit`)
- Admin approval system (`/api/payments/approve`)
- User role management (`/api/users/grant-premium`, `/api/users/revoke-premium`)
- Payment page UI (`PaymentPage.tsx`)

## Database Schema
All payment-related tables remain intact:
- `users` table with `role`, `status`, `premium_until` columns
- `payment_submissions` table for payment requests
- `user_sessions` table for session management

## Testing the Configuration
1. Set `DISABLE_PREMIUM_REQUIREMENTS: false` in both frontend and backend
2. Restart both frontend and backend servers
3. Test with a free user account - premium features should be blocked
4. Test with a premium user account - premium features should be accessible
5. Test payment flow - should work normally

## Rollback
To quickly disable the paywall again, simply set `DISABLE_PREMIUM_REQUIREMENTS: true` in both configuration files.

## Notes
- All payment code remains intact and functional
- No database changes are required
- The configuration is purely a feature flag
- Admin users always have access regardless of the flag setting 