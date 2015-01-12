var transform = require('./multicore');
module.exports = function(options) {
  var concurrency = options.concurrency;
  delete options.concurrency;
  return transform(require.resolve('./transform-jshint'), {
    concurrency: concurrency,
    input: function(data) {
      return {
        file: {
          cwd: data.cwd,
          base: data.base,
          path: data.path,
          contents: data.contents
        },
        options: options
      };
    },
    output: function(origData, inputData, outputData) {
      return outputData;
    }
  });
};
