interface HttpClientOptions {
    baseUrl: string;
    apiKey: string;
    timeout: number;
}
/**
 * Low-level HTTP transport for the NotificationGate API.
 * Handles auth headers, error parsing, and typed responses.
 * Not intended for direct use — use the resource services instead.
 */
declare class HttpClient {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly timeout;
    constructor(options: HttpClientOptions);
    private buildHeaders;
    private buildUrl;
    private handleResponse;
    get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T>;
    post<T>(path: string, body: unknown): Promise<T>;
    delete(path: string): Promise<void>;
}

/**
 * Options for constructing the NotificationGate client.
 */
interface ClientOptions {
    /** Base URL for the API. Defaults to https://api.notificationgate.com */
    baseUrl?: string;
    /** Request timeout in milliseconds. Defaults to 30000. */
    timeout?: number;
}
interface SendEmailRequest {
    /** Sender email address (must be from a verified domain). */
    from: string;
    /** Recipient email address. */
    to: string;
    /** Email subject line. */
    subject: string;
    /** HTML body. At least one of html or text is required. */
    html?: string;
    /** Plain text body. At least one of html or text is required. */
    text?: string;
    /** Sending stream: 'transactional', 'otp', or 'marketing'. */
    stream: string;
}
interface SendEmailResponse {
    /** Unique email ID assigned by NotificationGate. */
    id: string;
    /** Current status of the email (e.g. 'queued', 'sent'). */
    status: string;
    /** AWS SES message ID. */
    ses_message_id: string;
}
interface Email {
    id: string;
    tenant_id: string;
    from: string;
    to: string;
    subject: string;
    status: string;
    stream: string;
    ses_message_id: string;
    created_at: string;
    updated_at: string;
}
interface ListEmailsParams {
    /** Filter by sending stream. */
    stream?: string;
    /** Filter by status. */
    status?: string;
    /** ISO 8601 date lower bound (inclusive). */
    date_from?: string;
    /** ISO 8601 date upper bound (inclusive). */
    date_to?: string;
    /** Filter by recipient email address. */
    recipient?: string;
    /** Maximum number of results. Default 20, max 100. */
    limit?: number;
    /** Number of results to skip for pagination. */
    offset?: number;
}
interface PaginatedResponse<T> {
    data: T[];
    total: number;
    limit: number;
    offset: number;
}
interface AddDomainRequest {
    /** The domain to add (e.g. 'mail.example.com'). */
    domain: string;
}
interface DnsRecord {
    type: string;
    name: string;
    value: string;
}
interface Domain {
    id: string;
    domain: string;
    /** Verification status: 'pending', 'verified', 'failed'. */
    status: string;
    /** DKIM signing status reported by SES. */
    dkim_status: string;
    dns_records?: DnsRecord[];
    created_at: string;
    verified_at?: string;
}
interface DomainListResponse {
    domains: Domain[];
}
interface Suppression {
    email: string;
    /** Reason for suppression: 'bounce' or 'complaint'. */
    reason: string;
    created_at: string;
}
interface ListSuppressionsParams {
    /** Search by email address substring. */
    search?: string;
    limit?: number;
    offset?: number;
}
interface RegisterWebhookRequest {
    /** HTTPS URL to deliver webhook events to. */
    url: string;
}
interface Webhook {
    url: string;
    /** Signing secret. Only returned on first registration. */
    secret?: string;
}
interface WebhookLog {
    id: string;
    event_type: string;
    status_code: number;
    created_at: string;
    next_retry_at?: string;
}
interface ListWebhookLogsParams {
    limit?: number;
    offset?: number;
}

/**
 * Emails resource — send, retrieve, and list emails.
 */
declare class Emails {
    private readonly client;
    constructor(client: HttpClient);
    /**
     * Send an email.
     * POST /v1/emails
     */
    send(req: SendEmailRequest): Promise<SendEmailResponse>;
    /**
     * Get a single email by ID.
     * GET /v1/emails/:id
     */
    get(id: string): Promise<Email>;
    /**
     * List emails with optional filters and pagination.
     * GET /v1/emails
     */
    list(params?: ListEmailsParams): Promise<PaginatedResponse<Email>>;
}

