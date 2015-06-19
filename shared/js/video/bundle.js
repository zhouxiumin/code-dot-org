// Builds and minifies the packaged JS using Browserify and Uglify

var path = require('path');
var _ = require('underscore.string');
var fse = require('fs-extra');

fse.mkdirsSync('./build');
var b = require('browserify')('./video.js')
  .transform(require('browserify-css'), {
    processRelativeUrl: processRelativeUrl
  })
  .bundle();
b.pipe(fse.createWriteStream('./build/video.js'));
b.on('end', function() {
  var UglifyJS = require("uglify-js");
  var result = UglifyJS.minify("./build/video.js");
  fse.deleteSync('./build/video.js');
  fse.writeFileSync('./build/video.js', result.code);
  console.log('written: ' + result.code.length);
});

// Copies relative-URL assets referenced by the embedded CSS
function processRelativeUrl(relativeUrl) {
  var stripQueryStringAndHashFromPath = function (url) {
    return url.split('?')[0].split('#')[0];
  };
  var rootDir = path.resolve(process.cwd(), '.');
  var relativePath = stripQueryStringAndHashFromPath(relativeUrl);
  var queryStringAndHash = relativeUrl.substring(relativePath.length);

  var prefix = 'node_modules/video.js/dist/video-js/';
  if (_.startsWith(relativePath, prefix)) {
    var vendorPath = 'video/' + relativePath.substring(prefix.length);
    var source = path.join(rootDir, relativePath);
    var target = path.join(rootDir, '../../misc', vendorPath);

    console.log('Copying file from ' + JSON.stringify(source) + ' to ' + JSON.stringify(target));
    fse.copySync(source, target);
    return '/shared/misc/' + vendorPath + queryStringAndHash;
  }
  return relativeUrl;
}

fse.copySync('node_modules/videojs-ie8/dist/videojs-ie8.min.js', './build/videojs-ie8.js');
fse.copySync('node_modules/video.js/node_modules/vtt.js/dist/vtt.min.js', './build/vtt.js');
fse.copySync('node_modules/video.js/dist/video-js/video-js.swf', '../../misc/video/video-js.swf');
