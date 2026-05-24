"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  APIError: () => APIError,
  Domains: () => Domains,
  Emails: () => Emails,
  NotificationGate: () => NotificationGate,
  NotificationGateError: () => NotificationGateError,
  RateLimitError: () => RateLimitError,
  Suppressions: () => Suppressions,
  Webhooks: () => Webhooks
});
module.exports = __toCommonJS(index_exports);

// src/errors.ts
var NotificationGateError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "NotificationGateError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var APIError = class extends NotificationGateError {
  /** HTTP status code (e.g. 400, 404, 422). */
  status;
  /** Machine-readable error code from the API (e.g. 'validation_error', 'not_found'). */
  code;
  constructor(status, code, message) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var RateLimitError = class extends APIError {
  /** Number of seconds to wait before retrying, if the Retry-After header was present. */
  retryAfter;
  constructor(message, retryAfter) {
    super(429, "rate_limit_exceeded", message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};

// src/client.ts
var SDK_VERSION = "0.1.0";
var DEFAULT_BASE_URL = "https://api.notificationgate.com";
var DEFAULT_TIMEOUT_MS = 3e4;
var HttpClient = class {
  baseUrl;
  apiKey;
  timeout;
  constructor(options) {
    this.baseUrl = (options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || DEFAULT_TIMEOUT_MS;
  }
  buildHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": `notificationgate-node/${SDK_VERSION}`
    };
  }
  buildUrl(path, params) {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== void 0 && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }
  async handleResponse(response) {
    if (response.ok) {
      if (response.status === 204) {
        return void 0;
      }
      return response.json();
    }
    let errorCode = "internal_error";
    let errorMessage = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body.error) errorCode = body.error;
      if (body.message) errorMessage = body.message;
    } catch {
    }
    if (response.status === 429) {
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : void 0;
      throw new RateLimitError(errorMessage, Number.isNaN(retryAfter) ? void 0 : retryAfter);
    }
    throw new APIError(response.status, errorCode, errorMessage);
  }
  async get(path, params) {
    const url = this.buildUrl(path, params);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.buildHeaders(),
        signal: controller.signal
      });
      return this.handleResponse(response);
    } finally {
      clearTimeout(timer);
    }
  }
  async post(path, body) {
    const url = this.buildUrl(path);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal
      });
      return this.handleResponse(response);
    } finally {
      clearTimeout(timer);
    }
  }
  async delete(path) {
    const url = this.buildUrl(path);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.buildHeaders(),
        signal: controller.signal
      });
      await this.handleResponse(response);
    } finally {
      clearTimeout(timer);
    }
  }
};

// src/emails.ts
var Emails = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /**
   * Send an email.
   * POST /v1/emails
   */
  async send(req) {
    return this.client.post("/v1/emails", req);
  }
  /**
   * Get a single email by ID.
   * GET /v1/emails/:id
   */
  async get(id) {
    return this.client.get(`/v1/emails/${id}`);
  }
  /**
   * List emails with optional filters and pagination.
   * GET /v1/emails
   */
  async list(params) {
    return this.client.get("/v1/emails", params);
  }
};

// src/domains.ts
var Domains = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /**
   * Add a new domain for verification.
   * POST /v1/domains
   */
  async add(req) {
    return this.client.post("/v1/domains", req);
  }
  /**
   * Get a domain by ID.
   * GET /v1/domains/:id
   */
  async get(id) {
    return this.client.get(`/v1/domains/${id}`);
  }
  /**
   * List all domains for the account.
   * GET /v1/domains
   */
  async list() {
    const response = await this.client.get("/v1/domains");
    return response.domains;
  }
  /**
   * Check DKIM verification status for a domain.
   * GET /v1/domains/:id/verify
   */
  async verify(id) {
    return this.client.get(`/v1/domains/${id}/verify`);
  }
  /**
   * Remove a domain from the account.
   * DELETE /v1/domains/:id
   */
  async remove(id) {
    return this.client.delete(`/v1/domains/${id}`);
  }
};

// src/suppressions.ts
var Suppressions = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /**
   * List suppressed email addresses with optional search and pagination.
   * GET /v1/suppressions
   */
  async list(params) {
    return this.client.get("/v1/suppressions", params);
  }
  /**
   * Remove an email address from the suppression list.
   * DELETE /v1/suppressions/:email
   *
   * Note: The email is URL-encoded to handle + and @ characters correctly (pitfall 4).
   */
  async remove(email) {
    return this.client.delete(`/v1/suppressions/${encodeURIComponent(email)}`);
  }
};

// src/webhooks.ts
var Webhooks = class {
  constructor(client) {
    this.client = client;
  }
  client;
  /**
   * Register (or update) the webhook endpoint URL.
   * POST /v1/webhooks
   *
   * The signing secret is only returned on the first registration.
   */
  async register(req) {
    return this.client.post("/v1/webhooks", req);
  }
  /**
   * Get the current webhook configuration.
   * GET /v1/webhooks
   */
  async get() {
    return this.client.get("/v1/webhooks");
  }
  /**
   * Delete the webhook configuration.
   * DELETE /v1/webhooks
   */
  async delete() {
    return this.client.delete("/v1/webhooks");
  }
  /**
   * List webhook delivery logs with optional pagination.
   * GET /v1/webhooks/logs
   */
  async listLogs(params) {
    return this.client.get("/v1/webhooks/logs", params);
  }
};

// src/index.ts
var DEFAULT_BASE_URL2 = "https://api.notificationgate.com";
var NotificationGate = class {
  httpClient;
  /** Access email sending and retrieval methods. */
  emails;
  /** Access domain management methods. */
  domains;
  /** Access suppression list methods. */
  suppressions;
  /** Access webhook registration and log methods. */
  webhooks;
  constructor(apiKey, options) {
    this.httpClient = new HttpClient({
      baseUrl: options?.baseUrl ?? DEFAULT_BASE_URL2,
      apiKey,
      timeout: options?.timeout ?? 3e4
    });
    this.emails = new Emails(this.httpClient);
    this.domains = new Domains(this.httpClient);
    this.suppressions = new Suppressions(this.httpClient);
    this.webhooks = new Webhooks(this.httpClient);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APIError,
  Domains,
  Emails,
  NotificationGate,
  NotificationGateError,
  RateLimitError,
  Suppressions,
  Webhooks
});
//# sourceMappingURL=index.cjs.map