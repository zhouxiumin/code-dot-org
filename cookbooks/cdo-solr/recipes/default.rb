#
# Cookbook Name:: cdo-solr
# Recipe:: default
#
# Ref: https://cwiki.apache.org/confluence/display/solr/Taking+Solr+to+Production
include_recipe 'cdo-java-7'
apt_package 'unzip'

mirror = "http://mirrors.sonic.net/apache"

version = node['cdo-solr']['version']
filename = "solr-#{version}.tgz"
cache = Chef::Config[:file_cache_path]
archive = "#{cache}/#{filename}"
remote_file archive do
  source "#{mirror}/lucene/solr/#{version}/#{filename}"
  checksum node['cdo-solr']['sha256']
end

install_file = 'install_solr_service.sh'
execute 'extract solr install script' do
  command "tar xf #{filename} solr-#{version}/bin/#{install_file} --strip-components=2"
  cwd cache
  creates "#{cache}/#{install_file}"
end

solr_install_dir = "/opt/solr-#{version}"
execute 'install solr' do
  command "./#{install_file} #{filename} -f"
  cwd cache
  creates solr_install_dir
end

template "#{solr_install_dir}/example/files/conf/solrconfig.xml" do
  source 'solrconfig.xml.erb'
  user 'solr'
  group 'solr'
end
