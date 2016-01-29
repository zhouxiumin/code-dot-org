# sudo-user

- Provides `node[:user]` via `ENV['SUDO_USER']` when Ohai is run via `sudo`, falling back to `ENV['USER']` otherwise.
- Overwrites `node[:current_user]` to preserve the Chef 11 behavior.
- Sets `node[:home]` to the user's home folder.
