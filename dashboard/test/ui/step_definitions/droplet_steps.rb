And(/^I wait to see Droplet text mode$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return parseInt($('.droplet-ace').css('left')) > 0;") }
end

And(/^the Droplet ACE text is "([^"]*)"$/) do |expected_text|
  actual_text = @browser.execute_script("return __TestInterface.getDropletContents();")
  actual_text.should eq expected_text
end

And(/^no Tooltipster tooltip is visible$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { !@browser.execute_script("return $('.tooltipster-base').is(':visible');") }
end

And(/^there is a Tooltipster tooltip with text "([^"]*)"$/) do |tooltip_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  wait.until { @browser.execute_script("return $('.tooltipster-content :contains(#{tooltip_text})').length > 0;") }
end

When /^I drag droplet block "([^"]*)" to line (\d+)$/ do |blockName, lineNumber|
  code = %{
    var block = $("#droplet_palette_block_#{blockName}");
    var gutterLine = $(".droplet-gutter-line").filter(function (index) { return $(this).text() === "#{lineNumber}"; });
    var drag_dx = gutterLine.offset().left + gutterLine.outerWidth() - block.offset().left;
    var drag_dy = gutterLine.offset().top - block.offset().top;
    block.simulate( 'drag', {
      handle: 'center',
      dx: drag_dx,
      dy: drag_dy,
      moves: 5
    });
  }
  @browser.execute_script code
end
