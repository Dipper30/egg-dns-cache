'use strict';

const DnsResolver = require('./dns_resolver');
const { BaseAgent, HttpAgent } = require('./agent/index');

module.exports = app => {
  app.addSingleton('dnsResolver', createClient);
};

function createClient(config, app) {
  // config 是单个 client 的配置（来自 config.dnsResolver.client 或 clients[*]）
  if (!config || config.enable !== true) {
    return null;
  }
  const useDNSResolver = config.mode !== 'lookup';
  const client = new DnsResolver({
    useResolver: useDNSResolver,
    servers: config.dnsServers,
    max: config.maxCacheLength || 1000,
    dnsCacheLookupInterval: config.lookupInterval || 10000,
    addressRotation: config.addressRotation !== false,
  });
  const useHttpClientNext = app.config.httpclient?.useHttpClientNext || app.config?.httpclient?.allowH2;
  if (useHttpClientNext) {
    let customDispatcher;
    const originalDispatcher = app.httpclient.getDispatcher();
    const clientOptions = {
      lookup: client.getLookupFunction(),
      checkAddress: app.config?.security?.ssrf?.checkAddress,
      connect: config.httpclient?.connect || {},
      allowH2: app.config?.httpclient?.allowH2 || false,
    };
    // 创建自定义 dispatcher，使用 DNS 缓存的 lookup 函数
    // Agent 是 undici.Agent，它接受 connect 选项中的 lookup
    if (clientOptions.lookup || clientOptions.checkAddress) {
      customDispatcher = new HttpAgent({
        lookup: clientOptions.lookup,
        checkAddress: clientOptions.checkAddress,
        connect: clientOptions.connect,
        allowH2: clientOptions.allowH2,
      });
    } else if (clientOptions?.connect) {
      customDispatcher = new BaseAgent({
        connect: clientOptions.connect,
        allowH2: clientOptions.allowH2,
      });
    } else if (clientOptions?.allowH2) {
      // Support HTTP2
      customDispatcher = new BaseAgent({
        allowH2: clientOptions.allowH2,
      });
    }
    app.httpclient.setDispatcher(customDispatcher);

    const originalRequest = app.httpclient.request;
    app.httpclient.request = (url, args = {}) => {
      // 如果单个请求禁用 DNS 缓存，使用默认行为（不设置 dispatcher）
      if (args.enableDNSCache === false) {
        // 临时移除 dispatcher，使用默认
        app.httpclient.setDispatcher(originalDispatcher);
        const result = originalRequest.call(app.httpclient, url, args);
        app.httpclient.setDispatcher(customDispatcher);
        return result;
      }
      return originalRequest.call(app.httpclient, url, args);
    };
  } else {
    const lookup = client.getLookupFunction();
    const originalRequest = app.httpclient.request;
    app.httpclient.request = (url, args = {}) => {
      // 如果单个请求禁用 DNS 缓存，使用默认行为（不设置 dispatcher）
      if (args.enableDNSCache !== false) {
        args.lookup = lookup;
      }
      return originalRequest.call(app.httpclient, url, args);
    };
  }

  app.beforeStart(async () => {
    app.coreLogger.info('[egg-dns-cache] enabled');
  });

  return client;
}
