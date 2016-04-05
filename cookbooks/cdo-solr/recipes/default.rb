#
# Cookbook Name:: cdo-solr
# Recipe:: default
#
# Ref: https://cwiki.apache.org/confluence/display/solr/Taking+Solr+to+Production

version = node['cdo-solr']['version']
filename = "solr-#{version}.tgz"
cache = Chef::Config[:file_cache_path]
archive = "#{cache}/#{filename}"
remote_file archive do
  source "http://apache.mesi.com.ar/lucene/solr/#{version}/solr-#{version}.tgz"
end

execute 'extract solr install script' do
  command "tar xf #{filename} solr-#{version}/bin/install_solr_service.sh --strip-components=2"
  cwd cache
  creates "#{cache}/install_solr_service.sh"
end

execute 'install solr' do
  command "./install_solr_service.sh #{filename}"
  cwd cache
  creates "/opt/solr-#{version}"
end
