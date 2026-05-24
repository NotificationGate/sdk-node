import type { HttpClient } from './client.js';
import type { AddDomainRequest, Domain, DomainListResponse } from './types.js';

/**
 * Domains resource — add, verify, and manage sending domains.
 */
export class Domains {
  constructor(private readonly client: HttpClient) {}

  /**
   * Add a new domain for verification.
   * POST /v1/domains
   */
  async add(req: AddDomainRequest): Promise<Domain> {
    return this.client.post<Domain>('/v1/domains', req);
  }

  /**
   * Get a domain by ID.
   * GET /v1/domains/:id
   */
  async get(id: string): Promise<Domain> {
    return this.client.get<Domain>(`/v1/domains/${id}`);
  }

  /**
   * List all domains for the account.
   * GET /v1/domains
   */
  async list(): Promise<Domain[]> {
    const response = await this.client.get<DomainListResponse>('/v1/domains');
    return response.domains;
  }

  /**
   * Check DKIM verification status for a domain.
   * GET /v1/domains/:id/verify
   */
  async verify(id: string): Promise<Domain> {
    return this.client.get<Domain>(`/v1/domains/${id}/verify`);
  }

  /**
   * Remove a domain from the account.
   * DELETE /v1/domains/:id
   */
  async remove(id: string): Promise<void> {
    return this.client.delete(`/v1/domains/${id}`);
  }
}
