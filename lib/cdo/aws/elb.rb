require 'aws-sdk'
module AWS
  module ELB
    def self.with_disabled_zone(az)
      raise ArgumentError('Block required') unless block_given?
      elb = Aws::ElasticLoadBalancing::Client.new
      elb_names = %w(dashboard pegasus redirects)
      elb_names.map do |elb_name|
        elb.disable_availability_zones_for_load_balancer({
          load_balancer_name: "#{CDO.rack_env}-#{elb_name}",
          availability_zones: [az]
        })
      end
      yield
      elb_names.map do |elb_name|
        elb.enable_availability_zones_for_load_balancer({
            load_balancer_name: "#{CDO.rack_env}-#{elb_name}",
            availability_zones: [az]
          })
      end
    end
  end
end
