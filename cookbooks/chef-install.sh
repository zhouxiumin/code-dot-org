#!/bin/bash -x

# Run chef-client using cookbooks in the local repository.

# Run apt-get update/install if packages aren't already installed
function apt_install() {
  if ! dpkg -s $1 2>/dev/null >/dev/null; then
    apt-get update
    apt-get -y install $1
  fi
}

# Bootstrap prerequisites
apt_install 'curl git'

# Redirect copy of stdout/stderr to a log file for later auditing.
LOG=/var/log/chef-bootstrap.log
exec >> >(tee -i ${LOG})
exec 2>&1

CHEF_CLIENT=/opt/chef/bin/chef-client
CHEF_REPO_PATH=/var/chef
CHEF_VERSION=12.7.2

# Ensure correct version of Chef is installed.
if [ "$(${CHEF_CLIENT} -v)" != "Chef: ${CHEF_VERSION}" ]; then
  curl -L https://omnitruck.chef.io/install.sh | bash -s -- -v ${CHEF_VERSION}
else
  echo "Chef ${CHEF_VERSION} is installed."
fi
${CHEF_CLIENT} -v

mkdir -p /etc/chef
CLIENT_RB=/etc/chef/client.rb
NODE_NAME=$(hostname)
ENVIRONMENT=test
RUN_LIST='["recipe[cdo-apps]"]'

cat <<RUBY > ${CLIENT_RB}
node_name '${NODE_NAME}'
environment '${ENVIRONMENT}'
chef_repo_path '${CHEF_REPO_PATH}'
local_mode true
RUBY

# Write default first-boot.json to be used by the chef-client command.
# Existing file takes precedence.
FIRST_BOOT=/etc/chef/first-boot.json
if [ ! -f ${FIRST_BOOT} ] ; then
  cat <<JSON > ${FIRST_BOOT}
{
  "omnibus_updater": {
    "version": "${CHEF_VERSION}"
  },
  "run_list": ${RUN_LIST}
}
JSON
fi

mkdir -p ${CHEF_REPO_PATH}/{cookbooks,environments}
# Install branch-specific Chef cookbooks from local repo.
bundle install
bundle exec berks vendor ${CHEF_REPO_PATH}/cookbooks

# Boilerplate `test` environment for local Chef.
cat <<JSON > ${CHEF_REPO_PATH}/environments/${ENVIRONMENT}.json
{
  "name": "${ENVIRONMENT}",
  "description": "${ENVIRONMENT} Chef environment",
  "cookbook_versions": {},
  "json_class": "Chef::Environment",
  "chef_type": "environment",
  "default_attributes": {
    "cdo-repository": {
      "disable": true
    }
  },
  "override_attributes": {}
}
JSON

# Run chef-client.
${CHEF_CLIENT} -c ${CLIENT_RB} -j ${FIRST_BOOT}
