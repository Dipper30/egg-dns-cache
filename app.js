'use strict';

const dnscache = require('dnscache');
const DNSCache = require('./lib/dns-cache');

module.exports = app => {
  const config = app.config.dnscache;

  // Only hijack if enabled
  if (config.enable !== false) {
    app.beforeStart(async () => {
      app.coreLogger.info('[egg-dnscache] Initializing DNS cache...');

      // Initialize DNS cache with configuration
      dnscache({
        enable: true,
        ttl: config.ttl || 300, // Default 5 minutes
        cachesize: config.cachesize || 1000,
      });

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
    app.dnsCache = new DNSCache({
      ttl: (config.ttl || 300) * 1000, // Convert to milliseconds
      cachesize: config.cachesize || 1000,
    });
  }
};
