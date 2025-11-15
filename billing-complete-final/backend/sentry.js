// backend/sentry.js - optional Sentry integration stub
try {
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: process.env.SENTRY_DSN || '' });
  module.exports = Sentry;
} catch (e) {
  module.exports = null;
}
