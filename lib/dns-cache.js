'use strict';

const dns = require('dns');

/**
 * DNS Cache wrapper for manual operations
 */
class DNSCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 300000; // Default 5 minutes in milliseconds
    this.cachesize = options.cachesize || 1000;
  }

  /**
   * Lookup DNS and cache result
   * @param {string} hostname - The hostname to lookup
   * @return {Promise<string>} The resolved IP address
   */
  async lookup(hostname) {
    // Check cache first
    const cached = this.cache.get(hostname);
    if (cached && Date.now() < cached.expiry) {
      return cached.address;
    }

    // Perform DNS lookup
    return new Promise((resolve, reject) => {
      dns.lookup(hostname, (err, address) => {
        if (err) {
          reject(err);
          return;
        }

        // Store in cache
        this.set(hostname, address);
        resolve(address);
      });
    });
  }

  /**
   * Set cache entry
   * @param {string} hostname - The hostname to cache
   * @param {string} address - The resolved IP address
   */
  set(hostname, address) {
    // Check cache size limit
    if (this.cache.size >= this.cachesize) {
      // Remove oldest entry (ES2015+ Map maintains insertion order)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(hostname, {
      address,
      expiry: Date.now() + this.ttl,
    });
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cachesize,
      ttl: this.ttl,
    };
  }
}

module.exports = DNSCache;
