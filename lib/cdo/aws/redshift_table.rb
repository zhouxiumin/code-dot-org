class RedshiftTable
  def self.command_options(app)
    config = URI(CDO["#{app}_db_writer"])
    args = []
    args.concat(%w(--default-character-set utf8))
    %w(user password host port).each do |key|
      if config.respond_to?(key.to_sym) && (value = config.method(key.to_sym).call)
        args.concat(["--#{key}", value])
      end
    end
    args
  end

  def self.dump(app, schema, table, whitelist_columns=nil)
    db_name = "#{app}_development"
    dump_string = "mysqldump #{command_options(app).join(' ')} --compatible=postgresql -n -d #{db_name} #{table} | #{__dir__}/mysql_to_redshift --input_file=- --output_file=- --table_name=#{schema}.#{table}"
    dump = %x(#{dump_string})
    create_table_sql = /CREATE TABLE.*?;/m.match(dump).to_s

    if whitelist_columns
      filtered_lines = create_table_sql.lines.select do |line|
        # Filter only lines matching whitelisted column names either as `("x"` or ` "x"`.
        line.match(/(\s|\()\"(#{whitelist_columns.join('|')})\"/)
      end.join
      # Replace lines between `CREATE TABLE` and trailing `)`.
      create_table_sql.gsub!(/(CREATE TABLE.*?$)(.*)(^\)$)/m, "\\1#{filtered_lines}\\3")
    end

    # Normalize whitespace.
    create_table_sql.gsub!(/\s+/m, ' ')
    create_table_sql
  end
end
