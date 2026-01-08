'use strict';

const { Agent } = require('undici');
const dns = require('node:dns');
const { isIP } = require('node:net');

class IllegalAddressError extends Error {
  constructor(hostname, ip, family) {
    const message = 'illegal address';
    super(message);
    this.name = this.constructor.name;
    this.hostname = hostname;
    this.ip = ip;
    this.family = family;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BaseAgent extends Agent {
  constructor(options) {
    super(options);
    this._opaqueLocalStorage = options.opaqueLocalStorage;
  }

  dispatch(options, handler) {
    if (this._opaqueLocalStorage) {
      const opaque = this._opaqueLocalStorage.getStore();
      if (opaque) {
        handler.opaque = opaque;
      }
    }
    return super.dispatch(options, handler);
  }
}

class HttpAgent extends BaseAgent {
  constructor(options) {
    /* eslint node/prefer-promises/dns: off*/
    const { lookup = dns.lookup, ...baseOpts } = options;
    const lookupFunction = (hostname, dnsOptions, callback) => {
      lookup(hostname, dnsOptions, (err, ...args) => {
        // address will be array on Node.js >= 20
        const address = args[0];
        const family = args[1];
        if (err) return callback(err, address, family);
        if (options.checkAddress) {
          // dnsOptions.all set to default on Node.js >= 20, dns.lookup will return address array object
          if (typeof address === 'string') {
            if (!options.checkAddress(address, family, hostname)) {
              err = new IllegalAddressError(hostname, address, family);
            }
          } else if (Array.isArray(address)) {
            for (const addr of address) {
              if (!options.checkAddress(addr.address, addr.family, hostname)) {
                err = new IllegalAddressError(hostname, addr.address, addr.family);
                break;
              }
            }
          }
        }
        callback(err, address, family);
      });
    };
    super({
      ...baseOpts,
      connect: { ...options.connect, lookup: lookupFunction, allowH2: options.allowH2 },
    });
    this._checkAddress = options.checkAddress;
  }

  dispatch(options, handler) {
    if (this._checkAddress && options.origin) {
      const originUrl = typeof options.origin === 'string' ? new URL(options.origin) : options.origin;
      let hostname = originUrl.hostname;
      // [2001:db8:2de::e13] => 2001:db8:2de::e13
      if (hostname.startsWith('[') && hostname.endsWith(']')) {
        hostname = hostname.substring(1, hostname.length - 1);
      }
      const family = isIP(hostname);
      if (family === 4 || family === 6) {
        // if request hostname is ip, custom lookup won't execute
        if (!this._checkAddress(hostname, family, hostname)) {
          throw new IllegalAddressError(hostname, hostname, family);
        }
      }
    }
    return super.dispatch(options, handler);
  }
}

module.exports = {
  BaseAgent,
  HttpAgent,
  IllegalAddressError,
};
