export const SECURITY = {
  JWT_EXPIRATION: '7d',
  JWT_EXPIRATION_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  BCRYPT_ROUNDS: 10,
} as const;
