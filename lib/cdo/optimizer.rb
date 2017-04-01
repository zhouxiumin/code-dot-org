require 'timeout'
require 'image_optim'
require 'digest/md5'

# Optimizes content on-the-fly based on provided content-type.
# If the process takes longer than specified timeout, the original data will be returned
# and the optimization will finish asynchronously.
module Cdo
  class Optimizer
    DEFAULT_TIMEOUT = 0.5
    SLEEP_INTERVAL = 0.1

    # @param data [String] input content
    # @param content_type [String] content type
    # @param timeout [Numeric] timeout duration in seconds.
    # @return [String] output content (or input content on timeout)
    def self.optimize(data, content_type, timeout=DEFAULT_TIMEOUT)
      Timeout.timeout(timeout) do
        case content_type
          when *ImageOptim::Railtie::MIME_TYPES
            optimize_image(data)
          else
            raise 'Invalid content type'
        end
      end
    rescue Timeout::Error
      # Return original if optimization times out.
      data
    end

    # Optimizes image content.
    def self.optimize_image(data)
      cache_key = Digest::MD5.hexdigest(data)
      result = Rails.cache.read(cache_key)
      OptimizeJob.perform_later(data) if result.nil?
      sleep SLEEP_INTERVAL until (result = Rails.cache.read(cache_key))
      result
    end
  end

  # ActiveJob that optimizes an image using ImageOptim, writing the result to Rails cache.
  class OptimizeJob < ActiveJob::Base
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
      Rails.cache.fetch(cache_key) do
        Rails.cache.write(cache_key, false) # Prevent concurrent image optimizations.
        IMAGE_OPTIM.optimize_image_data(data) || data
      end
    end
  end
end
