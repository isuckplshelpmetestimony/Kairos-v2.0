const Joi = require('joi');

// User profile update schema
const userProfileUpdateSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email address is too long'
    }),
  phone: Joi.string()
    .pattern(/^(\+63|0)?9\d{9}$/)
    .max(15)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid Philippine phone number (e.g., 09123456789)',
      'string.max': 'Phone number is too long'
    }),
  first_name: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .optional()
    .messages({
      'string.min': 'First name cannot be empty',
      'string.max': 'First name is too long',
      'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }),
  last_name: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .optional()
    .messages({
      'string.min': 'Last name cannot be empty',
      'string.max': 'Last name is too long',
      'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    }),
  company: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Company name is too long'
    }),
  position: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Position title is too long'
    }),
  bio: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Bio is too long (maximum 500 characters)'
    })
}).strict();

// User ID validation schema
const userIdSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be a whole number',
      'number.min': 'User ID must be positive',
      'any.required': 'User ID is required'
    })
}).strict();

// User query parameters schema
const userQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be a whole number',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .optional()
    .messages({
      'any.only': 'Role must be either "user" or "admin"'
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'suspended')
    .optional()
    .messages({
      'any.only': 'Status must be "active", "inactive", or "suspended"'
    }),
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term is too long'
    })
}).strict();

// Premium status update schema
const premiumStatusSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be a whole number',
      'number.min': 'User ID must be positive',
      'any.required': 'User ID is required'
    }),
  premium_until: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.base': 'Premium expiry date must be a valid date',
      'date.greater': 'Premium expiry date must be in the future',
      'any.required': 'Premium expiry date is required'
    }),
  reason: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Reason is too long'
    })
}).strict();

// User status update schema
const userStatusSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be a whole number',
      'number.min': 'User ID must be positive',
      'any.required': 'User ID is required'
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'suspended')
    .required()
    .messages({
      'any.only': 'Status must be "active", "inactive", or "suspended"',
      'any.required': 'Status is required'
    }),
  reason: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Reason is too long'
    })
}).strict();

// Password change schema
const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string()
    .min(1)
    .max(128)
    .required()
    .messages({
      'string.min': 'Current password is required',
      'string.max': 'Current password is too long',
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password is too long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match',
      'any.required': 'Password confirmation is required'
    })
}).strict();

module.exports = {
  userProfileUpdateSchema,
  userIdSchema,
  userQuerySchema,
  premiumStatusSchema,
  userStatusSchema,
  passwordChangeSchema
}; 