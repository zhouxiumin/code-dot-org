var transform = require('./multicore');
var	merge = require('deepmerge');
module.exports = function(options) {
  options = merge(options || {}, {
    fromString: true,
    output: {}
  });
  return transform(require.resolve('./transform-uglify'), {
    input: function(data) {
      return {
        string: data.contents.toString(),
        options: options
      };
    },
    output: function(origData, inputData, outputData) {
      origData.contents = new Buffer(outputData);
      return origData;
    }
  });
};
