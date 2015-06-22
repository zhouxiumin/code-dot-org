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
