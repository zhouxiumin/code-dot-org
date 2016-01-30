#script to retrieve instance tags based on describe-tags function.
# Require awscli installed and proper credentials configured in the environment.
# todo: port to Ruby aws-sdk
# ec2_instance_tag [key] [default]
function ec2_instance_tag {
  INSTANCE_ID=$(ec2metadata --instance-id 2>/dev/null)
  JSON=$(aws ec2 describe-tags --filters "Name=resource-id,Values=${INSTANCE_ID}" "Name=tag-key,Values=${1}")
  echo $(echo ${JSON} | $(command -v ruby || echo "/opt/chef/embedded/bin/ruby") -r 'json' -e "JSON.parse(ARGF.read)['Tags'].first['Value'] rescue ''")
}
