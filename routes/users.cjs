const express = require('express');
const { sql } = require('../database/connection.js');
if (typeof sql !== 'function') {
  throw new Error('sql import in users.cjs is not a function! Check database/connection.js export and import style.');
}
console.log('sql type in users.cjs:', typeof sql); // Should print 'function'
const { authenticateToken, requireAdmin } = require('../middleware/auth.js');

// ... existing code ... 