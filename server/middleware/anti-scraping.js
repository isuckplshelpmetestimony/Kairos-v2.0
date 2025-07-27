const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const userAgent = require('express-useragent');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Bot detection patterns
const botPatterns = [
  /bot|crawler|spider|scraper|scraping/i,
  /python|curl|wget|httpclient/i,
  /selenium|puppeteer|playwright/i,
  /headless|automated|script/i,
  /scraper|scraping|harvest/i,
  /data\s*mining|web\s*scraping/i,
  /automated\s*browser|headless\s*browser/i,
  /web\s*harvest|data\s*extraction/i,
  /crawling|indexing|spidering/i,
  /web\s*robot|internet\s*bot/i,
  /automated\s*tool|script\s*automation/i,
  /web\s*mining|content\s*extraction/i,
  /automated\s*testing|headless\s*testing/i,
  /web\s*automation|browser\s*automation/i,
  /data\s*collection|web\s*data/i,
  /automated\s*access|programmatic\s*access/i,
  /web\s*scraping\s*tool|data\s*scraping/i,
  /automated\s*crawler|web\s*crawler/i,
  /content\s*harvesting|data\s*harvesting/i
];

// Suspicious user agents
const suspiciousUserAgents = [
  'python-requests',
  'curl',
  'wget',
  'selenium',
  'puppeteer',
  'playwright',
  'scrapy',
  'beautifulsoup',
  'requests',
  'urllib',
  'mechanize',
  'phantomjs',
  'headless',
  'automated',
  'bot',
  'crawler',
  'spider',
  'scraper',
  'harvester',
  'collector',
  'extractor',
  'miner',
  'gatherer',
  'fetcher',
  'downloader'
];

// Anti-scraping middleware
const antiScrapingMiddleware = (req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       req.hostname === 'localhost' || 
                       req.hostname === '127.0.0.1';
  
  // Skip some checks in development
  if (!isDevelopment) {
    // Check user agent for suspicious patterns
    const userAgent = req.get('User-Agent') || '';
    const isSuspiciousUserAgent = suspiciousUserAgents.some(agent => 
      userAgent.toLowerCase().includes(agent.toLowerCase())
    );
    
    if (isSuspiciousUserAgent) {
      console.log(`🚨 Suspicious user agent blocked: ${userAgent}`);
      return res.status(403).json({ 
        error: 'Access denied - suspicious user agent detected' 
      });
    }
    
    // Check for bot patterns in user agent
    const isBot = botPatterns.some(pattern => pattern.test(userAgent));
    if (isBot) {
      console.log(`🚨 Bot detected: ${userAgent}`);
      return res.status(403).json({ 
        error: 'Access denied - automated access detected' 
      });
    }
  }
  
  // Add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  
  next();
};

// Rate limiters (more lenient in development)
const isDevelopment = process.env.NODE_ENV === 'development';

const apiRateLimiter = createRateLimiter(
  isDevelopment ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min vs 15 min
  isDevelopment ? 1000 : 100, // 1000 vs 100 requests
  'Too many API requests'
);

const authRateLimiter = createRateLimiter(
  isDevelopment ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min vs 15 min
  isDevelopment ? 50 : 5, // 50 vs 5 login attempts
  'Too many login attempts'
);

const chatRateLimiter = createRateLimiter(
  isDevelopment ? 30 * 1000 : 60 * 1000, // 30 sec vs 1 min
  isDevelopment ? 100 : 10, // 100 vs 10 chat messages
  'Too many chat messages'
);

module.exports = {
  antiScrapingMiddleware,
  apiRateLimiter,
  authRateLimiter,
  chatRateLimiter
}; 