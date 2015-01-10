var source = require('vinyl-source-stream');
var path = require('path');
var es = require('event-stream');

var debug = require('gulp-debug');

// Gulp and general plugins
var gulp = require('gulp');
var newer = require('gulp-newer');
var uglify = require('./lib/gulp/gulp-uglify');

var gutil = require('gulp-util');
var insert = require('gulp-insert');
var rename = require("gulp-rename");

var APPS = [
  'maze',
  'turtle',
  'bounce',
  'flappy',
  'studio',
  'jigsaw',
  'calc',
  'webapp',
  'eval'
];

var allFilesSrc = [];
var allFilesDest = [];
var outputDir = './build/package/js/';
APPS.forEach(function (app) {
  allFilesSrc.push('./build/js/' + app + '/main.js');
  allFilesDest.push(outputDir + app + '.js');
});

var browserify = require('browserify');
var b = browserify(allFilesSrc);
b.plugin('factor-bundle', {outputs: allFilesDest});

gulp.task('browserify', ['src', 'vendor', 'ejs'], function () {
  return bundle(b);
});

var watchify = require('watchify');
var w = watchify(browserify(allFilesSrc, watchify.args));
w.plugin('factor-bundle', {outputs: allFilesDest});
w.on('update', function () {
  gutil.log('Updated');
  bundle(w)
}); // on any dep update, runs the bundler

function bundle(bundler) {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('common.js'))
    .pipe(gulp.dest('./build/package/js'));
}

gulp.task('compress', ['browserify'], function () {
  return gulp.src([
    './build/package/js/*.js',
    '!build/package/js/**/vendor.js'
  ])
    .pipe(uglify({compress: false, concurrency: 4}))
    .pipe(gulp.dest('./build/package/js'))
});

var messageFormat = require('./lib/gulp/gulp-messageformat');
gulp.task('messages2', function () {
  return gulp.src(['i18n/**/*.json'])
    .pipe(rename(function (filepath) {
      var app = filepath.dirname;
      var locale = filepath.basename;
      filepath.extname = '.js';
      filepath.dirname = locale;
      filepath.basename = app + '_locale';
    }))
    .pipe(newer('build/package/js'))
    .pipe(messageFormat(function(file) {
      var filepath = file.path;
      var locale = path.basename(path.dirname(filepath));
      var app = path.basename(filepath, path.extname(filepath));
      var namespace = (app == 'common' ? 'locale' : 'appLocale');
      return {
        locale: locale.split('_')[0],
        namespace: app,
        prepend: "window.blockly = window.blockly || {};\n",
        append: "\nwindow.blockly." + namespace + " = " + app + "['" + app + "'];\n"
      }
    }))
    .pipe(gulp.dest('build/package/js'));
});

var ejs = require('gulp-ejs-precompiler');
gulp.task('ejs', function () {
  return gulp.src('./src/**/*.ejs')
    .pipe(ejs({
      client: true,
      cache: false,
      compileDebug: false
    }))
    .pipe(insert.wrap('module.exports = function(a,b,c,d) {\ntemplates = {};\n',
      function (file) {
        var templatePath = JSON.stringify(file.relative.slice(0, -3));
        return '\n' + 'return templates[' + templatePath + '](a,b,c,d);\n}'
      }))
    .pipe(gulp.dest('./build/js'));
});

var ext = 'compressed';
var vendorFiles = [
  'lib/blockly/blockly_' + ext + '.js',
  'lib/blockly/blocks_' + ext + '.js',
  'lib/blockly/javascript_' + ext + '.js',
  'lib/blockly/' + 'en_us' + '.js'
];

var concat = require('gulp-concat');
gulp.task('vendor', function () {
  return gulp.src(vendorFiles)
    .pipe(newer('./build/package/js/en_us/vendor.js'))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./build/package/js/en_us'))
});

gulp.task('media', function () {
  return gulp.src(['static/**/*', 'lib/blockly/media/**/*'])
    .pipe(newer('./build/package/media'))
    .pipe(gulp.dest('./build/package/media'))
});

gulp.task('src', function () {
  return gulp.src(['src/**/*.js'])
    .pipe(newer('./build/js'))
    .pipe(gulp.dest('./build/js'))
});

var exec = require('child_process').exec;
gulp.task('lodash', function (cb) {
  return exec('`npm bin`/lodash include=' +
  ['debounce', 'reject', 'map', 'value', 'range', 'without', 'sample',
    'create', 'flatten', 'isEmpty', 'wrap']
    .join(',') + ' --output src/lodash.js', cb);
});

var sass = require('gulp-sass');
gulp.task('sass', function () {
  return es.merge(
    gulp.src('style/common.scss')
      .pipe(sass())
      .pipe(gulp.dest('./build/package/css')),
    gulp.src('style/**/style.scss')
      .pipe(sass())
      .pipe(rename(function (filepath) {
        // replace file name to that of the parent directory
        filepath.basename = path.basename(filepath.dirname);
        // remove parent directory from relative path
        filepath.dirname = path.dirname(filepath.dirname);
        // leave extension as-is
      }))
      .pipe(gulp.dest('./build/package/css'))
  );
});

gulp.task('build', ['browserify', 'media', 'sass', 'messages2']);
// Call 'package' for maximum compression of all .js files
gulp.task('package', ['compress', 'media', 'sass', 'messages2']);

gulp.task('dev', ['src', 'vendor', 'ejs', 'messages', 'media', 'sass'], function () {
  gulp.watch('src/**/*.js', ['src']);
  gulp.watch('src/**/*.ejs', ['ejs']);
  gulp.watch('i18n/**/*.json', ['messages']);
  gulp.watch(['static/**/*', 'lib/blockly/media/**/*'], ['media']);
  gulp.watch('style/**/*.scss', ['sass']);
  bundle(w);
});
