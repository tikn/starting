// loading gulp and plugins
var gulp = require('gulp'),
    changed = require('gulp-changed'),
    connect = require('gulp-connect'),
    deporder = require('gulp-deporder'),
    concat = require('gulp-concat'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    pleeease = require('gulp-pleeease'),
    jshint = require('gulp-jshint'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify');

// file location
// using: export NODE_ENV=production
var devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production');

// logging environment
console.log('Environment: ' + (devBuild ? 'development' : 'production'));

// root
var SOURCE = 'src/',
    DEST = 'dist/';

// Connect, default port: 8080
gulp.task('connect', function() {
    connect.server({
      root: DEST,
      // port: 8000,
      livereload: true
    });
});

// HTML
var HTML = {
  IN: SOURCE + 'jade/*.jade',
  OUT: DEST,
  OPTIONS: {
    pretty: true
  }
};
gulp.task('html', function() {
  return gulp.src(HTML.IN)
    .pipe(jade(HTML.OPTIONS))
    .pipe(gulp.dest(HTML.OUT))
    .pipe(connect.reload());
});

// CSS
var CSS = {
  IN: SOURCE + 'stylus/*.styl',
  OUT: DEST + 'css',
  OPTIONS: {
    compress: false
  },
  PLEASE : {
    autoprefixer: { browsers: ['last 2 versions', '> 2%'] },
    rem: ['16px'],
    colors: true,
    pseudoElements: true,
    stylus: true,
    minifier: false
  }
};
gulp.task('css', function() {
  return gulp.src(CSS.IN)
    .pipe(stylus(CSS.OPTIONS))
    .pipe(pleeease(CSS.PLEASE))
    .pipe(gulp.dest(CSS.OUT))
    .pipe(connect.reload());
});

// Copy images
var IMG = {
  IN: SOURCE + 'img/*.*',
  OUT: DEST + 'img'
};
gulp.task('images', function() {
  return gulp.src(IMG.IN)
    .pipe(changed(IMG.OUT))
    .pipe(gulp.dest(IMG.OUT))
    .pipe(connect.reload());
});

// Copy fonts
var FONTS = {
  IN: SOURCE + 'fonts/*.*',
  OUT: DEST + 'fonts'
};
gulp.task('fonts', function() {
  return gulp.src(FONTS.IN)
    .pipe(changed(FONTS.OUT))
    .pipe(gulp.dest(FONTS.OUT))
    .pipe(connect.reload());
});

// JS
var JS = {
  IN: SOURCE + 'js/*.js',
  OUT: DEST + 'js',
  CONCATE: 'app-concate.js',
  LIBS: {
    IN: SOURCE + 'js/lib/*.js',
    OUT: DEST + 'js/lib',
    NAME: 'scripts.js'
  }
};
gulp.task('js', function() {
  if (devBuild) {
    return gulp.src(JS.IN)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(jshint.reporter('fail'))
      .pipe(gulp.dest(JS.OUT))
      .pipe(connect.reload());
  } else {
    return gulp.src(JS.IN)
      .pipe(deporder())
      .pipe(concat(JS.CONCATE))
      .pipe(stripdebug())
      .pipe(uglify())
      .pipe(gulp.dest(JS.OUT));
  }
});
// Minify and concatenate libraries/dependencies
gulp.task('libs', function() {
  return gulp.src(JS.LIBS.IN)
    .pipe(changed(JS.LIBS.OUT))
    .pipe(deporder())
    .pipe(concat(JS.LIBS.NAME))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(gulp.dest(JS.LIBS.OUT));
});

// Default taks
gulp.task('default',['html', 'css', 'images', 'fonts', 'js', 'libs', 'connect'], function() {

  gulp.watch(HTML.IN, ['html']);

  gulp.watch(CSS.IN, ['css']);

  gulp.watch(IMG.IN, ['images']);

  gulp.watch(FONTS.IN, ['fonts']);

  gulp.watch(JS.IN, ['js']);
  
  gulp.watch(JS.LIBS.IN, ['libs']);

});