# Chef integration test suite for cdo-ruby-2.2 cookbook.
require 'minitest/autorun'

describe 'ruby' do
  it 'installed correct versions' do
    refute_nil `ruby -v`.match('ruby 2.0')
    refute_nil `gem -v`.match('2.')
    refute_nil `bundler -v`.match('1.10.4')
  end
end
