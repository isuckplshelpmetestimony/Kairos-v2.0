const Joi = require('joi');

// Email validation with proper format checking
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .max(255)
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email address is too long',
    'any.required': 'Email is required'
  });

// Password validation with security requirements
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password is too long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  });

// Phone number validation
const phoneSchema = Joi.string()
  .pattern(/^(\+63|0)?9\d{9}$/)
  .max(15)
  .required()
  .messages({
    'string.pattern.base': 'Please provide a valid Philippine phone number (e.g., 09123456789)',
    'string.max': 'Phone number is too long',
    'any.required': 'Phone number is required'
  });

// Login schema
const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string()
    .min(1)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password is required',
      'string.max': 'Password is too long',
      'any.required': 'Password is required'
    })
}).strict();

// Registration schema
const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be either "user" or "admin"'
    })
}).strict();

// Password reset request schema
const passwordResetRequestSchema = Joi.object({
  email: emailSchema
}).strict();

// Password reset schema
const passwordResetSchema = Joi.object({
  token: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Reset token is required',
      'string.max': 'Reset token is too long',
      'any.required': 'Reset token is required'
    }),
  newPassword: passwordSchema
}).strict();

// Token verification schema
const tokenVerificationSchema = Joi.object({
  token: Joi.string()
    .min(1)
    .max(2048)
    .required()
    .messages({
      'string.min': 'Token is required',
      'string.max': 'Token is too long',
      'any.required': 'Token is required'
    })
}).strict();

module.exports = {
  loginSchema,
  registerSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  tokenVerificationSchema,
  emailSchema,
  passwordSchema,
  phoneSchema
}; 