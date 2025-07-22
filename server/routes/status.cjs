const express = require('express');
const router = express.Router();

// GET /api/status/:sessionId
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  // Removed: const status = statusManager.getStatus(sessionId);

  // Removed all statusManager.getStatus or similar calls
  // if (status) {
  //   res.json(status);
  // } else {
    res.json({ message: 'Ready', type: 'idle', progress: 0 });
  // }
});

module.exports = router; 