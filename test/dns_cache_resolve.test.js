'use strict';

const mm = require('egg-mock');
const assert = require('assert');

describe('test/dns_cache_resolve.test.js', () => {
  describe('single client', () => {
    let app;
    before(async () => {
      app = mm.app({
        baseDir: 'apps/dns_cache_resolve',
      });
      await app.ready();
    });
    after(() => app.close());
    afterEach(mm.restore);

    it('should query', () => {
      assert(app.dnsResolver);
      assert(app.dnsResolver.getDnsCache());
    });
  });

});
