@eyes
Feature: Reproing merge failure on eyes

Scenario:
  Given I am on "https://memegen.link/blb/test-child-v1/_.jpg"
  When I open my eyes to test "(ignore) Brian trying to repro eyes bug"
  And I see no difference for "test changing in child"
  Given I am on "https://memegen.link/blb/test-parent-v1/_.jpg"
  And I see no difference for "test changing in parent"
  Given I am on "https://memegen.link/blb/test-unchanging/_.jpg"
  And I see no difference for "test unchanging baseline"
  And I close my eyes
