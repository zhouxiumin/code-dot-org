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
