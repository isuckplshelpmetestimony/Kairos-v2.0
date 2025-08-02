const Joi = require('joi');

/**
 * Environment validation schema
 * Ensures all required environment variables are present and valid
 */
const envSchema = Joi.object({
  // Database Configuration
  DATABASE_URL: Joi.string().uri().required(),
  
  // Security Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  SESSION_SECRET: Joi.string().min(32).required(),
  
  // Server Configuration
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
  
  // AI Services Configuration (Optional)
  GEMINI_API_KEY: Joi.string().optional(),
  
  // Web Scraping Configuration (Optional)
  FIRECRAWL_URL: Joi.string().uri().optional(),
  FIRECRAWL_API_KEY: Joi.string().optional(),
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().integer().min(1).default(100),
  
  // Session Configuration
  SESSION_MAX_AGE: Joi.number().integer().min(1000).default(24 * 60 * 60 * 1000), // 24 hours
  
  // Logging Configuration
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  
  // CORS Configuration
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  
  // Premium Features Configuration
  PREMIUM_ENABLED: Joi.boolean().default(true),
  
  // Test Configuration
  TEST_DATABASE_URL: Joi.string().uri().optional(),
}).unknown();

/**
 * Validate environment variables
 */
const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env, { allowUnknown: true });
  
  if (error) {
    console.error('❌ Environment validation failed:');
    error.details.forEach(detail => {
      console.error(`  - ${detail.message}`);
    });
    process.exit(1);
  }
  
  return value;
};

/**
 * Centralized configuration object
 */
const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL,
    testUrl: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
  },
  
  // Server
  server: {
    port: parseInt(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
  
  // AI Services
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    isGeminiEnabled: !!process.env.GEMINI_API_KEY,
  },
  
  // Web Scraping
  scraping: {
    firecrawlUrl: process.env.FIRECRAWL_URL,
    firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
    isFirecrawlEnabled: !!(process.env.FIRECRAWL_URL && process.env.FIRECRAWL_API_KEY),
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  // Features
  features: {
    premiumEnabled: process.env.PREMIUM_ENABLED !== 'false',
  },
  
  // Validation
  validation: {
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    email: {
      maxLength: 255,
    },
    phone: {
      maxLength: 15,
      pattern: /^(\+63|0)?9\d{9}$/,
    },
    message: {
      maxLength: 5000,
    },
    sessionId: {
      maxLength: 100,
      pattern: /^session_[a-zA-Z0-9_-]+$/,
    },
  },
  
  // API Limits
  limits: {
    chatMessageLength: 5000,
    sessionIdLength: 100,
    emailLength: 255,
    phoneLength: 15,
    passwordMinLength: 8,
    passwordMaxLength: 128,
  },
};

/**
 * Initialize configuration
 * Validates environment variables and sets up configuration
 */
const initializeConfig = () => {
  try {
    // Validate environment variables
    const validatedEnv = validateEnv();
    
    // Log configuration status
    console.log('🔧 Configuration loaded:');
    console.log(`  - Environment: ${config.server.nodeEnv}`);
    console.log(`  - Port: ${config.server.port}`);
    console.log(`  - Database: ${config.database.url ? 'Configured' : 'Missing'}`);
    console.log(`  - JWT Secret: ${config.security.jwtSecret ? 'Configured' : 'Missing'}`);
    console.log(`  - Gemini AI: ${config.ai.isGeminiEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`  - Firecrawl: ${config.scraping.isFirecrawlEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`  - Premium Features: ${config.features.premiumEnabled ? 'Enabled' : 'Disabled'}`);
    
    return config;
  } catch (error) {
    console.error('❌ Configuration initialization failed:', error.message);
    process.exit(1);
  }
};

/**
 * Get configuration value with optional default
 */
const get = (path, defaultValue = undefined) => {
  const keys = path.split('.');
  let value = config;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};

/**
 * Check if a feature is enabled
 */
const isFeatureEnabled = (featureName) => {
  const featureMap = {
    'gemini': config.ai.isGeminiEnabled,
    'firecrawl': config.scraping.isFirecrawlEnabled,
    'premium': config.features.premiumEnabled,
  };
  
  return featureMap[featureName] || false;
};

/**
 * Get validation rules
 */
const getValidationRules = () => config.validation;

/**
 * Get API limits
 */
const getLimits = () => config.limits;

module.exports = {
  config,
  initializeConfig,
  get,
  isFeatureEnabled,
  getValidationRules,
  getLimits,
  validateEnv,
}; 