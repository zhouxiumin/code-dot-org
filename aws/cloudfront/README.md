Contains CloudFront provisioning configuration.

CDO environment variables used:

#### `CDO.cloudfront` (`pegasus` and `dashboard`)

- `aliases`: whitelist of domains this distribution will use (`*`-wildcards are allowed, e.g. `*.example.com`).
  CloudFront does not allow the same domain to be used by multiple distributions.
- `origin`: default origin server endpoint. This should point to the load balancer domain.
- `log`: `log.bucket` and `log.prefix` specify where to store CloudFront access logs (or disable if `log` is not provided).
- `ssl_cert`: IAM server certificate name for a SSL certificate previously uploaded to AWS.
  If not provided, the default *.cloudfront.net SSL certificate is used.

#### `CDO.http_cache` (`pegasus` and `dashboard`)

- `behaviors`: Array of behaviors, evaluated in order:
  - `path`: [Path pattern](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesPathPattern)
    to match this behavior against.
    `*`-globs are allowed, e.g. `*.jpg` or `api/*`. `?` matches a single character.
    - `path` can be a String or an Array. If it is an Array, a separate behavior will be generated for each element.
  - `headers`: A whitelist array of HTTP header keys to pass to the origin and include in the cache key.
    To whitelist all headers, pass `['*']`.
    To strip all headers, pass `[]`.
  - `cookies`: A whitelist array of HTTP cookie keys to to pass to the origin and include in the cache key.
    To whitelist all cookies, pass `'all'`.
    To strip all cookies, pass `'none'`.
  - `proxy`: If specified, proxy all requests matching this path to a different origin.
    CloudFront does not support path-rewriting, so e.g., a GET request to `server1.example.com/here/abc` configured with
    the behavior `{path: 'here/*' proxy: 'server2' }` will proxy its request to `server2.example.com/here/abc`.
- `default`: Default behavior if no other path patterns are matched. Uses the same syntax as `behaviors` except `path` is not required.
