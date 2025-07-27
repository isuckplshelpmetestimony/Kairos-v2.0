// Security configuration for Kairos
const securityConfig = {
  // Rate limiting settings
  rateLimiting: {
    // General API rate limiting
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Authentication rate limiting
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 login attempts per windowMs
      message: 'Too many login attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Chat rate limiting
    chat: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 10, // limit each IP to 10 chat messages per minute
      message: 'Too many chat messages, please slow down.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // File upload rate limiting
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 file uploads per hour
      message: 'Too many file uploads, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }
  },

  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] // Replace with your actual domain
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'X-Protection-Token',
      'X-User-Agent',
      'X-Timestamp'
    ],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
  },

  // Helmet security settings
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
    frameguard: { action: 'deny' }
  },

  // Session settings
  session: {
    secret: process.env.SESSION_SECRET || 'kairos-anti-scraping-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    },
    name: 'kairos-session'
  },

  // Bot detection patterns
  botPatterns: [
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
  ],

  // Suspicious user agent patterns
  suspiciousUserAgents: [
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
  ],

  // IP blocking settings
  ipBlocking: {
    // Block suspicious IPs
    suspiciousIPs: [
      // Add known scraping IPs here
    ],
    
    // Block IPs that make too many requests
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
    maxRequestsPerDay: 10000,
    
    // Block IPs that trigger too many security events
    maxSecurityEventsPerHour: 10,
    maxSecurityEventsPerDay: 100
  },

  // Request size limits
  requestLimits: {
    json: '10mb',
    urlencoded: '10mb',
    text: '10mb',
    raw: '10mb'
  },

  // Security headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'X-Download-Options': 'noopen',
    'X-DNS-Prefetch-Control': 'off'
  },

  // Logging settings
  logging: {
    enabled: true,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    securityEvents: true,
    rateLimitEvents: true,
    botDetectionEvents: true
  }
};

module.exports = securityConfig; 