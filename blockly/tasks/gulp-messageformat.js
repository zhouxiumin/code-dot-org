module.exports = function(fileOptions) {
  return require('./multicore')(require.resolve('./transform-messages'), {
    input: function(data) {
      return {
        string: data.contents.toString(),
        options: fileOptions(data)
      }
    },
    output: function(origData, inputData, outputData) {
      origData.contents = new Buffer(outputData);
      return origData;
    }
  });
};