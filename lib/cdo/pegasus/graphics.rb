require 'rmagick'

MAX_DIMENSION = 2880

# Load an image file and return manipulated image contents.
# @param path [String] absolute path to image file
# @param mode [Symbol] operation mode (:fill, :fit or :resize)
# @param width [Integer] target image width
# @param height [Integer] target image height
# @param format [String] output image format
# @param scale [Float] scale width/height by factor
# @return [String] Manipulated image data blob
def load_manipulated_image(path, mode, width, height, format, scale = nil)
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

def process_image(path, ext_names, language=nil, site=nil)
  path_ext = File.extname(path).downcase
  return nil unless ext_names.include?(path_ext)
  image_format = path_ext[1..-1]

  path_base = File.basename(path, path_ext)
  path_dir = File.dirname(path)

  mode = :resize
  width = nil
  height = nil
  manipulated = false

  # Extract image path and manipulation options from request path info.
  if (m = path_dir.match /^(?<basedir>.*)\/(?<mode>fit-|fill-)?(?<width>\d*)x?(?<height>\d*)(\/(?<dir>.*))?$/m)
    mode = m[:mode][0..-2].to_sym unless m[:mode].nil_or_empty?
    width = m[:width].to_i unless m[:width].nil_or_empty?
    height = m[:height].to_i unless m[:height].nil_or_empty?
    manipulated = width || height
    path_dir = File.join(m[:basedir].to_s, m[:dir].to_s)
  end

  # Assume we are returning the same resolution as we're reading.
  retina_in = retina_out = path_base[-3..-1] == '_2x'

  image_file = nil
  if site == 'hourofcode.com'
    image_file = resolve_image File.join(language, path_dir, path_base)
  end
  image_file ||= resolve_image File.join(path_dir, path_base)
  unless image_file
    # Didn't find a match at this resolution, look for a match at the other resolution.
    if retina_out
      path_base = path_base[0...-3]
      retina_in = false
    else
      path_base += '_2x'
      retina_in = true
    end
    image_file = resolve_image File.join(path_dir, path_base)
  end

  return nil unless image_file # No match at any resolution.

  # Found a valid image file based on the path info.
  output = {
    last_modified: File.mtime(image_file),
    content_type: image_format.to_sym,
  }

  if (retina_out || !retina_in) && !manipulated && File.extname(image_file) == path_ext
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

  image = load_manipulated_image(image_file, mode, width, height, image_format, scale)
  output.merge(content: image)
end
