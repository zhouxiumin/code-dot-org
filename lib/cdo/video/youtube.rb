# This class downloads and processes a YouTube video by ID,
# making it available for viewing through Code.org's fallback video player.

# Dependency requirements:
# viddl-rb (`gem install viddl-rb`) - for downloading the video

require 'cdo/aws/s3'
require 'tmpdir'
require 'open-uri'

class Youtube

  VIDEO_BUCKET = 'videos.code.org'

  def self.process(id)
    url = "www.youtube.com/watch?v=#{id}"

    Dir.mktmpdir do |dir|
      # Run viddl-rb, printing output
      cmd = "viddl-rb #{url} -s #{dir} -q 640:360:mp4"
      IO.popen(cmd) { |output| output.each { |line| puts line } }
      file = Dir.glob("#{dir}/*").first
      raise RuntimeError, 'Video not available in correct format' if File.extname(file) != '.mp4'
      video_filename = AWS::S3.upload_to_bucket(VIDEO_BUCKET, "youtube/#{id}.mp4", File.open(file), access: :public_read, no_random: true, content_type: 'video/mp4')
      puts "https://#{VIDEO_BUCKET}/#{video_filename}"
      thumbnail_file = "https://i.ytimg.com/vi/#{id}/0.jpg"
      thumbnail = open(thumbnail_file) || raise(RuntimeError, 'Could not retrieve thumbnail for video')
      thumbnail_filename = AWS::S3.upload_to_bucket(VIDEO_BUCKET, "youtube/#{id}.jpg", thumbnail, access: :public_read, no_random: true)
      puts "https://#{VIDEO_BUCKET}/#{thumbnail_filename}"
    end
  end
end
