var gulp = require('gulp');
//var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
//var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var pngquant = require('imagemin-pngquant');
var jpegrecompress = require('imagemin-jpeg-recompress');
var rev = require('gulp-rev');
var newer = require('gulp-newer');
var changed = require('gulp-changed');
var useref = require('gulp-useref'),
  gulpif = require('gulp-if'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
  revReplace = require('gulp-rev-replace'),
  revCollector = require('gulp-rev-collector')
  ;

var paths = {
  scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
  images: ['**/*.{png,jpg,gif}', '!build/**/*', '!node_modules/**/*'],
  html: ['**/*.html', '!build/**/*', '!node_modules/**/*']
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

var imageminOpts = {
  optimizationLevel: 4,
  use: [
    pngquant({
      quality: '65-80',
      speed: 7
    }),
    jpegrecompress({
      loops: 10,
      quality: 'low',
      max: 90
    })
  ]
};

// Min and hash static images
var compressImages = false;
var gutil = require('gulp-util');
var noop = gutil.noop;

gulp.task('images', [], function() {
  var imgDest = 'build/img';
  var imgMin = 'build/imgMin';
  return gulp.src(['**/*.{png,jpg,gif,cur,mp3,wav,ogg}', '!build/**/*', '!node_modules/**/*'])
    .pipe(compressImages ? changed(imgDest) : noop())
    .pipe(compressImages ? imagemin(imageminOpts) : noop())
    .pipe(compressImages ? gulp.dest(imgDest) : noop())
    .pipe(changed(imgMin, {hasChanged: changed.compareSha1Digest}))
    .pipe(rev())
    .pipe(gulp.dest(imgMin))
    .pipe(rev.manifest({path:'img-manifest.json'}))
    .pipe(gulp.dest('build'));
});

// Min and hash javascript
gulp.task('js', [], function() {
  return gulp.src(['**/*.js', '!build/**/*', '!node_modules/**/*'])
    .pipe(changed('build/js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(rev())
    .pipe(gulp.dest('build/jsMin'))
    .pipe(rev.manifest({path:'js-manifest.json'}))
    .pipe(gulp.dest('build'))
});

// No need for css task because they're all bundled refs

var userefAssets = useref.assets();

// Concatenate, min and hash JS/CSS bundled refs within index.html
gulp.task('refs', [], function() {
  return gulp.src(['index.html', 'assets/**/*.html'], {base: './'})
    // replace stream with concatenated assets until .restore()
    .pipe(userefAssets)
    .pipe(gulpif('*.js', uglify())) // compress JS block
    .pipe(gulpif('*.css', minifyCss())) // compress CSS block
    .pipe(rev()) // add hash to assets
    .pipe(gulp.dest('build/ref'))
    .pipe(rev.manifest({path:'ref-manifest.json'}))
    .pipe(gulp.dest('build'))
    .pipe(userefAssets.restore()) // Return to the html sources
    .pipe(useref()) // Rewrite source refs with concatenated assets
//    .pipe(revReplace()) // Rewrite source refs with hashed asset names
    .pipe(gulp.dest('build/html'))
    ;
});

var debug = require('gulp-debug');

gulp.task('debug', [], function() {
  return gulp.src(['index.html', 'assets/**/flappy_intro.html'], {base: './'})
    .pipe(debug())
});

// Rewrite references to hashed assets in .html files
// (todo: rewrite css/js asset references as well?)
gulp.task('html', [], function() {
  return gulp.src(['build/*-manifest.json', 'build/html/index.html', 'build/html/**/notes/*.html'])
    .pipe(revCollector({})) // Rewrite references to assets in .html using .json manifest files
//    .pipe(require('gulp-minify-html')({
//      empty:true,
//      spare:true
//    }))
    .pipe( gulp.dest('build/htmlMin') );
});

gulp.task('package', [], function() {
  return gulp.src(['build/imgMin/**/*', 'build/jsMin/**/*', 'build/htmlMin/**/*', 'build/ref/**/*'])
    .pipe(gulp.dest('build/package'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
//  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'images']);
