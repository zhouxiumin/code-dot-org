require 'chefspec'
require 'chefspec/berkshelf'

describe 'cdo-varnish' do
  let :chef_run do
    ChefSpec::SoloRunner.new do |node|
      node.automatic['memory']['total'] = "#{(memory * 1024 * 1024)}kB"
      node.automatic['cdo-apps']['pegasus']['port'] = 80
      node.automatic['cdo-apps']['dashboard']['port'] = 80
    end.converge(described_recipe)
  end
  let(:varnish_suffix) {'G'}
  let(:node) {chef_run.node}
  let(:memory) {64}

  context '64gb' do
    let(:memory) {64}
    it 'sets correct varnish memory' do
      expect(node['cdo-varnish']['storage']).to eq 'malloc,4.0G'
    end
  end

  context '8gb' do
    let(:memory) {8}
    it 'sets correct varnish memory' do
      expect(node['cdo-varnish']['storage']).to eq 'malloc,0.5G'
    end
  end

  it 'generates template' do
    # Ensure only that the Varnish VCL renders based on the
    # current HTTP cache configuration without throwing any error.
    expect(chef_run).to render_file('/etc/varnish/default.vcl').with_content('')
  end
end
