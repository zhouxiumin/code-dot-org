# sudo-user

Provides node[:current_user] via ENV['SUDO_USER'] instead of 'root' when chef-client is run as root.
For compatibility with Chef 11 behavior.
