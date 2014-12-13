var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var exec = require('child_process').exec;
var path = require('path');
var es = require('event-stream');

// Gulp and plugins
var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var insert = require('gulp-insert');
var ejs = require('gulp-ejs-precompiler');
var rename = require("gulp-rename");
var messageFormat = require('gulp-messageformat');
var concat = require('gulp-concat');
var sass = require('gulp-sass');

var LOCALES = [
  'ar_sa',
//  'az_az',
  'bg_bg',
  'bn_bd',
  'ca_es',
  'cs_cz',
  'da_dk',
  'de_de',
  'el_gr',
  'en_us',
//  'en_ploc',
  'es_es',
  'eu_es',
  'fa_ir',
  'fi_fi',
  'fil_ph',
  'fr_fr',
  'he_il',
  'hi_in',
  'hr_hr',
  'hu_hu',
  'id_id',
  'is_is',
  'it_it',
  'ja_jp',
  'ko_kr',
  'lt_lt',
  'ms_my',
  'nl_nl',
  'no_no',
  'pl_pl',
  'pt_br',
  'pt_pt',
  'ro_ro',
  'ru_ru',
  'sk_sk',
  'sl_si',
  'sq_al',
  'sr_sp',
  'sv_se',
  'ta_in',
  'th_th',
  'tr_tr',
  'uk_ua',
  'ur_pk',
  'vi_vn',
  'zh_cn',
  'zh_tw'
];

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
  allFilesDest.push(outputDir+app+'.js');
});

var b = browserify(allFilesSrc, watchify.args);
b.plugin('factor-bundle', { outputs: allFilesDest });
gulp.task('browserify', ['src', 'vendor', 'ejs', 'messages'], function(){bundle(b)}); // so you can run `gulp js` to build the file

var w = watchify(browserify(allFilesSrc, watchify.args));
w.plugin('factor-bundle', { outputs: allFilesDest });
w.on('update', function(){gutil.log('Updated'); bundle(w)}); // on any dep update, runs the bundler
gulp.task('watch', function(){bundle(w)}); // so you can run `gulp js` to build the file

function bundle(bundler) {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('common.js'))
    // optional, remove if you dont want sourcemaps
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./build/package/js'));
}

gulp.task('messages', function(){
  var messageStreams = [];
  LOCALES.forEach(function (locale) {
    var language = locale.split('_')[0];
    APPS.concat('common').forEach(function (app) {
      var namespace = (app == 'common' ? 'locale' : 'appLocale');
      messageStreams.push(
        gulp.src(['i18n/'+app+'/'+locale+'.json'])
        .pipe(messageFormat({locale:language, namespace:namespace + 'Blockly'}))
        .pipe(rename(app+'_locale.js'))
        .pipe(insert.wrap("window.blockly = window.blockly || {};\n","\nwindow.blockly."+namespace + " = " + namespace + "Blockly['"+locale+"'];\n"))
        .pipe(gulp.dest('build/package/js/'+locale))
      );
    });
  });
  return es['merge'].apply(this, messageStreams);
});

gulp.task('ejs', function(){
  return gulp.src('./src/**/*.ejs')
    .pipe(ejs({
      client: true,
      cache: false,
      compileDebug: false
    }))
    .pipe(insert.wrap('module.exports = function(a,b,c,d) {\ntemplates = {};\n',
      function(file) {
        var templatePath = JSON.stringify(file.relative.slice(0, -3));
        return '\n' + 'return templates[' + templatePath + '](a,b,c,d);\n}'
      }))
    .pipe(gulp.dest('./build/js'));
});

  var ext = 'uncompressed';
  var vendorFiles = [
      'lib/blockly/blockly_' + ext + '.js',
      'lib/blockly/blocks_' + ext + '.js',
      'lib/blockly/javascript_' + ext + '.js',
      'lib/blockly/' + 'en_us' + '.js'
  ];

gulp.task('vendor', function() {
  return gulp.src(vendorFiles)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./build/package/js/en_us'))
});

gulp.task('media', function() {
  return gulp.src(['static/**/*', 'lib/blockly/media/**/*'])
    .pipe(gulp.dest('./build/package/media'))
});

gulp.task('src', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(gulp.dest('./build/js'))
});

gulp.task('lodash', function(cb){
  return exec('`npm bin`/lodash include=' +
    ['debounce', 'reject', 'map', 'value', 'range', 'without', 'sample',
    'create', 'flatten', 'isEmpty', 'wrap']
      .join(',') + ' --output src/lodash.js', cb);
});

gulp.task('sass', function () {
  return es.merge(
    gulp.src('style/common.scss')
    .pipe(sass())
    .pipe(gulp.dest('./build/package/css')),
    gulp.src('style/**/style.scss')
      .pipe(sass())
      .pipe(rename(function(filepath) {
        // replace file name to that of the parent directory
        filepath.basename = path.basename(filepath.dirname);
        // remove parent directory from relative path
        filepath.dirname = path.dirname(filepath.dirname);
        // leave extension as-is
      }))
      .pipe(gulp.dest('./build/package/css'))
  );
});

gulp.task('build', ['browserify', 'media', 'sass']);
