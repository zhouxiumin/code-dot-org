#!/usr/bin/env ruby
require_relative '../config/environment'

script_name = Script::COURSE2_NAME
stage_number = 4
new_block = %{
<block type="draw_move_by_constant">
  <title name="DIR">moveForward</title>
  <title name="VALUE">100</title>
</block>
}

script = Script.find_by_name script_name
stage = script.stages[stage_number - 1]
script_levels = ScriptLevel.where script: script, stage: stage
levels = script_levels.map(&:oldest_active_level)

levels.each do |level|
  toolbox = Nokogiri::XML(level.try(:toolbox_blocks))
  if toolbox
    toolbox.root.children.last.add_next_sibling new_block
    level.toolbox_blocks = toolbox.to_xml
    level.save!
  end
end
