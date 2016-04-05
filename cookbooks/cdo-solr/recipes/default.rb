#
# Cookbook Name:: cdo-solr
# Recipe:: default
#
# Ref: https://cwiki.apache.org/confluence/display/solr/Taking+Solr+to+Production
include_recipe 'cdo-java-7'
apt_package 'unzip'
apt_package 'curl'

mirror = "http://mirrors.sonic.net/apache"

version = node['cdo-solr']['version']
filename = "solr-#{version}.tgz"
cache = Chef::Config[:file_cache_path]
archive = "#{cache}/#{filename}"
solr_install_dir = "/opt/solr-#{version}"

remote_file archive do
  source "#{mirror}/lucene/solr/#{version}/#{filename}"
  checksum node['cdo-solr']['sha256']
  not_if {File.directory? solr_install_dir }
end

install_file = 'install_solr_service.sh'
execute 'extract solr install script' do
  command "tar xf #{filename} solr-#{version}/bin/#{install_file} --strip-components=2"
  cwd cache
  action :nothing
  subscribes :run, "remote_file[#{archive}]", :immediately
end

execute 'install solr' do
  command "./#{install_file} #{filename} -f"
  cwd cache
  creates solr_install_dir
end

core_name = 'collection1'
execute 'create solr core' do
  command "/opt/solr/bin/solr create -c #{core_name} -n data_driven_schema_configs"
  user 'solr'
  group 'solr'
  only_if do
    require 'open-uri'
    require 'json'
    json = JSON.parse(open("http://localhost:8983/solr/admin/cores?action=STATUS&core=#{core_name}&wt=json").read) rescue false
    json && json['status'][core_name].empty?
  end
end

template '/var/solr/data/collection1/conf/solrconfig.xml' do
  source 'solrconfig.xml.erb'
  user 'solr'
  group 'solr'
  notifies :reload, 'service[solr]'
end

service 'solr' do
  supports restart: true, reload: true, status: true
  reload_command "curl 'http://localhost:8983/solr/admin/cores?action=RELOAD&core=#{core_name}'"
  action [:enable, :start]
end
