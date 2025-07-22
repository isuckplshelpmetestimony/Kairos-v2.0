class StatusManager {
  constructor() {
    this.sessions = new Map(); // Store status by session ID
  }

  updateStatus(sessionId, message, type = 'thinking') {
    this.sessions.set(sessionId, {
      message,
      type,
      timestamp: new Date().toISOString(),
      progress: this.calculateProgress(type)
    });
  }

  getStatus(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  clearStatus(sessionId) {
    this.sessions.delete(sessionId);
  }

  calculateProgress(type) {
    const progressMap = {
      'analyzing': 20,
      'searching': 40,
      'reasoning': 60,
      'generating': 80,
      'complete': 100
    };

    return progressMap[type] || 0;
  }
}

// Global status manager instance
const globalStatusManager = new StatusManager();

module.exports = globalStatusManager; 