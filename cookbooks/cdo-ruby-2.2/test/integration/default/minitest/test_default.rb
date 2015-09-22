# Chef integration test suite for cdo-ruby-2.2 cookbook.

refute_nil `ruby -v`.match('ruby 2.2')
refute_nil `gem -v`.match('2.4.8')
refute_nil `bundler -v`.match('1.10.6')
