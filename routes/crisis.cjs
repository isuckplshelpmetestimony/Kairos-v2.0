const { sql } = require('../database/connection.js');
if (typeof sql !== 'function') {
  throw new Error('sql import in crisis.cjs is not a function! Check database/connection.js export and import style.');
}
console.log('sql type in crisis.cjs:', typeof sql); // Should print 'function'
const { requireAuth, requirePremium } = require('../middleware/auth.js');
const express = require('express');

// ... existing code ... 