var browserify = require('browserify');
var source = require('vinyl-source-stream');
var dest = require('gulp').dest;

module.exports = function(options) {
  var b = browserify(options.filesSrc);
  b.plugin('factor-bundle', {outputs: options.filesDest});
  var bundle = b.bundle();
  return bundle
    .pipe(source('common.js'))
    .pipe(dest('./build/package/js'));
};
