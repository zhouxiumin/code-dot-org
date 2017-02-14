# == Schema Information
#
# Table name: arenas
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  level_id   :integer
#  properties :text(65535)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_arenas_on_level_id  (level_id)
#  index_arenas_on_user_id   (user_id)
#

class Arena < ApplicationRecord
  belongs_to :user
  belongs_to :level
end
