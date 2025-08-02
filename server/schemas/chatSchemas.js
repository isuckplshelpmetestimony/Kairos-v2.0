const Joi = require('joi');

// Chat message validation schema
const chatMessageSchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message is too long (maximum 5000 characters)',
      'any.required': 'Message is required'
    }),
  session_id: Joi.string()
    .pattern(/^session_[a-zA-Z0-9_-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Session ID must start with "session_" followed by alphanumeric characters',
      'string.max': 'Session ID is too long'
    })
}).strict();

// Session ID validation schema
const sessionIdSchema = Joi.object({
  sessionId: Joi.string()
    .pattern(/^session_[a-zA-Z0-9_-]+$/)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Session ID must start with "session_" followed by alphanumeric characters',
      'string.max': 'Session ID is too long',
      'any.required': 'Session ID is required'
    })
}).strict();

// Chat history query parameters
const chatHistoryQuerySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be a whole number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  offset: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Offset must be a number',
      'number.integer': 'Offset must be a whole number',
      'number.min': 'Offset cannot be negative'
    }),
  session_id: Joi.string()
    .pattern(/^session_[a-zA-Z0-9_-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Session ID must start with "session_" followed by alphanumeric characters',
      'string.max': 'Session ID is too long'
    })
}).strict();

// Chat conversation validation
const chatConversationSchema = Joi.object({
  conversation_id: Joi.string()
    .pattern(/^conv_[a-zA-Z0-9_-]+$/)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Conversation ID must start with "conv_" followed by alphanumeric characters',
      'string.max': 'Conversation ID is too long'
    }),
  messages: Joi.array()
    .items(
      Joi.object({
        role: Joi.string()
          .valid('user', 'assistant')
          .required()
          .messages({
            'any.only': 'Message role must be either "user" or "assistant"',
            'any.required': 'Message role is required'
          }),
        content: Joi.string()
          .min(1)
          .max(5000)
          .required()
          .messages({
            'string.min': 'Message content cannot be empty',
            'string.max': 'Message content is too long',
            'any.required': 'Message content is required'
          }),
        timestamp: Joi.date()
          .iso()
          .optional()
          .messages({
            'date.base': 'Timestamp must be a valid date',
            'date.format': 'Timestamp must be in ISO format'
          })
      })
    )
    .min(1)
    .max(100)
    .optional()
    .messages({
      'array.min': 'At least one message is required',
      'array.max': 'Too many messages in conversation'
    })
}).strict();

// Chat feedback validation
const chatFeedbackSchema = Joi.object({
  message_id: Joi.string()
    .pattern(/^msg_[a-zA-Z0-9_-]+$/)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Message ID must start with "msg_" followed by alphanumeric characters',
      'string.max': 'Message ID is too long',
      'any.required': 'Message ID is required'
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  feedback: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Feedback is too long (maximum 1000 characters)'
    })
}).strict();

module.exports = {
  chatMessageSchema,
  sessionIdSchema,
  chatHistoryQuerySchema,
  chatConversationSchema,
  chatFeedbackSchema
}; 