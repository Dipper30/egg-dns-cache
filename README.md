# egg-dnscache

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-dnscache.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-dnscache
[download-image]: https://img.shields.io/npm/dm/egg-dnscache.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-dnscache

Egg.js plugin: enable DNS Cache for http request and fetch.

## Features

- 🚀 Automatically hijacks `app.httpclient` and `app.fetch` to enable DNS caching
- ⚡ Reduces DNS lookup time for repeated requests
- 🔧 Configurable TTL (Time To Live) and cache size
- 💪 Uses the battle-tested [dnscache](https://www.npmjs.com/package/dnscache) library
- 📊 Provides cache statistics and manual cache operations

## Installation

```bash
$ npm i egg-dnscache --save
```

## Usage

### Enable Plugin

```js
// config/plugin.js
exports.dnscache = {
  enable: true,
  package: 'egg-dnscache',
};
```

### Configuration

```js
// config/config.default.js
exports.dnscache = {
  enable: true,        // Enable DNS cache, default: true
  ttl: 300,           // Time to live in seconds, default: 300 (5 minutes)
  cachesize: 1000,    // Maximum cache entries, default: 1000
};
```

## How It Works

This plugin automatically hijacks the following Egg.js methods:
- `app.httpclient.request()` - All HTTP requests made through httpclient will use DNS cache
- `app.fetch()` - All fetch requests will use DNS cache

The DNS cache is applied transparently, so you don't need to change any existing code.

## Example

```js
// app/controller/home.js
class HomeController extends Controller {
  async index() {
    const { ctx, app } = this;
    
    // This request will use DNS cache automatically
    const result = await app.httpclient.request('https://api.example.com/data');
    
    // This fetch will also use DNS cache automatically
    const data = await app.fetch('https://api.example.com/users');
    
    ctx.body = result.data;
  }
}
```

## Advanced Usage

### Access DNS Cache Instance

The plugin exposes the DNS cache instance on `app.dnsCache`:

```js
// Get cache statistics
const stats = app.dnsCache.getStats();
console.log(stats); // { size: 10, maxSize: 1000, ttl: 300000 }

// Clear cache manually
app.dnsCache.clear();

// Lookup DNS manually
const address = await app.dnsCache.lookup('example.com');
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enable | Boolean | true | Enable or disable DNS caching |
| ttl | Number | 300 | Time to live for DNS cache entries in seconds |
| cachesize | Number | 1000 | Maximum number of cached DNS entries |

## Performance Benefits

DNS lookups can take 20-120ms per request. With DNS caching:
- First request to a domain: Normal DNS lookup time
- Subsequent requests: < 1ms (cache hit)
- Reduces latency for applications making frequent requests to the same domains

## License

[MIT](LICENSE)
