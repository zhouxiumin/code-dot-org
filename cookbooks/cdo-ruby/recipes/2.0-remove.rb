# Uninstall Ruby 2.0.

require 'etc'

package %w(ruby2.0-dev ruby2.0 rake) do
  action :purge
  notifies :run, 'apt-get autoremove', :immediately
end

# Remove manually-installed symlinks.
%w(ruby irb rdoc erb gem).each do |ruby_link|
  link "/usr/bin/#{ruby_link}" do
    to "/usr/bin/#{ruby_link}2.0"
    action :nothing
    subscribes :delete, 'apt_package[ruby2.0]', :immediately
  end
end

# Clean up old local RubyGems folder.
directory "/home/#{Etc.getlogin}/.gem" do
  recursive true
  action :nothing
  subscribes :delete, 'apt_package[ruby2.0]', :immediately
end
