import { NotificationGate } from '../src/index.js';

const ng = new NotificationGate('ng_your_api_key');

const email = await ng.emails.send({
  from: 'hello@yourdomain.com',
  to: 'user@example.com',
  subject: 'Hello from NotificationGate!',
  html: '<p>Welcome aboard. Your account is ready.</p>',
  stream: 'transactional',
});

console.log('Sent email ID:', email.id);
