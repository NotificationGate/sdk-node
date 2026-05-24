import type { HttpClient } from './client.js';
import type {
  SendEmailRequest,
  SendEmailResponse,
  Email,
  ListEmailsParams,
  PaginatedResponse,
} from './types.js';

/**
 * Emails resource — send, retrieve, and list emails.
 */
export class Emails {
  constructor(private readonly client: HttpClient) {}

  /**
   * Send an email.
   * POST /v1/emails
   */
  async send(req: SendEmailRequest): Promise<SendEmailResponse> {
    return this.client.post<SendEmailResponse>('/v1/emails', req);
  }

  /**
   * Get a single email by ID.
   * GET /v1/emails/:id
   */
  async get(id: string): Promise<Email> {
    return this.client.get<Email>(`/v1/emails/${id}`);
  }

  /**
   * List emails with optional filters and pagination.
   * GET /v1/emails
   */
  async list(params?: ListEmailsParams): Promise<PaginatedResponse<Email>> {
    return this.client.get<PaginatedResponse<Email>>('/v1/emails', params as Record<string, string | number | boolean | undefined>);
  }
}
