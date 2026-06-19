import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .pattern(/^postgresql:\/\/.+/)
    .required()
    .messages({
      'string.pattern.base': 'DATABASE_URL must be a PostgreSQL connection URL',
    }),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  MSG91_AUTH_KEY: Joi.string().required(),
  MSG91_SENDER_ID: Joi.string().max(6).required(),
  MSG91_OTP_TEMPLATE_ID: Joi.string().required(),
  OTP_TTL_MINUTES: Joi.number().integer().min(5).max(10).default(10),
  OTP_MAX_ATTEMPTS: Joi.number().integer().min(1).max(10).default(5),
  OTP_RATE_LIMIT_PHONE_PER_HOUR: Joi.number().integer().min(1).default(3),
  OTP_RATE_LIMIT_IP_PER_HOUR: Joi.number().integer().min(1).default(10),
  OTP_FIXED_CODE: Joi.string()
    .pattern(/^\d{6}$/)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.forbidden().messages({
        'any.unknown': 'OTP_FIXED_CODE must not be set in production',
      }),
      otherwise: Joi.optional(),
    }),
  OTP_USE_PHONE_SUFFIX: Joi.boolean()
    .default(false)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.valid(false).messages({
        'any.only': 'OTP_USE_PHONE_SUFFIX must not be enabled in production',
      }),
    }),
  CORS_ORIGINS: Joi.string().optional(),
  TURNSTILE_SECRET_KEY: Joi.string().optional(),
  TURNSTILE_SITE_KEY: Joi.string().optional(),
  TURNSTILE_ENABLED: Joi.boolean().default(false),
  SUPER_ADMIN_PHONES: Joi.string().optional().allow(''),
});
