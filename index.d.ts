import * as dns from "node:dns";

interface DnsResolverOptions {
  useResolver?: boolean;
  max?: number;
  dnsCacheLookupInterval?: number;
  servers?: string[];
  addressRotation?: boolean;
}

interface DnsResolverStats {
  cacheSize: number;
  maxCacheSize: number;
  enableAddressRotation: boolean;
  resolverState: {
    serverCount: number;
  } | null;
}

interface DnsCacheRecord {
  ip: string;
  family: number;
  ttl: number;
  timestamp: number;
  index: number;
}

declare class DnsResolver {
  constructor(options?: DnsResolverOptions);

  /**
   * Get a function compatible with node:dns.lookup signature.
   */
  getLookupFunction(): typeof dns.lookup;

  /**
   * Get the underlying LRU cache instance.
   */
  getDnsCache(): unknown;

  /**
   * Clear DNS cache.
   * @param recreate Whether to recreate the cache instance.
   */
  resetCache(recreate?: boolean): void;

  /**
   * Get a single cache record for a hostname.
   */
  getCacheRecord(hostname: string): DnsCacheRecord | null;
}

interface DnsResolverClientOptions {
  /** Enable DNS resolver feature, default is false. */
  enable?: boolean;
  /**
   * Use dns.lookup or dns.resolve, default is 'resolve'.
   * - lookup: use dns.lookup mode, respects system DNS and /etc/hosts.
   * - resolve: use dns.resolve mode, queries DNS servers directly, ttl supported.
   */
  mode?: "lookup" | "resolve";
  /** Custom DNS nameservers for resolve mode. */
  dnsServers?: string[];
  /** Maximum number of DNS cache entries, default is 1000. */
  maxCacheLength?: number;
  /**
   * Only works when mode is 'lookup'.
   * DNS cache lookup interval in milliseconds, default is 10000.
   */
  lookupInterval?: number;
  /** Enable round-robin address rotation for multiple IPs, default is true. */
  addressRotation?: boolean;
}

interface DnsResolverConfig {
  /** Single client configuration (most common). */
  client?: DnsResolverClientOptions;
  /** Multi-client configuration, keyed by client name. */
  clients?: Record<string, DnsResolverClientOptions>;
}

declare module "egg" {
  interface Application {
    /**
     * DNS resolver singleton instance, created via app.addSingleton('dnsResolver').
     */
    dnsResolver: DnsResolver;
  }

  interface Agent {
    /**
     * DNS resolver singleton on agent side.
     */
    dnsResolver: DnsResolver;
  }

  interface EggAppConfig {
    /** Configuration for egg-dns-cache plugin. */
    dnsResolver: DnsResolverConfig;
  }
}
