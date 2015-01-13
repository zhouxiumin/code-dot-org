function log(s) {
  //console.log(new Date().toISOString() + ': ' + s);
}

var source = require('vinyl-source-stream');
var path = require('path');
var es = require('event-stream');

// Gulp and general plugins
var gulp = require('gulp');
var newer = require('gulp-newer');

var gutil = require('gulp-util');
var insert = require('gulp-insert');
var rename = require("gulp-rename");

var parallel = require('./lib/gulp/multicore');

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

gulp.task('browserify', ['src', 'vendor', 'ejs', 'locales'], function () {
  console.log(new Date().toISOString() + ': start task');
  //var debug = require('gulp-debug');

  var bs = parallel(require.resolve('./lib/gulp/gulp-browserify'), {concurrency: 1});
  var bundle = bs({filesSrc: allFilesSrc, filesDest: allFilesDest});

  //var browserify = require('browserify');
  //var b = browserify(allFilesSrc);
  //b.plugin('factor-bundle', {outputs: allFilesDest});
  //var bundle = b.bundle().pipe(source('common.js')).pipe(gulp.dest('./build/package/js'));
  return bundle
});

/*
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
*/

var uglify = parallel('gulp-uglify');
gulp.task('compress', ['browserify'], function () {
  return gulp.src([
    './build/package/js/*.js',
    '!build/package/js/**/vendor.js'
  ])
    .pipe(uglify({compress:false}))
    .pipe(gulp.dest('./build/package/js'))
});

var messageFormat = parallel(require.resolve('./lib/gulp/transform-messageformat'));
gulp.task('messages', function () {
  return gulp.src(['i18n/**/*.json'])
    .pipe(rename(function (filepath) {
      var app = filepath.dirname;
      var locale = filepath.basename;
      filepath.extname = '.js';
      filepath.dirname = locale;
      filepath.basename = app + '_locale';
    }))
    .pipe(newer('build/package/js'))
    .pipe(messageFormat())
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

var string_src = function(filename, string) {
  return new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) });
}

gulp.task('locales', function() {
  return es.readArray(APPS.concat('common').map(function (item) {
    return string_src(item + '.js', 'module.exports = window.blockly.' + (item == 'common' ? 'locale' : 'appLocale') + ';');
  }))
    .pipe(gulp.dest('./build/locale/current'));
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

gulp.task('build', ['browserify', 'media', 'sass', 'messages']);
// Call 'package' for maximum compression of all .js files
gulp.task('package', ['compress', 'media', 'sass', 'messages']);

gulp.task('dev', ['src', 'vendor', 'ejs', 'messages', 'media', 'sass'], function () {
  gulp.watch('src/**/*.js', ['src']);
  gulp.watch('src/**/*.ejs', ['ejs']);
  gulp.watch('i18n/**/*.json', ['messages']);
  gulp.watch(['static/**/*', 'lib/blockly/media/**/*'], ['media']);
  gulp.watch('style/**/*.scss', ['sass']);
  bundle(w);
});

var jshint = parallel('gulp-jshint');
var jshint2 = require('gulp-jshint');
gulp.task('lint', function() {
  return gulp.src([
      'Gulpfile.js',
      'Gruntfile.js',
      'tasks/**/*.js',
      'lib/gulp/*.js',
      'src/**/*.js',
      'test/**/*.js',
      '!src/hammer.js',
      '!src/lodash.js',
      '!src/lodash.min.js',
      '!src/canvg/*.js'
    ]
  )
    .pipe(jshint({
      node: true,
      browser: true,
      globals: {
        Blockly: true,
        //TODO: Eliminate the globals below here.
        StudioApp: true,
        Maze: true,
        Turtle: true,
        Bounce: true
      }
    }))
    .pipe(jshint2.reporter('jshint-stylish'))
    .pipe(jshint2.reporter('fail'));
});
