require 'timeout'
require 'image_optim'
require 'digest/md5'
require 'active_job'
require 'active_support/core_ext/module/attribute_accessors'
require 'active_support/cache'

# Optimizes content on-the-fly based on provided content-type.
# If the process takes longer than specified timeout, the original data will be returned
# and the optimization will finish asynchronously.
module Cdo
  class Optimizer
    DEFAULT_TIMEOUT = 0.5
    SLEEP_INTERVAL = 0.1

    MIME_TYPES = %w[
      image/gif
      image/jpeg
      image/png
      image/svg+xml
    ].freeze

    # Since optimization steps can take a long time,
    # cache results in persistent storage to avoid duplicate work.
    # Default to Rails.cache if it's a File or MemCache store.
    # Otherwise, create a new FileStore for local use.
    mattr_accessor :cache do
      rails_cache = (defined?(Rails) && Rails.cache)
      if rails_cache.is_a?(ActiveSupport::Cache::FileStore) ||
        rails_cache.is_a?(ActiveSupport::Cache::MemCacheStore)
        rails_cache
      else
        ActiveSupport::Cache::FileStore.new(dashboard_dir('tmp', 'cache'))
      end
    end

    # @param data [String] input content
    # @param content_type [String] content type
    # @param timeout [Numeric] timeout duration in seconds.
    # @return [String] output content (or input content on timeout)
    def self.optimize(data, content_type, timeout=DEFAULT_TIMEOUT)
      Timeout.timeout(timeout) do
        case content_type
          when *MIME_TYPES
            optimize_image(data)
          else
            raise 'Invalid content type'
        end
      end
    rescue Timeout::Error
      # Return `nil` if optimization times out.
      nil
    end

    # Optimizes image content.
    def self.optimize_image(data)
      cache_key = Digest::MD5.hexdigest(data)
      result = cache.read(cache_key)
      OptimizeJob.perform_later(data) if result.nil?
      sleep SLEEP_INTERVAL until (result = cache.read(cache_key))
      result
    end
  end

  # ActiveJob that optimizes an image using ImageOptim, writing the result to cache.
  class OptimizeJob < ActiveJob::Base
    logger.level = Logger::INFO

    IMAGE_OPTIM = ImageOptim.new(
      {
        guetzli: {
          quality: 84,
          allow_lossy: true
        },
        pngquant: {
          allow_lossy: true,
          quality: 50..80
        }
      }
    )

    def perform(data)
      cache_key = Digest::MD5.hexdigest(data)
      cache.fetch(cache_key) do
        # Write `false` to cache to prevent concurrent image optimizations.
        cache.write(cache_key, false)
        begin
          IMAGE_OPTIM.optimize_image_data(data) || data
        rescue => e
          logger.fatal "Error: #{e}\n#{CDO.backtrace e}"
          # Return original un-optimized content if there's an error.
          data
        end
      end
    end
  end
end
