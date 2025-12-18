'use strict';

const assert = require('assert');
const mock = require('egg-mock');

describe('test/plugin.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/test-app',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should load dnscache plugin', () => {
    const plugin = app.plugins.dnscache;
    assert(plugin);
  });

  it('should have dnsCache instance', () => {
    assert(app.dnsCache);
    assert(typeof app.dnsCache.lookup === 'function');
    assert(typeof app.dnsCache.clear === 'function');
    assert(typeof app.dnsCache.getStats === 'function');
  });

  it('should hijack app.httpclient', () => {
    assert(app.httpclient);
    assert(typeof app.httpclient.request === 'function');
  });

  it('should get cache stats', () => {
    const stats = app.dnsCache.getStats();
    assert(stats);
    assert(typeof stats.size === 'number');
    assert(typeof stats.maxSize === 'number');
    assert(typeof stats.ttl === 'number');
    assert(stats.maxSize === 1000);
  });

  it('should perform DNS lookup', async () => {
    const address = await app.dnsCache.lookup('localhost');
    assert(address);
  });

  it('should clear cache', () => {
    app.dnsCache.clear();
    const stats = app.dnsCache.getStats();
    assert(stats.size === 0);
  });
});
