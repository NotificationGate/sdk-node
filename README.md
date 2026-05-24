# notificationgate

Official Node.js/TypeScript SDK for [NotificationGate](https://notificationgate.com) — developer-first transactional email on AWS SES.

## Installation

```bash
npm install notificationgate
```

Requires **Node.js 18+** (uses native `fetch`). No runtime dependencies.

## Quick Start

```typescript
import { NotificationGate } from 'notificationgate';

const ng = new NotificationGate('ng_your_api_key');

const email = await ng.emails.send({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello!',
  html: '<p>Welcome aboard</p>',
  stream: 'transactional',
});

console.log(email.id);
```

## Available Methods

### `ng.emails`

| Method | Description |
|--------|-------------|
| `send(req)` | Send a transactional, OTP, or marketing email |
| `get(id)` | Retrieve a single email by ID |
| `list(params?)` | List emails with filters (stream, status, date range, recipient) |

### `ng.domains`

| Method | Description |
|--------|-------------|
| `add(req)` | Add a domain for DKIM verification |
| `get(id)` | Get a domain by ID |
| `list()` | List all domains |
| `verify(id)` | Check DKIM verification status |
| `remove(id)` | Remove a domain |

### `ng.suppressions`

| Method | Description |
|--------|-------------|
| `list(params?)` | List suppressed addresses (searchable) |
| `remove(email)` | Remove an address from the suppression list |

### `ng.webhooks`

| Method | Description |
|--------|-------------|
| `register(req)` | Register or update the webhook endpoint URL |
| `get()` | Get the current webhook configuration |
| `delete()` | Delete the webhook configuration |
| `listLogs(params?)` | List webhook delivery logs |

## Error Handling

All API errors are thrown as typed error classes:

```typescript
import { NotificationGate, APIError, RateLimitError } from 'notificationgate';

const ng = new NotificationGate('ng_your_api_key');

try {
  await ng.emails.send({ ... });
} catch (err) {
  if (err instanceof RateLimitError) {
    // err.retryAfter — seconds to wait before retrying (if Retry-After header was present)
    console.log(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof APIError) {
    // err.status  — HTTP status code (400, 404, 422, etc.)
    // err.code    — machine-readable code ('validation_error', 'not_found', etc.)
    // err.message — human-readable description
    console.log(`API error ${err.status} [${err.code}]: ${err.message}`);
  } else {
    throw err; // Network error, timeout, etc.
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 400 | Request body failed validation |
| `not_found` | 404 | Resource not found |
| `domain_not_verified` | 422 | Sending domain not verified |
| `address_suppressed` | 422 | Recipient address is suppressed |
| `rate_limit_exceeded` | 429 | Rate limit exceeded |
| `quota_exceeded` | 429 | Monthly email quota exceeded |
| `domain_conflict` | 409 | Domain already exists |
| `invalid_id` | 400 | Invalid UUID format |
| `invalid_email` | 400 | Invalid email address format |
| `internal_error` | 500 | Server-side error |

## Client Options

```typescript
const ng = new NotificationGate('ng_your_api_key', {
  baseUrl: 'https://api.notificationgate.com', // Override for self-hosted or testing
  timeout: 30_000,                              // Request timeout in milliseconds
});
```

## Streams

NotificationGate provides three isolated IP pools. Set `stream` to one of:

| Stream | Use Case |
|--------|----------|
| `transactional` | Order confirmations, receipts, account notifications |
| `otp` | One-time passwords, verification codes |
| `marketing` | Newsletters, promotional emails |

## CommonJS Usage

The SDK ships dual CJS/ESM. For CommonJS environments:

```javascript
const { NotificationGate } = require('notificationgate');
const ng = new NotificationGate('ng_your_api_key');
```

## License

MIT
