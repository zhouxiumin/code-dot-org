include_recipe 'cdo-ruby::brightbox'
gem_package 'rake'

# git is required for using git repos with bundler
apt_package 'git'

gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby']['bundler_version']
end

template "/home/#{node[:current_user]}/.gemrc" do
  source 'gemrc.erb'
  user node[:current_user]
  group node[:current_user]
end
