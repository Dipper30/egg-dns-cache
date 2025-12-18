'use strict';

const dnscache = require('dnscache');

module.exports = app => {
  const config = app.config.dnscache;

  // Initialize DNS cache with configuration
  const dnsCache = dnscache({
    enable: config.enable !== false,
    ttl: config.ttl || 300, // Default 5 minutes
    cachesize: config.cachesize || 1000,
  });

  // Only hijack if enabled
  if (config.enable !== false) {
    app.beforeStart(async () => {
      app.coreLogger.info('[egg-dnscache] Initializing DNS cache...');

      // Hijack app.httpclient
      if (app.httpclient) {
        const originalRequest = app.httpclient.request.bind(app.httpclient);
        app.httpclient.request = function(...args) {
          // DNS cache is already applied globally via dnscache module
          return originalRequest(...args);
        };
        app.coreLogger.info('[egg-dnscache] app.httpclient hijacked successfully');
      }

      // Hijack app.fetch (if available)
      if (app.fetch) {
        const originalFetch = app.fetch.bind(app);
        app.fetch = function(...args) {
          // DNS cache is already applied globally via dnscache module
          return originalFetch(...args);
        };
        app.coreLogger.info('[egg-dnscache] app.fetch hijacked successfully');
      }

      app.coreLogger.info('[egg-dnscache] DNS cache initialized with ttl=%d, cachesize=%d',
        config.ttl || 300,
        config.cachesize || 1000
      );
    });

    // Expose DNS cache instance for manual operations if needed
    app.dnsCache = dnsCache;
  }
};
