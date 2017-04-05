require 'aws-sdk'
require 'sprockets/cache'
require 'sprockets/encoding_utils'

module Sprockets
  class Cache
    # Basic Sprockets cache store over S3.
    #
    # Individual S3 requests are too high-latency for each cache entry to use its own S3 object.
    # Instead, load the entire cache from a single S3 object at startup,
    # and flush the cache back to S3 after all Sprockets processing has completed.
    #
    # Assign the instance to the Environment#cache, e.g.:
    #
    #     environment.cache = Sprockets::Cache::S3Store.new('my-s3bucket', 'sprockets-assets')
    class S3Store < MemoryStore

      attr_reader :bucket, :key, :s3, :logger

      # Initialize the cache store.
      #
      # @param [String] bucket S3 bucket name
      # @param [String] key S3 object key prefix
      def initialize(bucket, key = 'sprockets')
        super(100000)
        @s3 = Aws::S3::Client.new
        @bucket = bucket
        @key = key
        @logger = Logger.new(STDOUT)
        @logger.level = Logger::INFO
      end

      # Write the Sprockets cache back to S3 object if dirty.
      def flush
        return unless @dirty
        logger.info 'Flushing cache..'
        s3.put_object(
          bucket: bucket,
          key: key,
          body: EncodingUtils.deflate(Marshal.dump(@cache))
        )
        logger.info 'Flushed cache to S3'
        @dirty = false
      end

      def get(key)
        unless @cache_loaded
          @cache_loaded = true
          load_cache
        end
        super(key)
      end

      def set(key, value)
        unless @cache[key] === value
          @dirty = true
          logger.debug "Value changed: #{key}"
        end
        super(key, value)
      end

      private

      # Load the Sprockets cache from S3 object, if available.
      def load_cache
        logger.info 'Loading Sprockets cache from S3..'
        @dirty = false
        @cache = EncodingUtils.unmarshaled_deflated(
          s3.get_object(bucket: bucket, key: key).
            body.read.force_encoding(Encoding::BINARY)
        )
        logger.info "Loaded cache: #{self.inspect}"
      rescue Aws::S3::Errors::NoSuchKey
        logger.info 'Cache not found'
        # ignored
      rescue Exception => e
        logger.warn "#{self.class}[#{bucket}/#{key}] could not be unmarshaled: " +
          "#{e.class}: #{e.message}"
      end
    end
  end
end
