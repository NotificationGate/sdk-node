/**
 * Options for constructing the NotificationGate client.
 */
export interface ClientOptions {
  /** Base URL for the API. Defaults to https://api.notificationgate.com */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30000. */
  timeout?: number;
}

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------

export interface SendEmailRequest {
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

export interface SendEmailResponse {
  /** Unique email ID assigned by NotificationGate. */
  id: string;
  /** Current status of the email (e.g. 'queued', 'sent'). */
  status: string;
  /** AWS SES message ID. */
  ses_message_id: string;
}

export interface Email {
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

export interface ListEmailsParams {
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

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ---------------------------------------------------------------------------
// Domains
// ---------------------------------------------------------------------------

export interface AddDomainRequest {
  /** The domain to add (e.g. 'mail.example.com'). */
  domain: string;
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

export interface Domain {
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

export interface DomainListResponse {
  domains: Domain[];
}

// ---------------------------------------------------------------------------
// Suppressions
// ---------------------------------------------------------------------------

export interface Suppression {
  email: string;
  /** Reason for suppression: 'bounce' or 'complaint'. */
  reason: string;
  created_at: string;
}

export interface ListSuppressionsParams {
  /** Search by email address substring. */
  search?: string;
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

export interface RegisterWebhookRequest {
  /** HTTPS URL to deliver webhook events to. */
  url: string;
}

export interface Webhook {
  url: string;
  /** Signing secret. Only returned on first registration. */
  secret?: string;
}

export interface WebhookLog {
  id: string;
  event_type: string;
  status_code: number;
  created_at: string;
  next_retry_at?: string;
}

export interface ListWebhookLogsParams {
  limit?: number;
  offset?: number;
}
