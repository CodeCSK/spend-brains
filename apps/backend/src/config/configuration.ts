export interface AppConfig {
  nodeEnv: string;
  port: number;
}

export interface CorsConfig {
  origins: string[];
}

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface Msg91Config {
  authKey: string;
  senderId: string;
  otpTemplateId: string;
}

export interface OtpConfig {
  ttlMinutes: number;
  maxAttempts: number;
  rateLimitPerPhonePerHour: number;
  rateLimitPerIpPerHour: number;
  /** Fixed OTP for local/test only — never set in production */
  fixedCode: string | undefined;
  /** When true, OTP is the last 6 digits of the phone (staging beta only) */
  usePhoneSuffix: boolean;
}

export interface TurnstileConfig {
  secretKey: string | undefined;
  siteKey: string | undefined;
  enabled: boolean;
}

export interface SuperAdminConfig {
  /** E.164 phones allowed to access dev console (comma-separated in env). */
  phones: string[];
}

export interface RootConfig {
  app: AppConfig;
  cors: CorsConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  msg91: Msg91Config;
  otp: OtpConfig;
  turnstile: TurnstileConfig;
  superAdmin: SuperAdminConfig;
}

export default (): RootConfig => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
  },
  cors: {
    origins: (
      process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:3000'
    )
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY!,
    senderId: process.env.MSG91_SENDER_ID!,
    otpTemplateId: process.env.MSG91_OTP_TEMPLATE_ID!,
  },
  otp: {
    ttlMinutes: parseInt(process.env.OTP_TTL_MINUTES ?? '10', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
    rateLimitPerPhonePerHour: parseInt(
      process.env.OTP_RATE_LIMIT_PHONE_PER_HOUR ?? '3',
      10,
    ),
    rateLimitPerIpPerHour: parseInt(
      process.env.OTP_RATE_LIMIT_IP_PER_HOUR ?? '10',
      10,
    ),
    fixedCode: process.env.OTP_FIXED_CODE,
    usePhoneSuffix: process.env.OTP_USE_PHONE_SUFFIX === 'true',
  },
  turnstile: {
    secretKey: process.env.TURNSTILE_SECRET_KEY,
    siteKey: process.env.TURNSTILE_SITE_KEY,
    enabled: process.env.TURNSTILE_ENABLED === 'true',
  },
  superAdmin: {
    phones: (process.env.SUPER_ADMIN_PHONES ?? '')
      .split(',')
      .map((phone) => phone.trim())
      .filter(Boolean),
  },
});
