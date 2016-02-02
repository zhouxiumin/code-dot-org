require 'chef/provisioning/aws_driver'
region = node['cdo-deploy']['region']

with_driver "aws::#{region}"

aws_vpc 'ref-vpc' do
  cidr_block '10.0.0.0/24'
  internet_gateway true
  main_routes '0.0.0.0/0' => :internet_gateway
  enable_dns_support true
  enable_dns_hostnames true
end

aws_subnet 'ref-subnet' do
  vpc 'ref-vpc'
  cidr_block '10.0.0.0/26'
  availability_zone 'us-west-2a'
  map_public_ip_on_launch true
end

aws_security_group 'ref-sg1' do
  vpc 'ref-vpc'
  open_ports = [ 22, 80, 443, 8080, 8081 ]
  inbound_rules '0.0.0.0/0' => open_ports
  outbound_rules(open_ports.map do |port|
    {port: port, protocol: :tcp, destinations: ['0.0.0.0/0']}
  end)
end

load_balancer 'ref-load-balancer' do
  load_balancer_options(
    subnets: [ 'ref-subnet' ],
    security_groups: ['ref-sg1'],
    listeners: [
      {
        instance_port: 80,
        protocol: 'HTTP',
        instance_protocol: 'HTTP',
        port: 80
      }
    ].tap do |x|
      # Only enable HTTPS port if SSL certificate ID is provided.
      if (server_certificate_name = node['cdo-deploy']['server_certificate_name'])
        user_id = Aws::IAM::Client.new(region: region).get_user.user['user_id']
        x.push({
          instance_port: 80,
          protocol: 'HTTPS',
          instance_protocol: 'HTTP',
          port: 443,
          ssl_certificate_id: "arn:aws:iam::#{user_id}:server-certificate/#{server_certificate_name}"
        })
      end
    end,
    health_check: {
      target: 'HTTP:8080/',
      interval: 10,
      timeout: 5,
      unhealthy_threshold: 2,
      healthy_threshold: 2
    },
    attributes: {
      cross_zone_load_balancing: {
        enabled: true
      }
    }
  )
end

# Use the most recent cdo-* AMI published by code-org
ami_filter = {
  name: 'cdo-*',
  'owner-alias': 'code-org'
}.map{|k, v| [name: k, values: Array(v)]}
ami_list = Aws::IAM::Client.new(region: region).describe_images(filters: ami_filter).sort do |ami1, ami2|
  Time.parse(ami1.creation_date) <=> Time.parse(ami2.creation_date)
end
ami_id = ami_list.last.id

aws_launch_configuration 'ref-launch-configuration' do
  image ami_id

  instance_type 'm4.10xlarge'
  options security_groups: 'ref-sg1',
    key_pair: 'server_access_key',
    user_data: <<-EOF
#!/bin/bash
sudo -u ubuntu bash -c 'curl https://s3.amazonaws.com/cdo-dist/cdo-bootstrap.sh | sudo bash -s -- chef_12'
  EOF
end

aws_auto_scaling_group 'ref-auto-scaling-group' do
  availability_zones ['us-west-2a']
  desired_capacity 2
  min_size 1
  max_size 3
  launch_configuration 'ref-launch-configuration'
  load_balancers 'ref-load-balancer'
  options subnets: 'ref-subnet',
    health_check_type: 'ELB'
end
