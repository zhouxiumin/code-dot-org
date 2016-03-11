#!/bin/bash
# Code-dot-org Chef Zero bootstrap script.
# One-liner to run:
# curl https://s3.amazonaws.com/cdo-dist/cdo-bootstrap.sh | sudo bash -s -- [options]
#
# Options:
# -b [branch]
# -n [node_name]
# -r [run_list]
# -v [chef_version]

# Set script defaults
BRANCH=staging
NODE_NAME=$(hostname)
CHEF_VERSION=12.7.2
RUN_LIST='recipe[cdo-apps]'

# Parse options
while getopts ":b:n:r:v" opt; do
  case "${opt}" in
    b)
      BRANCH=${OPTARG}
      ;;
    n)
      NODE_NAME=${OPTARG}
      ;;
    r)
      RUN_LIST=${OPTARG}
      ;;
    v)
      CHEF_VERSION=${OPTARG}
      ;;
    \?)
      echo "Invalid option: -${OPTARG}" >&2
      ;;
  esac
done

CHEF_CLIENT=/opt/chef/bin/chef-client
LOG=/opt/chef-zero/chef-zero.log
mkdir -p /opt/chef-zero/{cookbooks,environments}

# Redirect copy of stdout/stderr to a log file for later auditing.
exec > >(tee -i ${LOG})
exec 2>&1

# Ensure correct version of Chef is installed.
if [ "$(${CHEF_CLIENT} -v)" != "Chef: ${CHEF_VERSION}" ]; then
  apt-get install -y curl
  curl -L https://www.chef.io/chef/install.sh | bash -s -- -v ${CHEF_VERSION}
else echo "Chef ${CHEF_VERSION} is installed."
fi

# Install branch-specific cookbooks from s3 package.
REPO_COOKBOOK_URL=https://s3.amazonaws.com/cdo-dist/chef/${BRANCH}.tar.gz
curl -L --silent --insecure ${REPO_COOKBOOK_URL} | tar xz -C /opt/chef-zero

# Install local-chef boilerplate.
cat <<JSON > /opt/chef-zero/environments/adhoc.json
{
  "name": "adhoc",
  "description": "Adhoc Chef environment",
  "cookbook_versions": {},
  "json_class": "Chef::Environment",
  "chef_type": "environment",
  "default_attributes": {},
  "override_attributes": {
    "omnibus_updater": {
      "version": "${CHEF_VERSION}"
    },
    "cdo-repository": {
      "branch": "${BRANCH}"
    }
  }
}
JSON

cat <<EOF > /opt/chef-zero/solo.rb
ssl_verify_mode :verify_peer
node_name "${NODE_NAME}"
environment 'adhoc'
log_level :info
EOF

# Run chef-client in local mode.
cd /opt/chef-zero
${CHEF_CLIENT} -v
${CHEF_CLIENT} -z -c solo.rb -o "${RUN_LIST}"