/**
 * Domains resource — add, verify, and manage sending domains.
 */
declare class Domains {
    private readonly client;
    constructor(client: HttpClient);
    /**
     * Add a new domain for verification.
     * POST /v1/domains
     */
    add(req: AddDomainRequest): Promise<Domain>;
    /**
     * Get a domain by ID.
     * GET /v1/domains/:id
     */
    get(id: string): Promise<Domain>;
    /**
     * List all domains for the account.
     * GET /v1/domains
     */
    list(): Promise<Domain[]>;
    /**
     * Check DKIM verification status for a domain.
     * GET /v1/domains/:id/verify
     */
    verify(id: string): Promise<Domain>;
    /**
     * Remove a domain from the account.
     * DELETE /v1/domains/:id
     */
    remove(id: string): Promise<void>;
}

/**
 * Suppressions resource — view and manage the suppression list.
 */
declare class Suppressions {
    private readonly client;
    constructor(client: HttpClient);
    /**
     * List suppressed email addresses with optional search and pagination.
     * GET /v1/suppressions
     */
    list(params?: ListSuppressionsParams): Promise<PaginatedResponse<Suppression>>;
    /**
     * Remove an email address from the suppression list.
     * DELETE /v1/suppressions/:email
     *
     * Note: The email is URL-encoded to handle + and @ characters correctly (pitfall 4).
     */
    remove(email: string): Promise<void>;
}

/**
 * Webhooks resource — register, inspect, and manage webhook delivery.
 */
declare class Webhooks {
    private readonly client;
    constructor(client: HttpClient);
    /**
     * Register (or update) the webhook endpoint URL.
     * POST /v1/webhooks
     *
     * The signing secret is only returned on the first registration.
     */
    register(req: RegisterWebhookRequest): Promise<Webhook>;
    /**
     * Get the current webhook configuration.
     * GET /v1/webhooks
     */
    get(): Promise<Webhook>;
    /**
     * Delete the webhook configuration.
     * DELETE /v1/webhooks
     */
    delete(): Promise<void>;
    /**
     * List webhook delivery logs with optional pagination.
     * GET /v1/webhooks/logs
     */
    listLogs(params?: ListWebhookLogsParams): Promise<PaginatedResponse<WebhookLog>>;
}

/**
 * Base error class for all NotificationGate SDK errors.
 */
declare class NotificationGateError extends Error {
    constructor(message: string);
}
/**
 * Thrown when the API returns a non-2xx response.
 * Contains the HTTP status code, machine-readable error code, and human-readable message.
 */
declare class APIError extends NotificationGateError {
    /** HTTP status code (e.g. 400, 404, 422). */
    readonly status: number;
    /** Machine-readable error code from the API (e.g. 'validation_error', 'not_found'). */
    readonly code: string;
    constructor(status: number, code: string, message: string);
}
/**
 * Thrown when the API returns HTTP 429 Too Many Requests.
 * Includes `retryAfter` seconds parsed from the Retry-After response header.
 */
declare class RateLimitError extends APIError {
    /** Number of seconds to wait before retrying, if the Retry-After header was present. */
    readonly retryAfter?: number;
    constructor(message: string, retryAfter?: number);
}

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
declare class NotificationGate {
    private readonly httpClient;
    /** Access email sending and retrieval methods. */
    readonly emails: Emails;
    /** Access domain management methods. */
    readonly domains: Domains;
    /** Access suppression list methods. */
    readonly suppressions: Suppressions;
    /** Access webhook registration and log methods. */
    readonly webhooks: Webhooks;
    constructor(apiKey: string, options?: ClientOptions);
}

export { APIError, type AddDomainRequest, type ClientOptions, type DnsRecord, type Domain, type DomainListResponse, Domains, type Email, Emails, type ListEmailsParams, type ListSuppressionsParams, type ListWebhookLogsParams, NotificationGate, NotificationGateError, type PaginatedResponse, RateLimitError, type RegisterWebhookRequest, type SendEmailRequest, type SendEmailResponse, type Suppression, Suppressions, type Webhook, type WebhookLog, Webhooks };
