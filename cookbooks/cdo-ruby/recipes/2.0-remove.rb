# Uninstall Ruby 2.0.

package %w(ruby2.0-dev ruby2.0 rake) do
  action :purge
  notifies :run, 'execute[apt-get autoremove]', :immediately
end

# Remove manually-installed symlinks.
%w(ruby irb rdoc erb gem).each do |ruby_link|
  link "/usr/bin/#{ruby_link}" do
    to "/usr/bin/#{ruby_link}2.0"
    action :nothing
    subscribes :delete, 'package[ruby2.0-dev, ruby2.0, rake]', :immediately
  end
end

# Clean up old local RubyGems folder.
require 'etc'
directory "/home/#{Etc.getlogin}/.gem" do
  recursive true
  action :nothing
  subscribes :delete, 'package[ruby2.0-dev, ruby2.0, rake]', :immediately
end
