# Rack middleware for rewriting dynamic image references to pre-baked, content-addressable digest references.

require 'cdo/rack/process_html'
require 'dynamic_config/dcdo'

module Rack
  class RewriteImageDigests < ProcessHtml
    attr_reader :request

    def initialize(app)
      super(
          app,
          xpath: %w(/images /shared/images).map {|x| "//img[@src[starts-with(.,'#{x}')]]"}.join(' | ')
      ) do |nodes, env|
        @request = Request.new(env)
        nodes.each do |node|
          process(node)
        end
      end
    end

    private

    def dirs(src)
      if src.start_with?('/shared/images')
        return [deploy_dir]
      end
      @dirs = []
      if request.site == 'hourofcode.com'
        @dirs << [File.join(request.site, 'i18n')]
      end
      @dirs << request.site
      @dirs.map{|dir| pegasus_dir('sites.v3', dir, 'public')}
    end

    def process(node)
      node['src'] = process_url(node['src']) if node['src']
    end

    # Rewrite the image URL with the digested path.
    def process_url(src)
      Cdo::Graphics.digest_path(src, dirs(src))
    end
  end
end
