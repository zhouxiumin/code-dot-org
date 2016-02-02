# Patched version of Git provider
class Chef
  class Provider
    class Git < Chef::Provider

      def clone
        converge_by("clone from #{@new_resource.repository} into #{@new_resource.destination}") do
          remote = @new_resource.remote

          args = []
          args << "-o #{remote}" unless remote == "origin"
          args << "--depth #{@new_resource.depth}" if @new_resource.depth
          args << "--branch #{@new_resource.checkout_branch}" unless @new_resource.enable_checkout
          # args << "--no-single-branch" if @new_resource.depth and git_minor_version >= Gem::Version.new("1.7.10")

          Chef::Log.info "#{@new_resource} cloning repo #{@new_resource.repository} to #{@new_resource.destination}"

          clone_cmd = "git clone #{args.join(' ')} \"#{@new_resource.repository}\" \"#{@new_resource.destination}\""
          Chef::Log.info "Clone command: #{clone_cmd}"
          shell_out!(clone_cmd, run_options)
        end
      end

      def fetch_updates
        setup_remote_tracking_branches(@new_resource.remote, @new_resource.repository)
        converge_by("fetch updates for #{@new_resource.remote}") do
          # since we're in a local branch already, just reset to specified revision rather than merge
          fetch_command = "git fetch #{@new_resource.remote} && git fetch #{@new_resource.remote} && git reset --hard #{target_revision}"
          Chef::Log.debug "Fetching updates from #{new_resource.remote} and resetting to revision #{target_revision}"
          Chef::Log.info "Fetch command: #{fetch_command}"
          shell_out!(fetch_command, run_options(:cwd => @new_resource.destination))
        end
      end

    end
  end
end
