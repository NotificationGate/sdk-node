import { APIError, RateLimitError } from './errors.js';

const SDK_VERSION = '0.1.0';
const DEFAULT_BASE_URL = 'https://notificationgate.com/api';
const DEFAULT_TIMEOUT_MS = 30_000;

export interface HttpClientOptions {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

/**
 * Low-level HTTP transport for the NotificationGate API.
 * Handles auth headers, error parsing, and typed responses.
 * Not intended for direct use — use the resource services instead.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(options: HttpClientOptions) {
    // Strip trailing slash to prevent double-slash paths (pitfall 5)
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  }

  private buildHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': `notificationgate-node/${SDK_VERSION}`,
    };
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      // 204 No Content — return empty object cast as T
      if (response.status === 204) {
        return undefined as unknown as T;
      }
      return response.json() as Promise<T>;
    }

    // Parse error body
    let errorCode = 'internal_error';
    let errorMessage = `HTTP ${response.status}`;

    try {
      const body = await response.json() as { error?: string; message?: string };
      if (body.error) errorCode = body.error;
      if (body.message) errorMessage = body.message;
    } catch {
      // Could not parse JSON — use default message
    }

    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
      throw new RateLimitError(errorMessage, Number.isNaN(retryAfter) ? undefined : retryAfter);
    }

    throw new APIError(response.status, errorCode, errorMessage);
  }

  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: controller.signal,
      });
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timer);
    }
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timer);
    }
  }

  async delete(path: string): Promise<void> {
    const url = this.buildUrl(path);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.buildHeaders(),
        signal: controller.signal,
      });
      await this.handleResponse<void>(response);
    } finally {
      clearTimeout(timer);
    }
  }
}
