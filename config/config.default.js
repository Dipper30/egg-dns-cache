'use strict';

/**
 * egg-dnscache default config
 * @member Config#dnscache
 * @property {Boolean} enable - Enable DNS cache, default is true
 * @property {Number} ttl - Time to live for DNS cache entries in seconds, default is 300 (5 minutes)
 * @property {Number} cachesize - Maximum number of cached DNS entries, default is 1000
 */
exports.dnscache = {
  enable: true,
  ttl: 300,
  cachesize: 1000,
};
