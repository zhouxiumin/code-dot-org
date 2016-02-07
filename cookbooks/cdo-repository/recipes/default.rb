#
# Cookbook Name:: cdo-repository
# Recipe:: default
#

# Sync repo via SSH if key is provided.
include_recipe 'cdo-github-access'
has_ssh_key = node['cdo-github-access'] && node['cdo-github-access']['id_rsa'] != ''
if has_ssh_key
  node.override['cdo-repository']['url'] = 'git@github.com:code-dot-org/code-dot-org.git'
end

home_path = node[:home]
git_path = File.join home_path, node.chef_environment

# Bootstrap shallow clones with git-repo tar file.
if node['cdo-repository']['depth']
  unpack git_path do
    source 'http://s3.amazonaws.com/cdo-repo/staging.tar'
    not_if {File.exist? "#{git_path}/.git"}
    user node[:user]
    group node[:user]
  end
end

git git_path do
  repository node['cdo-repository']['url']
  depth node['cdo-repository']['depth'] if node['cdo-repository']['depth']

  # Checkout during clone using --branch [checkout_branch] to skip additional checkout step.
  enable_checkout false

  branch = node['cdo-repository']['branch']
  checkout_branch branch
  revision branch

  # Default checkout-only for CI-managed instances. (CI script manages updates)
  action = :checkout
  # Sync instead of checkout for adhoc instances that aren't CI-managed.
  action = :sync if node.chef_environment == 'adhoc'
  # Skip git-repo sync when using a shared volume. (Host manages updates)
  action = :nothing if GitHelper.shared_volume?(git_path, home_path)
  action action

  user node[:user]
  group node[:user]
end
