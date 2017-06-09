require 'timeout'
require 'digest/md5'
require 'active_job'
require 'active_support/core_ext/module/attribute_accessors'
require 'active_support/core_ext/numeric/bytes'
require 'active_support/core_ext/numeric/time'
require 'cdo/shared_cache'
require 'image_size'
require 'image_optim'
require 'open3'

# Optimizes content on-the-fly based on provided content-type.
# If the process takes longer than specified timeout, the original data will be returned
# and the optimization will finish asynchronously.
module Cdo
  class Optimizer
    MIME_TYPES = {
      image: %w[
        image/gif
        image/jpeg
        image/png
        image/svg+xml
      ],
      html: %w[
        text/html
      ]
    }.freeze

    # Don't optimize images larger than this threshold.
    IMAGE_OPTIM_PIXEL_MAX = 2.megabytes

    # Since optimization steps can take a long time,
    # cache results in shared cache to avoid duplicate work.
    mattr_accessor :cache do
      CDO.shared_cache
    end

    # Set timeout to non-zero to wait the specified number of seconds for the
    # optimization to finish, before returning nil.
    # Default no timeout.
    mattr_accessor(:timeout) {0}

    # @param data [String] input content
    # @param content_type [String] content type
    # @return [String] optimized content (or nil if optimization is pending)
    def self.optimize(data, content_type, path)
      optimize_type = MIME_TYPES.find do |_, types|
        types.any?{|type| content_type.include?(type)}
      end || raise("Invalid Content-Type: #{content_type}")
      optimize_type = optimize_type.first

      Timeout.timeout(timeout) do
        if optimize_type == :image
          # Skip image optimization if image is too big.
          pixels = ImageSize.new(data).size.inject(&:*) rescue 0
          if pixels > DCDO.get('image_optim_pixel_max', IMAGE_OPTIM_PIXEL_MAX)
            return data
          end
        end

        cache_key = cache_key(data, optimize_type)
        result = cache.read(cache_key)
        OptimizeJob.perform_later(data, optimize_type.to_s, path) if result.nil?
        raise Timeout::Error if !result && timeout.zero?
        sleep SLEEP_INTERVAL until (result = cache.read(cache_key))
        result
      end
    rescue Timeout::Error
      # Optimization is still pending after timeout.
      nil
    end

    SLEEP_INTERVAL = 0.1

    # Increment OPTIMIZE_VERSION to change the cache key.
    OPTIMIZE_VERSION = {
      image: 2,
      html: 1
    }

    def self.cache_key(data, type)
      digest = Digest::MD5.new
      digest << data
      digest << File.read(OptimizeJob::HTML_MINIFIER_CONFIG) if type == :html
      "optimize-#{type}-#{OPTIMIZE_VERSION[type]}-#{digest.hexdigest}"
    end
  end

  # ActiveJob that optimizes an image using ImageOptim, writing the result to cache.
  class OptimizeJob < ActiveJob::Base
    HTML_MINIFIER_CONFIG = dashboard_dir('config/html-minifier.json')
    IMAGE_OPTIM = ImageOptim.new(
      config_paths: dashboard_dir('config/image_optim.yml'),
      cache_dir: dashboard_dir('tmp/cache/image_optim')
    )

    logger.level = Logger::WARN

    def perform(data, optimize_type, path)
      cache = Optimizer.cache
      cache_key = Optimizer.cache_key(data, optimize_type.to_sym)
      cache.fetch(cache_key) do
        # Write `false` to cache to prevent concurrent image optimizations.
        cache.write(cache_key, false, expires_in: 10.minutes)
        method("optimize_#{optimize_type}").call(data, path) || data
      end
    rescue => e
      # Log error and return original content.
      Honeybadger.notify(e,
        context: {
          path: path,
          key: cache_key
        }
      )
      cache.write(cache_key, data) if cache && cache_key
      data
    end

    def optimize_image(data, _)
      IMAGE_OPTIM.optimize_image_data(data) || data
    end

    def optimize_html(data, path)
      cmd = "critical #{path} -m -i -d -w 1920 -h 1200 --ignore '@font-face'"
      out, err, status = Open3.capture3(cmd)
      raise err unless status != 0 || err.nil? || err.empty?
      cmd = "html-minifier --config-file #{HTML_MINIFIER_CONFIG}"
      out, err, status = Open3.capture3(cmd, stdin_data: out)
      raise err unless status != 0 || err.nil? || err.empty?
      out
    end
  end
end
