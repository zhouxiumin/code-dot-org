# Chef integration test suite for cdo-ruby-2.2 cookbook.
require 'minitest/autorun'

describe 'ruby 2.2' do
  it 'installed correct versions' do
    refute_nil `ruby -v`.match('ruby 2.2')
    refute_nil `gem -v`.match('2.4.8')
    refute_nil `bundler -v`.match('1.10.6')
  end
end

describe 'ruby 2.0' do
  it 'removed old version' do
    refute File.exist?('/usr/bin/ruby2.0')
    refute File.exist?('/usr/bin/gem2.0')
  end
end
