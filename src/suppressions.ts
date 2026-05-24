import type { HttpClient } from './client.js';
import type { Suppression, PaginatedResponse, ListSuppressionsParams } from './types.js';

/**
 * Suppressions resource — view and manage the suppression list.
 */
export class Suppressions {
  constructor(private readonly client: HttpClient) {}

  /**
   * List suppressed email addresses with optional search and pagination.
   * GET /v1/suppressions
   */
  async list(params?: ListSuppressionsParams): Promise<PaginatedResponse<Suppression>> {
    return this.client.get<PaginatedResponse<Suppression>>('/v1/suppressions', params as Record<string, string | number | boolean | undefined>);
  }

  /**
   * Remove an email address from the suppression list.
   * DELETE /v1/suppressions/:email
   *
   * Note: The email is URL-encoded to handle + and @ characters correctly (pitfall 4).
   */
  async remove(email: string): Promise<void> {
    // encodeURIComponent encodes + as %2B, preventing it from being decoded as a space
    return this.client.delete(`/v1/suppressions/${encodeURIComponent(email)}`);
  }
}
