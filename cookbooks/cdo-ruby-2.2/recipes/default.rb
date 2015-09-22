# Workaround for mojolingo/brightbox-ruby-cookbook#5
if node['cdo-ruby']['rubygems_version'].to_f >= 2.2
  node.default['brightbox-ruby']['gems'] = %w(bundler rake)
  gem_package 'rubygems-bundler' do
    action :nothing
  end
end

# Ensure proper symlinks are set
if node['cdo-ruby']['version'].to_f > 2
  include_recipe 'cdo-ruby-2.0::remove'
  node.default['brightbox-ruby']['version'] = node['cdo-ruby']['version']
  node.default['brightbox-ruby']['rubygems_version'] = node['cdo-ruby']['rubygems_version']
  include_recipe 'brightbox-ruby'
  %w(ruby gem).each{|alt| execute "update-alternatives --force --auto #{alt}" }
else
  include_recipe 'cdo-ruby-2.0'
end

# Upgrade Bundler
gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby']['bundler_version']
end
