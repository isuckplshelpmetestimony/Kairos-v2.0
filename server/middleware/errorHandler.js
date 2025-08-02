const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Error logging function
const logError = (error, req) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    },
    request: {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    }
  };

  // Write to log file
  const logFile = path.join(logsDir, 'error.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

  // Console logging for development
  if (process.env.NODE_ENV !== 'production') {
    console.error('🚨 ERROR LOGGED:', {
      timestamp,
      message: error.message,
      url: req.url,
      userId: req.user?.id || 'anonymous'
    });
  }
};

// Error types and their user-friendly messages
const errorMessages = {
  ValidationError: 'The information provided is not valid. Please check your input and try again.',
  AuthenticationError: 'You need to be logged in to access this feature.',
  AuthorizationError: 'You do not have permission to perform this action.',
  DatabaseError: 'We encountered a temporary issue with our database. Please try again in a moment.',
  NetworkError: 'We are experiencing connectivity issues. Please check your internet connection.',
  RateLimitError: 'You are making too many requests. Please wait a moment before trying again.',
  NotFoundError: 'The requested resource was not found.',
  ServerError: 'We encountered an unexpected error. Our team has been notified.',
  default: 'Something went wrong. Please try again later.'
};

// Get user-friendly error message
const getUserFriendlyMessage = (error) => {
  // Check for specific error types
  if (error.name === 'ValidationError') return errorMessages.ValidationError;
  if (error.name === 'AuthenticationError') return errorMessages.AuthenticationError;
  if (error.name === 'AuthorizationError') return errorMessages.AuthorizationError;
  if (error.name === 'RateLimitError') return errorMessages.RateLimitError;
  if (error.name === 'NotFoundError') return errorMessages.NotFoundError;
  
  // Check for database errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return errorMessages.DatabaseError;
  }
  
  // Check for network errors
  if (error.code === 'ENETUNREACH' || error.code === 'ETIMEDOUT') {
    return errorMessages.NetworkError;
  }
  
  // Check for HTTP status codes
  if (error.status === 404) return errorMessages.NotFoundError;
  if (error.status === 401) return errorMessages.AuthenticationError;
  if (error.status === 403) return errorMessages.AuthorizationError;
  if (error.status === 429) return errorMessages.RateLimitError;
  
  return errorMessages.default;
};

// Main error handling middleware
const errorHandler = (error, req, res, next) => {
  // Log the error
  logError(error, req);
  
  // Determine if we should show detailed errors in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(error);
  
  // Determine status code
  let statusCode = error.status || error.statusCode || 500;
  
  // Ensure status code is valid
  if (statusCode < 100 || statusCode > 599) {
    statusCode = 500;
  }
  
  // Create error response
  const errorResponse = {
    error: true,
    message: userMessage,
    timestamp: new Date().toISOString(),
    requestId: req.id || `req_${Date.now()}`,
    ...(isDevelopment && {
      debug: {
        originalMessage: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      }
    })
  };
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 handler for unmatched routes
const notFoundHandler = (req, res, next) => {
  const error = new Error('Route not found');
  error.name = 'NotFoundError';
  error.status = 404;
  next(error);
};

// Async error wrapper for route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
class ValidationError extends Error {
  constructor(message = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}

class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
    this.status = 429;
  }
}

class DatabaseError extends Error {
  constructor(message = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  DatabaseError
}; 