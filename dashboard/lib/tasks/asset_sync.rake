namespace :assets do
  desc 'Synchronize assets to S3'
  task sync: :environment do
    require 'cdo/rake_utils'
    # AWS CLI implements an optimized `sync` utility without any Ruby SDK equivalent.
    cmd = "aws s3 sync #{dashboard_dir}/public/assets s3://#{CDO.assets_bucket}/#{rack_env}/assets --acl public-read --cache-control 'max-age=31536000'"
    RakeUtils.system cmd
  end

  task pre_precompile: :environment do
    next unless CDO.sync_assets
    require 'cdo/aws/sprockets_cache_s3store'
    Rails.application.assets.cache = Sprockets::Cache::S3Store.new(
      CDO.assets_bucket,
      "#{rack_env}/sprockets_cache.gz"
    )
  end
end

Rake::Task['assets:precompile'].enhance([:pre_precompile]) do
  application_js_path = dashboard_dir('public', ActionController::Base.helpers.asset_path("application.js"))
  puts "minifying", application_js_path
  uglified = Uglifier.compile(File.read(application_js_path))
  File.write(application_js_path, uglified)
  next unless CDO.sync_assets
  cache = Rails.application.assets.cache.instance_variable_get(:@cache_wrapper).cache
  cache.flush if cache.respond_to?(:flush)
  Rake::Task['assets:sync'].invoke if CDO.sync_assets
end
