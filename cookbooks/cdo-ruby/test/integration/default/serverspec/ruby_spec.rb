require 'serverspec'

# Required by serverspec
set :backend, :exec
describe file('/usr/bin/ruby2.0') do
  it { should exist }
end
describe command('/usr/local/bin/bundler -v') do
  its(:stdout) { should match '1.10.4' }
end
