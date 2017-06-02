# Rack middleware that whitelists cookies and headers based on path-based cache behaviors.
# Behaviors are defined in http cache config.
require_relative '../../../cookbooks/cdo-varnish/libraries/helpers'
require 'active_support/core_ext/hash/slice'
require 'active_support/core_ext/numeric/time'
require 'cdo/rack/response'
require 'cdo/aws/cloudfront'
require 'cdo/../../dashboard/app/helpers/proxy_helper'

module Rack
  module Whitelist
    # Downstream middleware filters out unwanted HTTP request headers and cookies,
    # and extracts cookies into HTTP headers before the request reaches the cache.
    class Downstream
      attr_reader :config
      attr_accessor :response

      def initialize(app, config)
        @app = app
        @config = config
      end

      include ProxyHelper

      # stub #expires_in called by ProxyHelper
      def expires_in(max_age, public: true)
        response.max_age = max_age
        response.private = !public
      end

      # stub #send_data called by ProxyHelper
      def send_data(data, *_)
        data
      end

      def call(env)
        return [403, {}, ['Unsupported method.']] unless AWS::CloudFront::ALLOWED_METHODS.include?(env['REQUEST_METHOD'].upcase)
        request = Rack::Request.new(env)
        path = request.path
        behavior = behavior_for_path((config[:behaviors] + [config[:default]]), path)

        # Use ProxyHelper to proxy third-party resources.
        if behavior[:proxy] && !%w(pegasus dashboard).include?(behavior[:proxy])
          self.response = Rack::Cache::Response.new(200, {}, [])
          path.gsub!(/^\/(?=\*.)/, '')
          response.body = render_proxied_url(
            "http://#{behavior[:proxy]}/#{path}",
            allowed_content_types: nil,
            allowed_hostname_suffixes: nil,
            expiry_time: 1.hour.to_i,
            infer_content_type: true
          )
          return response.to_a
        end

        # Filter whitelisted request headers.
        headers = behavior[:headers]
        REMOVED_HEADERS.each do |remove_header|
          name, value = remove_header.split ':'
          next if headers.include? name
          http_header = "HTTP_#{name.upcase.tr('-', '_')}"
          if value.nil?
            env.delete http_header
          else
            env[http_header] = value
          end
        end

        cookies = behavior[:cookies]
        case cookies
          when 'all'
            # Pass all cookies.
            @app.call(env)
          when 'none'
            # Strip all cookies
            env.delete 'HTTP_COOKIE'
            status, headers, body = @app.call(env)
            headers.delete 'Set-Cookie'
            [status, headers, body]
          else
            # Strip all request cookies not in whitelist.
            # Extract whitelisted cookies to X-COOKIE-* request headers.
            request_cookies = request.cookies
            request_cookies.slice!(*cookies)
            cookie_str = request_cookies.map do |key, value|
              env_key = "HTTP_X_COOKIE_#{key.upcase.tr('-', '_')}"
              env[env_key] = value
              Rack::Utils.escape(key) + '=' + Rack::Utils.escape(value)
            end.join('; ') + ';'
            env['HTTP_COOKIE'] = cookie_str
            @app.call(env)
        end
      end
    end

    # Upstream middleware adds Vary headers to the HTTP response
    # before the response reaches the cache.
    class Upstream
      attr_reader :config
      def initialize(app, config)
        @app = app
        @config = config
      end

      def call(env)
        request = Rack::Request.new(env)
        path     = request.path
        behavior = behavior_for_path((config[:behaviors] + [config[:default]]), path)

        status, headers, body = @app.call(env)
        response = Rack::Response.new(body, status, headers)

        behavior[:headers].each do |header|
          response.add_header('Vary', header)
        end
        response.add_header('Vary', 'Host')

        cookies = behavior[:cookies]
        if cookies == 'all'
          response.add_header 'Vary', 'Cookie'
        elsif cookies != 'none'
          # Add "Vary: X-COOKIE-*" to the response for each whitelisted cookie.
          request_cookies = request.cookies
          request_cookies.slice!(*cookies)
          request_cookies.keys.each do |key|
            response.add_header 'Vary', "X-COOKIE-#{key.tr('_', '-')}"
          end
        end
        response.finish
      end
    end
  end
end
