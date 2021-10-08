const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  // Your existing module.exports
  env: {
    mapBoxApi: "pk.eyJ1IjoiamF3YXN0cmVzcyIsImEiOiJjanBjc3cwOWIxNzVrM3Fta2R1NGZmdW12In0.ra1FXvu_TM9MmhiL7VZuqA",
    backend: "https://nms-poc-api.devlabs.id",
    APPNAME: "boiler next js",
    APPKEY: "sukasukawajaappkeynyaaapaanygpentingsusahdihack",
  }
};

const SentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  tracesSampleRate: 0.6, // Set to 1.0 to sample all traces
};

module.exports = moduleExports;
