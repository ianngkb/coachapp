import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://5d1f04c28446b5cd41e5ac3abd65c74c@o4510016221216768.ingest.us.sentry.io/4510016344752128",

  _experiments: {
    enableLogs: true,
  },

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});