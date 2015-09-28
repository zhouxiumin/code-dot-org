require 'test_helper'
require 'rails/performance_test_help'

# Test basic activity-processing performance
class ActivitiesPerformanceTest < ActionDispatch::PerformanceTest
  setup do
    # Warm the caches
    @script_level = Script.find_by_name(Script::HOC_NAME).stages.first.script_levels.first
    @milestone_params = {lines: 20, attempt: '1', result: 'true', testResult: '100', time: '1000', app: 'test', program: '<hey>'}
  end

  test 'milestone' do
    post "/milestone/#{@user ? @user.id : 0}/#{@script_level.id}", @milestone_params
  end
end

class LoginActivitiesPerformanceTest < ActivitiesPerformanceTest
  setup { login_user }
end
