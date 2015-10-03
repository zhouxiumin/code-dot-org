require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/bin/aws'
cmd 'aws --version', 'aws-cli/1.4/5'
