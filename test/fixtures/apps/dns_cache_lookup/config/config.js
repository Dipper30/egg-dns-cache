'use strict';

exports.dnsResolver = {
  client: {
    enable: true,
    mode: 'lookup',
    lookupInterval: 3000,
    addressRotation: true,
  }
};
exports.httpclient = {
  httpAgent: {
    keepAlive: false,
    timeout: 30000,
  },
}
exports.keys = '1';
