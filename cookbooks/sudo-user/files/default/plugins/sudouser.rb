require 'etc'

Ohai.plugin(:Sudo) do
  provides 'current_user'
  collect_data do
    current_user ENV['SUDO_USER']
  end
end
