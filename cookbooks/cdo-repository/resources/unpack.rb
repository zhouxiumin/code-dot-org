# Simple Chef Resource that downloads a `source` archive and unpacks its contents in the specified `destination`.
# Roughly equivalent to the [ark](https://github.com/burtlo/ark) cookbook's :put action,
# but simpler (single function) and faster (aria2 provides parallel HTTP downloads).

resource_name :unpack
property :destination, String, name_property: true
property :source, String, required: true
property :user, String, required: true
property :group, String, required: true

action :create do
  output_file = ::File.basename(source)
  output_dir = Chef::Config[:file_cache_path]
  output_path = ::File.join output_dir, output_file

  package 'aria2'
  execute 'aria2c' do
    command "aria2c -x 10 -s 20 --file-allocation=falloc -d #{output_dir} -o #{output_file} #{source}"
    user new_resource.user
    group new_resource.group
  end

  directory destination do
    recursive true
    user new_resource.user
    group new_resource.group
  end

  execute 'tar' do
    command "tar xvf #{output_path} -C #{destination} && rm #{output_path}"
    user new_resource.user
    group new_resource.group
  end
end
