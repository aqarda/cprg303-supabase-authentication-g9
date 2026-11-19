import { isAuthError, isAuthRetryableFetchError } from '@supabase/supabase-js';

export const NETWORK_ERROR_MESSAGE = 'Unable to connect. Check your internet connection and try again.';
export const SERVER_ERROR_MESSAGE = 'The server is not responding. Please try again later.';
export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

// Must match the password rules in Supabase and in the sign-up form
export const WEAK_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include a letter and a number.';

// Supabase error codes and the message shown to the user
const messages: Record<string, string> = {
  invalid_credentials: 'Incorrect email or password.',
  weak_password: WEAK_PASSWORD_MESSAGE,
  user_already_exists: 'An account with this email already exists.',
  email_exists: 'An account with this email already exists.',
  email_not_confirmed: 'Please confirm your email before signing in.',
  email_address_invalid: 'Please enter a valid email address.',
  over_request_rate_limit: 'Too many attempts. Please wait a minute and try again.',
  over_email_send_rate_limit: 'Too many attempts. Please wait a minute and try again.',
};

export function getAuthErrorMessage(error: unknown): string {
  // Status 0 means there is no connection. Status 500 or higher means a server problem.
  if (isAuthRetryableFetchError(error)) {
    return error.status >= 500 ? SERVER_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE;
  }

  // React Native throws "Network request failed" when the phone is offline
  if (error instanceof TypeError && error.message.toLowerCase().includes('network')) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (isAuthError(error)) {
    if (error.code && messages[error.code]) {
      return messages[error.code];
    }
    if (error.status === 429) {
      return messages.over_request_rate_limit;
    }
  }

  return GENERIC_ERROR_MESSAGE;
}
