'use strict';

const dnsResolver = require('./lib/index');

module.exports = app => {
  if (app.config.dnsResolver) dnsResolver(app);
};
