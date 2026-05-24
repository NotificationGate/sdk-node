import { HttpClient } from './client.js';
import { Emails } from './emails.js';
import { Domains } from './domains.js';
import { Suppressions } from './suppressions.js';
import { Webhooks } from './webhooks.js';
import type { ClientOptions } from './types.js';

export { NotificationGateError, APIError, RateLimitError } from './errors.js';
export { Emails } from './emails.js';
export { Domains } from './domains.js';
export { Suppressions } from './suppressions.js';
export { Webhooks } from './webhooks.js';
export type * from './types.js';

const DEFAULT_BASE_URL = 'https://api.notificationgate.com';

/**
 * The main NotificationGate client.
 *
 * @example
 * ```typescript
 * import { NotificationGate } from 'notificationgate';
 * const ng = new NotificationGate('ng_your_api_key');
 * const email = await ng.emails.send({ ... });
 * ```
 */
export class NotificationGate {
  private readonly httpClient: HttpClient;

  /** Access email sending and retrieval methods. */
  readonly emails: Emails;
  /** Access domain management methods. */
  readonly domains: Domains;
  /** Access suppression list methods. */
  readonly suppressions: Suppressions;
  /** Access webhook registration and log methods. */
  readonly webhooks: Webhooks;

  constructor(apiKey: string, options?: ClientOptions) {
    this.httpClient = new HttpClient({
      baseUrl: options?.baseUrl ?? DEFAULT_BASE_URL,
      apiKey,
      timeout: options?.timeout ?? 30_000,
    });

    this.emails = new Emails(this.httpClient);
    this.domains = new Domains(this.httpClient);
    this.suppressions = new Suppressions(this.httpClient);
    this.webhooks = new Webhooks(this.httpClient);
  }
}
