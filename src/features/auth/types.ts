/**
 * Possible error codes that can be thrown by auth operations
 */
export type AuthErrorCode =
  | "invalid-credentials"
  | "email-already-in-use"
  | "network"
  | "unknown";

/**
 * Custom error class for authentication-related errors
 */
export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(getErrorMessage(code));
    this.name = "AuthError";
  }
}

/**
 * Get a human-readable error message for each error code
 */
function getErrorMessage(code: AuthErrorCode): string {
  switch (code) {
    case "invalid-credentials":
      return "Invalid email or password";
    case "email-already-in-use":
      return "An account already exists with this email";
    case "network":
      return "Network error occurred. Please check your connection";
    case "unknown":
      return "An unexpected error occurred";
  }
}
