require 'rmagick'
require 'active_support/core_ext/module/attribute_accessors'
require 'active_support/cache'

module Cdo
  module Graphics

    # Since image manipulation can take a while, memoize results in cache to avoid duplicate work.
    mattr_accessor :cache do
      (defined?(Rails) && Rails.cache) ||
        ActiveSupport::Cache::FileStore.new(dashboard_dir('tmp', 'cache'))
    end

    MAX_DIMENSION = 2880
    IMAGE_EXTENSIONS = %w(.png .jpeg .jpg .gif)

    # Load an image file and return manipulated image contents.
    # @param path [String] absolute path to image file
    # @param mode [Symbol] operation mode (:fill, :fit or :resize)
    # @param width [Integer] target image width
    # @param height [Integer] target image height
    # @param format [String] output image format
    # @param scale [Float] scale width/height by factor
    # @return [String] Manipulated image data blob
    def self.load_manipulated_image(path, mode, width, height, format, scale = nil)
      image = Magick::Image.read(path).first

      # If only one dimension provided, assume a square
      height ||= width
      width ||= height

      # If both dimensions are nil, assume the original image dimension
      width ||= image.columns
      height ||= image.rows

      if scale
        width *= scale
        height *= scale
      end

      width = [MAX_DIMENSION, width].min
      height = [MAX_DIMENSION, height].min

      case mode
        when :fill
          image.resize_to_fill!(width, height)
        when :fit
          image.resize_to_fit!(width, height)
        when :resize
          image.resize!(width, height)
        else
          nil
      end

      image.format = format
      image.to_blob
    ensure
      image && image.destroy!
    end

    # Returns the first image file
    def self.resolve_image(dirs, path)
      dirs.product(IMAGE_EXTENSIONS).map do |dir, ext|
        File.join(dir, "#{path}#{ext}")
      end.find(&File.method(:file?))
    end

    # Locate an image on the filesystem based on the given path info.
    def self.locate_image(path, dirs, language=nil)
      path_ext = File.extname(path).downcase

      path_base = File.basename(path, path_ext)
      path_dir = File.dirname(path)

      mode = :resize
      width = nil
      height = nil

      # Extract image path and manipulation options from request path info.
      if (m = path_dir.match /^(?<basedir>.*)\/(?<mode>fit-|fill-)?(?<width>\d*)x?(?<height>\d*)(\/(?<dir>.*))?$/m)
        mode = m[:mode][0..-2].to_sym unless m[:mode].nil_or_empty?
        width = m[:width].to_i unless m[:width].nil_or_empty?
        height = m[:height].to_i unless m[:height].nil_or_empty?
        path_dir = File.join(m[:basedir].to_s, m[:dir].to_s)
      end

      # Assume we are returning the same resolution as we're reading.
      retina_in = retina_out = path_base[-3..-1] == '_2x'

      image_file = nil
      if language
        image_file = resolve_image dirs, File.join(language, path_dir, path_base)
      end
      image_file ||= resolve_image dirs, File.join(path_dir, path_base)
      unless image_file
        # Didn't find a match at this resolution, look for a match at the other resolution.
        if retina_out
          path_base = path_base[0...-3]
          retina_in = false
        else
          path_base += '_2x'
          retina_in = true
        end
        image_file = resolve_image dirs, File.join(path_dir, path_base)
      end

      [
        image_file,
        mode,
        width,
        height,
        retina_in,
        retina_out
      ]
    end

    def self.process_image(path, ext_names, dirs, language=nil)
      path_ext = File.extname(path).downcase
      return nil unless ext_names.include?(path_ext)
      image_file,
        mode,
        width,
        height,
        retina_in,
        retina_out = locate_image(path, dirs, language)
      return nil unless image_file # No match at any resolution.

      # Found a valid image file based on the path info.
      image_format = path_ext[1..-1]
      manipulated = width || height

      output = {
        last_modified: File.mtime(image_file),
        content_type: image_format.to_sym,
      }

      if (retina_out || !retina_in) &&
        !manipulated &&
        File.extname(image_file) == path_ext

        # No [useful] modifications to make, return the original.
        return output.merge(file: image_file)
      end

      scale = 1
      if manipulated
        # Manipulated images always specify non-retina sizes in the manipulation string.
        scale = 2 if retina_out
      else
        # Retina sources need to be downsampled for non-retina output.
        scale = 0.5 if retina_in && !retina_out
      end

      # Memoize image manipulation based on file contents and arguments.
      args = [image_file, mode, width, height, image_format, scale]
      cache_key = [
        'load_manipulated_image',
        Digest::MD5.file(image_file).hexdigest
      ].concat(args)
      image = cache.fetch(cache_key) do
        load_manipulated_image(*args)
      end

      output.merge(content: image)
    end

    def self.digest_path(path, dirs)
      locate = Cdo::Graphics.locate_image(path, dirs)
      return path unless (image_file = locate.shift)
      digest = Digest::MD5.file(image_file).hexdigest
      "#{path}-#{digest}"
    end
  end
end
