require 'etc'

# Uninstall Ruby 2.0.
%w(ruby2.0-dev ruby2.0 rake).each do |ruby|
  apt_package(ruby) { action :purge }
end

# Remove installed symlinks.
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
