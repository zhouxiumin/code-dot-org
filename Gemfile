source 'https://rubygems.org'
ruby '2.0.0'

# Database adapters
gem 'mysql2', '0.3.13'
gem 'seamless_database_pool', require: false
gem 'redis', '~> 3.1.0'
gem 'dalli', require: false # memcached
gem 'sequel', '~> 4.10.0', require: false

# Third-party service API libraries
gem 'le', '~> 2.2'
gem 'google_drive', '~> 1.0.0', require: false
gem 'google-api-client'
gem 'aws-s3', require: false
gem 'aws-sdk', '~> 2'
gem 'twilio-ruby' # SMS API for send-to-phone feature
gem 'geocoder', require: false
gem 'honeybadger', '~> 1.11.2',  group: [:staging, :production] # error monitoring
gem 'newrelic_rpm', '~> 3.10.0.279', group: [:staging, :production] # perf/error/etc monitoring

# Small utility libraries
gem 'parallel', require: false
gem 'os', require: false
gem 'chronic', '~> 0.10.2', require: false
gem 'user_agent_parser', require: false
gem 'jwt', require: false # JSON Web Token (used by zendesk single signon)
gem 'naturally', require: false # Natural-language sorting
gem 'rerun', '~> 0.10.0', group: :development, require: false # restart program on filesystem changes

# Larger libraries
gem 'nokogiri', '1.6.1', require: false # XML parser
gem 'redcarpet', '~> 3.2.3', require: false # Markdown parser
gem 'rmagick', require: false # ImageMagick image-processing library
gem 'phantomjs', '~> 1.9.7.1', require: false
gem 'i18nema', group: :fast_loc, require: false  # faster i18n backend (activated in fast_localization Rails initializer)
gem 'haml' # .haml HTML template

# Small monkey-patches:
gem 'retryable' # Kernel#retryable - retry code blocks when they throw exceptions
gem 'stringex', '~> 2.5.2' # String#to_ascii

# Rack libraries
gem 'sinatra', '1.4.4', require: false
gem 'rack-contrib', '~> 1.1', require: false
gem 'rack-ssl-enforcer', require: false, group: [:development, :staging, :test, :levelbuilder] # Enforce SSL

# Rack servers
gem 'thin', '~> 1.6.2', group: :development, require: false
gem 'unicorn', '~> 4.8.2', group: [:staging, :test, :levelbuilder, :production], require: false

# Rails-specific gems
group :rails do
  gem 'rails', '4.0.3', require: ['rails', 'action_view', 'active_record']

# Rails Asset Pipeline integrations
  gem 'uglifier', '>= 1.3.0' # Use Uglifier to compress JavaScript assets
  gem 'sass-rails', '~> 4.0.0' # .scss stylesheets
  gem 'jbuilder', '~> 1.2' # .jbuilder JSON template
  gem 'react-rails', '~> 1.0' # .jsx format

# Vendored Rails Asset Pipeline libraries
  gem 'jquery-rails' # jquery and jquery_ujs
  gem 'jquery-ui-rails', '~> 5.0.3'
  gem 'bootstrap-sass', '~> 2.3.2.2'
  gem 'codemirror-rails' # edit code in textarea
  gem 'marked-rails' # js-based md renderer used for levelbuilder md preview
  gem 'videojs_rails'
  gem 'font-awesome-rails'

# Rails authentication and permissions
  gem 'devise'
  gem 'devise_invitable', '~> 1.3.4'
  gem 'cancancan', '~> 1.10'

  gem 'omniauth-facebook'
  gem 'omniauth-google-oauth2'
  gem 'omniauth-windowslive', '~> 0.0.9'
  gem 'omniauth-clever', git: 'https://github.com/code-dot-org/omniauth-clever.git'

# ActiveRecord extensions
  gem 'acts_as_list' # adds acts_as_list class method
  gem 'kaminari' # pagination helper adds #page, #per, #padding
  gem "paranoia", "~> 2.0" # 'delete' model objects by setting a deleted_at column instead of deleting the row
# JSON model serializer for REST APIs
  gem 'active_model_serializers', github: 'rails-api/active_model_serializers', ref: '2962f3f64e7c672bfb5a13a8f739b5db073e5473'

# Misc Rails integration libraries
  gem 'execjs' # JavaScript runtime interface, used by Uglifier and react-rails
  gem 'lograge' # Reduce volume of production logs
  gem 'heroku_rails_deflate' # gzip rails content and static assets
end

# Rails development integrations
group :rails_development, :rails_test do
  gem 'spring' # Preload Rails application in memory for faster startup
  gem 'spring-commands-testunit'

  #gem 'haml-rails' # haml (instead of erb) generators
  gem 'better_errors' # Detailed error page in development
  gem 'quiet_assets' # turns off the Rails asset pipeline log
  gem 'ruby-prof', require: false
end

# Rails unit test integrations
group :rails_development, :rails_test do
  gem 'factory_girl_rails', require: false # Rails Unit test helper
end

# Style checkers
group :development, :staging do
  gem 'rubocop', require: false
  gem 'haml_lint', require: false
end

# unit testing
group :development, :test do
  gem 'simplecov', require: false
  gem 'mocha', require: false
  gem "codeclimate-test-reporter", require: false
  gem 'timecop'
end

# ui testing
group :development, :test do
  gem 'cucumber', require: false
  gem 'selenium-webdriver', require: false
  gem 'chromedriver-helper', '~> 0.0.7', require: false
  gem 'minitest-reporters', require: false
  gem 'eyes_selenium', require: false
  gem 'colorize', require: false
end
