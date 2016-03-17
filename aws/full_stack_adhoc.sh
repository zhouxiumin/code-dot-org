#!/bin/bash
# Run this script to launch an adhoc infrastructure stack using AWS CloudFormation.
set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Update cdo-bootstrap script
aws s3 cp --acl="public-read" ./chef-zero-bootstrap.sh s3://cdo-dist/cdo-bootstrap.sh

# Update cookbooks for this branch
pushd ../cookbooks
bundle exec berks package /tmp/berks.tar.gz
aws s3 cp --acl="public-read" /tmp/berks.tar.gz s3://cdo-dist/chef/${BRANCH}.tar.gz
popd

ROOT=$(dirname ${PWD})
SSH_PATH=${HOME}/.ssh
STACK_FILE=chef-stack.yml.erb

# us-west-2 ubuntu AMI
export IMAGE_ID=ami-9abea4fb

# Process CloudFormation config with ERB + YAML, then pass the JSON to `aws cloudformation create-stack`.
aws cloudformation create-stack \
  --stack-name adhoc-frontend-${BRANCH} \
  --region us-west-2 \
  --capabilities "CAPABILITY_IAM" \
  --template-body \
  "$(bundle exec ruby -rerb -ryaml -rjson -e "puts YAML.load(ERB.new(File.read('${STACK_FILE}')).result).to_json")"
