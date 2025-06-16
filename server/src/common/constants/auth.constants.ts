import { SECURITY } from './security.constants';

export const AUTH = {
  COOKIE_NAME: 'access_token',
  COOKIE_OPTIONS: {
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: SECURITY.COOKIE_MAX_AGE,
  },
  JWT_PAYLOAD: {
    ISSUER: 'news-app',
    AUDIENCE: 'news-app-users',
  },
  MESSAGES: {
    REGISTRATION_SUCCESS: 'Registration successful',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_INACTIVE: 'Account is inactive',
    USER_EXISTS: 'Username or email already exists',
    USER_CREATION_FAILED: 'Failed to create user account',
    USER_NOT_FOUND: 'User not found or inactive',
  },
} as const;
