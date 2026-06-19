process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL ??=
  'postgresql://spendbrains:spendbrains@localhost:5432/spendbrains?schema=public';
process.env.JWT_ACCESS_SECRET ??=
  'test-access-secret-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET ??=
  'test-refresh-secret-at-least-32-characters-long';
process.env.MSG91_AUTH_KEY ??= 'test-msg91-auth-key';
process.env.MSG91_SENDER_ID ??= 'SPBRNS';
process.env.MSG91_OTP_TEMPLATE_ID ??= 'test-otp-template-id';
process.env.TURNSTILE_ENABLED ??= 'false';
process.env.OTP_FIXED_CODE ??= '123456';
