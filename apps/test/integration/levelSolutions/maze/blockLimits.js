const TestResults = require('@cdo/apps/constants.js').TestResults;
const blockUtils = require('@cdo/apps/block_utils');

const levelDef = {
  'map': [
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
  ],
  'startDirection': 1, // Direction.EAST,
  'initialDirt': [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  flowerType: 'redWithNectar',
  toolbox: '<xml id="toolbox"><block type="maze_moveForward" limit="1"></block></xml>',
  requiredBlocks: [],
};

module.exports = {
  app: "maze",
  skinId: "bee",
  levelDefinition: levelDef,
  tests: [{
    description: "Limited toolbox blocks - over limit",
    expected: {
      result: true,
      testResult: TestResults.BLOCK_LIMIT_FAIL,
    },
    missingBlocks: [],
    xml: '<xml>' +
    blockUtils.blocksFromList([
      "maze_moveForward",
      "maze_moveForward",
      ]) + '</xml>',
  }, {
    description: "Limited toolbox blocks - under limit",
    expected: {
      result: true,
      testResult: TestResults.ALL_PASS,
    },
    missingBlocks: [],
    xml: '<xml>' +
    blockUtils.blocksFromList([
      "maze_moveForward",
    ]) + '</xml>',
  }]
};
