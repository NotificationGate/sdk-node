/**
 * Base error class for all NotificationGate SDK errors.
 */
export class NotificationGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationGateError';
    // Maintain proper prototype chain in transpiled code
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns a non-2xx response.
 * Contains the HTTP status code, machine-readable error code, and human-readable message.
 */
export class APIError extends NotificationGateError {
  /** HTTP status code (e.g. 400, 404, 422). */
  readonly status: number;
  /** Machine-readable error code from the API (e.g. 'validation_error', 'not_found'). */
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the API returns HTTP 429 Too Many Requests.
 * Includes `retryAfter` seconds parsed from the Retry-After response header.
 */
export class RateLimitError extends APIError {
  /** Number of seconds to wait before retrying, if the Retry-After header was present. */
  readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(429, 'rate_limit_exceeded', message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
