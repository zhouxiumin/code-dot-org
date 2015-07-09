source 'https://rubygems.org'
ruby '2.0.0'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.0.3', require: ['action_view', 'rails', 'active_record']

gem 'sinatra', '1.4.4', require: 'sinatra/base'
gem 'rack-contrib', '~> 1.1'

gem 'mysql2', '0.3.13'
gem 'seamless_database_pool', require: false # 0.2 sec

gem 'le', '~> 2.2'
gem 'os'
gem 'redis', '~> 3.1.0'
gem 'google_drive', '~> 1.0.0', require: false # 0.3 sec
gem 'dalli' # memcached
gem 'parallel'

gem 'google-api-client'

group :development do
  gem 'rerun', '~> 0.10.0', require: false # 0.2 sec
  gem 'shotgun'
  gem 'thin', '~> 1.6.2'
end

group :development, :test do
  # Use debugger
  #gem 'debugger' unless ENV['RM_INFO']
  gem 'haml-rails' # haml (instead of erb) generators
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'ruby-prof', require: false # 0.5 sec
  gem 'quiet_assets'
  gem 'active_record_query_trace'

  # for unit testing
  gem 'factory_girl_rails'
  gem 'simplecov', require: false # 0.1 sec
  gem 'mocha'
  gem "codeclimate-test-reporter", require: false # 0.1 sec
  gem 'timecop'

  # for ui testing
  gem 'cucumber', require: false # 0.2 sec
  gem 'selenium-webdriver', require: false # 0.1 sec
  gem 'rspec'
  gem 'chromedriver-helper', '~> 0.0.7', require: false # 0.1 sec
  gem 'colorize'
  gem 'spring'
  gem 'spring-commands-testunit'
  gem 'minitest-reporters'
  gem 'eyes_selenium', require: false # 0.2 sec
end

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

gem 'unicorn', '~> 4.8.2'

gem 'chronic', '~> 0.10.2'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 4.0.0', require: false # 0.2 sec

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use jquery as the JavaScript library
gem 'jquery-rails'

gem 'phantomjs', '~> 1.9.7.1'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 1.2', require: false # 0.05 sec

# authentication and permissions
gem 'devise', require: false # 0.1 sec
gem 'devise_invitable', '~> 1.3.4', require: false # 0.1 sec
gem 'cancancan', '~> 1.10', require: false # 0.2 sec

gem 'omniauth-facebook', require: false
gem 'omniauth-google-oauth2', require: false
gem 'omniauth-windowslive', '~> 0.0.9', require: false
gem 'omniauth-clever', git: 'https://github.com/code-dot-org/omniauth-clever.git', require: false

gem 'bootstrap-sass', '~> 2.3.2.2', require: false
gem 'haml'

gem 'jquery-ui-rails', '~> 5.0.3', require: false

gem 'nokogiri', '1.6.1', require: false

gem 'highline', '~> 1.6.21', require: false

gem 'honeybadger', '~> 1.11.2',  group: [:staging, :production], require: false # error monitoring

gem 'newrelic_rpm', '~> 3.10.0.279', group: [:staging, :production], require: false # perf/error/etc monitoring

gem 'redcarpet', '~> 3.2.3', require: false

gem 'geocoder', require: false

gem 'rmagick', require: false

gem 'acts_as_list', require: false

gem 'kaminari', require: false # pagination

gem 'stringex', '~> 2.5.2', require: false # Provides String.to_ascii

gem 'naturally', require: false # for sorting string naturally

gem 'videojs_rails', require: false

gem 'retryable', require: false # retry code blocks when they throw exceptions

# Used by a build script.
gem 'execjs', require: false
gem 'therubyracer', :platforms => :ruby, require: false
gem 'i18nema', group: :fast_loc  # faster locale backend (active in dev environment or FAST_LOC=true)

gem 'jwt', require: false # single signon for zendesk

gem 'codemirror-rails', require: false # edit code in textarea
gem 'marked-rails', require: false # js-based md renderer used for levelbuilder md preview

gem 'twilio-ruby', require: false # SMS API for send-to-phone feature
gem 'aws-s3', require: false # 0.3 sec

gem 'font-awesome-rails'
gem 'sequel', '~> 4.10.0' # 0.1 sec
gem 'user_agent_parser'
gem 'heroku_rails_deflate' # gzip rails content and static assets

gem "paranoia", "~> 2.0", require: false # 0.3 sec; 'delete' Rails model objects by setting a deleted_at column instead of deleting the row

gem 'react-rails', '~> 1.0'
# JSON model serializer for REST APIs
gem 'active_model_serializers', github: 'rails-api/active_model_serializers', ref: '2962f3f64e7c672bfb5a13a8f739b5db073e5473'
gem 'aws-sdk', '~> 2', require: false

gem 'rubocop', require: false, group: [:development, :staging]
gem 'haml_lint', require: false, group: [:development, :staging]

# Reduce volume of production logs
gem 'lograge'

# Enforce SSL
gem 'rack-ssl-enforcer', group: [:development, :staging, :test, :levelbuilder]
