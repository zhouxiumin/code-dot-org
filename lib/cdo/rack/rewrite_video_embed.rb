# Rewrite youtube iframe embeds to our fallback-enabled video player.
require 'cdo/rack/process_html'

module Rack
  class RewriteVideoEmbed < ProcessHtml

    def initialize(app)
      super(
          app,
          xpath: %w(youtube youtubeeducation).map{|x| "//iframe[@src[contains(.,'//www.#{x}.com/embed')]]"}.join(' | ')
      ) do |nodes|
        nodes.each{|node|process(node)}
      end
    end

    private

    def process(node)
      node['src'] = process_url(node['src']) if node['src']
    end

    def process_url(src)
      src.sub(/(http:|https:)?\/\/www\.(youtube|youtubeeducation)\.com\/embed/, CDO.studio_url('videos/embed'))
    end
  end
end
