resource_name :unpack
property :destination, String, name_property: true
property :source, String, required: true

load_current_value do
  if ::File.exist?('/var/www/html/index.html')
    homepage IO.read('/var/www/html/index.html')
  end
end

action :create do
  package 'aria2'
  output_file = File.basename(source)
  output_dir = Chef::Config[:file_cache_path]

  execute 'aria2c' do
    command "aria2c -d #{output_dir} -x 10 -s 20 --file-allocation=falloc -o #{output_file} #{source}"
  end
  execute 'tar' do
    command "tar xvf #{output_dir}/#{output_file} -C #{destination}"
  end
end
