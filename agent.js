'use strict';

const dnsResolver = require('./lib/index');

module.exports = agent => {
  if (agent.config.dnsResolver) dnsResolver(agent);
};
