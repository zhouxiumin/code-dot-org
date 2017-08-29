require_relative './form'

class SchoolInfo2017 < Form
  def self.normalize(data)
    result = {}

    result[:name_s] = nil_if_empty stripped data[:name_s]
    result[:email_s] = required email_address data[:email_s]
    result[:organization_name_s] = nil_if_empty stripped data[:organization_name_s]

    role = default_if_empty downcased(stripped(data[:role_s])), 'other'
    result[:role_s] = enum role, %w(teacher administrator parent student volunteer/community advocate other)
    result
  end
end
