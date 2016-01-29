#
# Cookbook Name:: cdo-repository
# Recipe:: default
#
include_recipe 'cdo-github-access'

# Sync to the appropriate branch.
adhoc = node.chef_environment == 'adhoc'
branch = adhoc ?
  (node['cdo-repository']['branch'] || 'staging') :
  node.chef_environment

home_path = "/home/#{node[:current_user]}"
git_path = File.join home_path, node.chef_environment

# Add the branch to the remote fetch list if not already provided.
execute 'fetch-git-branch' do
  cwd git_path
  command "git config --add remote.origin.fetch +refs/heads/#{branch}:refs/remotes/origin/#{branch}"
  not_if <<BASH, cwd: git_path
git config --get remote.origin.fetch '^\\+refs/heads/#{branch}:refs/remotes/origin/#{branch}$' || \
git config --get remote.origin.fetch '^\\+refs/heads/\*:refs/remotes/origin/\*$'
BASH
end if ::File.directory?(git_path) && !GitHelper.shared_volume?(git_path, home_path)

git git_path do
  # Clone repo via SSH if key is provided, anonymous-HTTPS otherwise.
  if node['cdo-github-access'] && node['cdo-github-access']['id_rsa'] != ''
    repository 'git@github.com:code-dot-org/code-dot-org.git'
  else
    repository 'https://github.com/code-dot-org/code-dot-org.git'
  end

  # Make adhoc checkouts as shallow as possible.
  depth 1 if node.chef_environment == 'adhoc'

  # Checkout at clone time, disable the additional checkout step.
  enable_checkout false
  checkout_branch branch
  revision branch

  # Sync the local branch to the upstream branch.
  # Skip git-repo sync when running a shared-volume.
  action GitHelper.shared_volume?(git_path, home_path) ? :nothing : :sync
  user node[:current_user]
  group node[:current_user]
end
