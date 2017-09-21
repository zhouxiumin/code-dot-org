# == Schema Information
#
# Table name: course_scripts
#
#  id              :integer          not null, primary key
#  course_id       :integer          not null
#  script_id       :integer          not null
#  position        :integer          not null
#  experiment_name :string(255)      comment[If present, the SingleTeacherExperiment with this name must be enabled in order for a teacher or their students to see this script.]
#
# Indexes
#
#  index_course_scripts_on_course_id  (course_id)
#  index_course_scripts_on_script_id  (script_id)
#

class CourseScript < ApplicationRecord
  belongs_to :course
  belongs_to :script
end
