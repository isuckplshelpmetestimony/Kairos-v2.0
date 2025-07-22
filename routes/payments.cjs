const express = require('express');
const { sql } = require('../database/connection.js');
if (typeof sql !== 'function') {
  throw new Error('sql import in payments.cjs is not a function! Check database/connection.js export and import style.');
}
console.log('sql type in payments.cjs:', typeof sql); // Should print 'function'
const { authenticateToken, requireAdmin } = require('../middleware/auth.js');

// ... existing code ... 