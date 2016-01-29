include_recipe 'cdo-ruby::brightbox'
gem_package 'rake'

# git is required for using git repos with bundler
apt_package 'git'

gem_package 'bundler' do
  action :upgrade
  version node['cdo-ruby']['bundler_version']
end
