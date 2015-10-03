# Updates/installs AWS command-line tools using updated repository.

apt_repository 'ubuntu-trusty-proposed' do
  uri        'http://archive.ubuntu.com/ubuntu'
  distribution 'trusty-proposed'
  components %w(universe)
end

%w(awscli python3-botocore).each do |pkg|
  apt_package pkg do
    action :purge
    notifies :run, 'execute[apt-get autoremove]', :immediately
  end
end

apt_package 'awscli' do
  default_release 'trusty-proposed'
end

directory "/home/#{node[:current_user]}/.aws"

template "/home/#{node[:current_user]}/.aws/config" do
  source 'config.erb'
  user node[:current_user]
  group node[:current_user]
end
