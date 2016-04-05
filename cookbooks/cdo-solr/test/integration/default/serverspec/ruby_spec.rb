require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) { should match match }
  end
end

describe service('solr') do
  it { should be_enabled }
  it { should be_running }
end

cmd '/opt/solr/bin/solr -version', '5.5.0'
# Ensure solr API is working and core has been created
describe command('curl -sSL http://localhost:8983/solr/admin/cores?action=STATUS&core=collection1&wt=json') do
  its(:stdout) { should match 'instanceDir'}
end
