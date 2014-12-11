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

var paths = {
  scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
  images: ['**/*.{png,jpg,gif}', '!build/**/*', '!node_modules/**/*']
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build'], cb);
});

/*
gulp.task('scripts', ['clean'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(coffee())
    .pipe(uglify())
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('build/js'));
});
*/

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

// Copy all static images
gulp.task('images', [], function() {
  var imgDest = 'build/img';
  var imgMin = 'build/imgMin';
  return gulp.src(paths.images)
    .pipe(changed(imgDest))
    // Pass in options to the task
    .pipe(imagemin(imageminOpts))
    .pipe(gulp.dest(imgDest))
    .pipe(changed(imgMin, {hasChanged: changed.compareSha1Digest}))
    .pipe(rev())
    .pipe(gulp.dest(imgMin))
    .pipe(rev.manifest({path:'img-manifest.json'}))
    .pipe(gulp.dest('build'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
//  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.images, ['images']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'images']);
