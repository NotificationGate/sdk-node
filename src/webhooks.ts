import type { HttpClient } from './client.js';
import type {
  RegisterWebhookRequest,
  Webhook,
  WebhookLog,
  PaginatedResponse,
  ListWebhookLogsParams,
} from './types.js';

/**
 * Webhooks resource — register, inspect, and manage webhook delivery.
 */
export class Webhooks {
  constructor(private readonly client: HttpClient) {}

  /**
   * Register (or update) the webhook endpoint URL.
   * POST /v1/webhooks
   *
   * The signing secret is only returned on the first registration.
   */
  async register(req: RegisterWebhookRequest): Promise<Webhook> {
    return this.client.post<Webhook>('/v1/webhooks', req);
  }

  /**
   * Get the current webhook configuration.
   * GET /v1/webhooks
   */
  async get(): Promise<Webhook> {
    return this.client.get<Webhook>('/v1/webhooks');
  }

  /**
   * Delete the webhook configuration.
   * DELETE /v1/webhooks
   */
  async delete(): Promise<void> {
    return this.client.delete('/v1/webhooks');
  }

  /**
   * List webhook delivery logs with optional pagination.
   * GET /v1/webhooks/logs
   */
  async listLogs(params?: ListWebhookLogsParams): Promise<PaginatedResponse<WebhookLog>> {
    return this.client.get<PaginatedResponse<WebhookLog>>('/v1/webhooks/logs', params as Record<string, string | number | boolean | undefined>);
  }
}
