gem_package 'rubygems-bundler' do
  action :nothing
end

include_recipe 'brightbox-ruby'

# Remove old ruby
%w(ruby2.0-dev ruby2.0).each do |ruby|
  apt_package ruby do
    action :purge
  end
end

%w(ruby gem).each{|alt| execute "update-alternatives --force --auto #{alt}" }

gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby-2.2']['bundler_version']
end

execute 'gem update --system' do
  command "gem update -q --system '#{node['brightbox-ruby']['rubygems_version']}'"
  environment 'REALLY_GEM_UPDATE_SYSTEM' => '1'
  not_if "which gem > /dev/null && gem --version | grep -q '#{node['brightbox-ruby']['rubygems_version']}'"
end
