const express = require('express');
const statusManager = require('../utils/status-manager');
const router = express.Router();

// GET /api/status/:sessionId
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const status = statusManager.getStatus(sessionId);

  if (status) {
    res.json(status);
  } else {
    res.json({ message: 'Ready', type: 'idle', progress: 0 });
  }
});

module.exports = router; 