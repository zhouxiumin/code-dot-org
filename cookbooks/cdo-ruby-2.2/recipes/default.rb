# Workaround for mojolingo/brightbox-ruby-cookbook#5
gem_package 'rubygems-bundler' do
  action :nothing
end
include_recipe 'brightbox-ruby'
# Ensure proper symlinks are set
%w(ruby gem).each{|alt| execute "update-alternatives --force --auto #{alt}" }

# Upgrade Bundler
gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby-2.2']['bundler_version']
end
