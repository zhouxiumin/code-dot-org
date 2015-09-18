require_relative '../../deployment'
require 'digest'
require 'aws-sdk'
require 'cdo/session'

dashboard_hostname = CDO.canonical_hostname('studio.code.org')
pegasus_hostname = CDO.canonical_hostname('code.org')


# Cloudfront-specific configuration.
CDO.cloudfront = {
  pegasus: {
    aliases: [pegasus_hostname],
    origin: "#{ENV['RACK_ENV']}-pegasus.code.org",
    # IAM server certificate name
    ssl_cert: 'codeorg-cloudfront',
    log: {
      bucket: 'cdo-logs',
      prefix: "#{ENV['RACK_ENV']}-pegasus-cdn"
    }
  },
  dashboard: {
    aliases: [dashboard_hostname],
    origin: "#{ENV['RACK_ENV']}-dashboard.code.org",
    ssl_cert: 'codeorg-cloudfront',
    log: {
      bucket: 'cdo-logs',
      prefix: "#{ENV['RACK_ENV']}-dashboard-cdn"
    }
  }
}

require 'cookbooks/cdo-varnish/libraries/http_cache'
CDO.http_cache = HttpCache.config(Session::KEY, Session::STORAGE_ID)

# Returns a CloudFront DistributionConfig Hash compatible with the AWS SDK for Ruby v2.
# Syntax reference: http://docs.aws.amazon.com/sdkforruby/api/Aws/CloudFront/Types/DistributionConfig.html
def cloudfront_config(cloudfront, config, reference = nil)
  behaviors = config[:behaviors].map do |behavior|
    if behavior[:path].is_a? Array
      behavior[:path].map do |path|
        cache_behavior behavior, path
      end
    else
      cache_behavior behavior, behavior[:path]
    end
  end.flatten

  ssl_cert = cloudfront[:ssl_cert] &&
  {
    aliases: {
      quantity: cloudfront[:aliases].length, # required
      items: cloudfront[:aliases].empty? ? nil : cloudfront[:aliases],
    },
    default_root_object: '',
    origins: {# required
      quantity: 1, # required
      items: [
        {
          id: 'cdo', # required
          domain_name: cloudfront[:origin], # required
          origin_path: '',
          custom_origin_config: {
            http_port: 80, # required
            https_port: 443, # required
            origin_protocol_policy: 'match-viewer', # required, accepts http-only, match-viewer
          },
        },
      ],
    },
    default_cache_behavior: cache_behavior(config[:default]),
    cache_behaviors: {
      quantity: behaviors.length, # required
      items: behaviors.empty? ? nil : behaviors,
    },
    custom_error_responses: {
      quantity: 0 # required
    },
    comment: '', # required
    logging: {
      enabled: !!cloudfront[:log], # required
      include_cookies: false, # required
      bucket: cloudfront[:log] && "#{cloudfront[:log][:bucket]}.s3.amazonaws.com", # required
      prefix: cloudfront[:log] && cloudfront[:log][:prefix], # required
    },
    price_class: 'PriceClass_All', # accepts PriceClass_100, PriceClass_200, PriceClass_All
    enabled: true, # required
    viewer_certificate: cloudfront[:ssl_cert] ? {
      # Lookup IAM Certificate ID from server certificate name
      iam_certificate_id: Aws::IAM::Client.new
        .get_server_certificate(server_certificate_name: cloudfront[:ssl_cert])
        .server_certificate.server_certificate_metadata.server_certificate_id,
      ssl_support_method: 'sni-only', # accepts sni-only, vip
      minimum_protocol_version: 'TLSv1', # accepts SSLv3, TLSv1
      cloud_front_default_certificate: false
    } : {
      cloud_front_default_certificate: true,
      minimum_protocol_version: 'TLSv1' # accepts SSLv3, TLSv1
    },
    restrictions: {
      geo_restriction: {# required
        restriction_type: 'none', # required, accepts blacklist, whitelist, none
        quantity: 0 # required
      },
    },
  }.tap do |cf|
    cf[:caller_reference] = reference || Digest::MD5.hexdigest(Marshal.dump(config)) # required
  end
end

# `config` contains `headers` and `cookies` whitelists.
def cache_behavior(config, path=nil)
  behavior = {# required
    target_origin_id: 'cdo', # required
    forwarded_values: {# required
      query_string: true, # required
      cookies: config[:cookies].is_a?(Array) ? {# required
        forward: 'whitelist', # required, accepts none, whitelist, all
        whitelisted_names: {
          quantity: config[:cookies].length, # required
          items: (config[:cookies].empty? ? nil : config[:cookies]),
        }
      } : {
        forward: config[:cookies]
      },
      headers: {
        quantity: config[:headers].length, # required
        items: config[:headers].empty? ? nil : config[:headers],
      },
    },
    trusted_signers: {# required
      enabled: false, # required
      quantity: 0
    },
    viewer_protocol_policy: 'redirect-to-https', # required, accepts allow-all, https-only, redirect-to-https
    min_ttl: 0, # required
    allowed_methods: {
      quantity: 7, # required
      items: %w(HEAD DELETE POST GET OPTIONS PUT PATCH), # required, accepts GET, HEAD, POST, PUT, PATCH, OPTIONS, DELETE
      cached_methods: {
        quantity: 3, # required
        items: %w(HEAD GET OPTIONS), # required, accepts GET, HEAD, POST, PUT, PATCH, OPTIONS, DELETE
      },
    },
    smooth_streaming: false,
    default_ttl: 0,
    max_ttl: 31536000, # =1 year
  }
  behavior[:path_pattern] = path if path
  behavior
end
