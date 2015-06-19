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

      puts `viddl-rb #{url} -s #{dir} -q 640:360:mp4`
      file = Dir.glob("#{dir}/*").first
      if File.extname(file) != '.mp4'
        puts 'Error: video not available in correct format'
      else
        filename = AWS::S3.upload_to_bucket(VIDEO_BUCKET, "youtube/#{id}.mp4", File.open(file), access: :public_read, no_random: true, content_type: 'video/mp4')
        puts "https://#{VIDEO_BUCKET}/#{filename}"
        thumbnail_file = "https://i.ytimg.com/vi/#{id}/0.jpg"
        thumbnail_filename = AWS::S3.upload_to_bucket(VIDEO_BUCKET, "youtube/#{id}.jpg", open(thumbnail_file), access: :public_read, no_random: true)
        puts "https://#{VIDEO_BUCKET}/#{thumbnail_filename}"
      end
    end
  end
end
