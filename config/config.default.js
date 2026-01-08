'use strict';

/**
   * The option for DNS resolver (independent feature)
   * DNS resolver provides DNS caching and resolution capabilities that can be used independently
   * or integrated with httpclient/fetch. This feature improves performance by caching DNS lookups
   * and supports both dns.lookup and dns.resolve modes with address rotation.
   *
   * @member Config#dnsResolver
   * @property {Boolean} enable - Enable DNS resolver feature, default is false.
   * @property {'lookup' | 'resolve' | undefined} mode - Use dns.lookup or dns.resolve, default is 'resolve'.
   *   - lookup: Use dns.lookup mode (old behavior), respects system DNS configuration and /etc/hosts, but does not support ttl.
   *   - resolve: Use dns.resolve mode (new feature), queries DNS servers directly, ttl supported.
   *     Note: When using resolve mode, /etc/hosts is not respected. You may need to implement custom logic
   *     if you want to include /etc/hosts resolution.
   * @property {Array<String>} servers - Custom DNS nameservers for dns.resolve mode, e.g. ['8.8.8.8', '1.1.1.1'].
   *   Only effective when useResolver is true. If not set, uses system default DNS servers.
   * @property {Number} maxCacheLength - Maximum number of DNS cache entries, default is 1000.
   *   Uses LRU (Least Recently Used) algorithm to evict old entries when cache is full.
   * @property {Boolean} lookupInterval - Only works when mode is 'lookup'. DNS cache lookup interval in milliseconds, default is 10000 (10 seconds).
   * @property {Boolean} addressRotation - Enable round-robin address rotation when multiple IP addresses
   *   are returned for a hostname, default is true. Helps distribute load across multiple servers.
   */

exports.dnsResolver = {
  client: {
    enable: true,
    mode: 'resolve',
    maxCacheLength: 1000,
    lookupInterval: 10000,
    addressRotation: true,
  },
};
