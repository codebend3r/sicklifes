/**
 * Updated by crivas on 11/07/2014.
 */

'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  config = {
    app: 'app',
    target: 'builds',
    dev: 'builds/dev',
    prod: 'builds/prod',
    release: 'builds/release'
  },
  gutil = require('gulp-util'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  runSequence = require('run-sequence'),
  templateCache = require('gulp-angular-templatecache'),
  $ = require('gulp-load-plugins')();

//=============================================
// TASKS
//=============================================

gulp.task('start', function () {

  if (gutil.env.build === 'prod') {

    gutil.log(gutil.colors.yellow('***********************'));
    gutil.log(gutil.colors.yellow('PROD BUILD'));
    gutil.log(gutil.colors.yellow('***********************'));

  } else if (gutil.env.build === 'release') {

    gutil.log(gutil.colors.green('***********************'));
    gutil.log(gutil.colors.green('RELEASE BUILD'));
    gutil.log(gutil.colors.green('***********************'));

  } else {

    gutil.log(gutil.colors.cyan('***********************'));
    gutil.log(gutil.colors.cyan('DEV BUILD'));
    gutil.log(gutil.colors.cyan('***********************'));

  }

});

// HTML
gulp.task('html', ['js', 'css'], function () {

  if (gutil.env.build === 'prod') {

    return gulp.src([config.app + '/index.html'])
      .pipe($.usemin({
        css: [
          $.rev()
        ],
        js: [
          $.rev()
        ]
      }))
      .pipe(gulp.dest(config.prod))
      .pipe($.size());

  } else if (gutil.env.build === 'release') {

    return gulp.src([config.app + '/index.html'])
      .pipe($.usemin({
        css: [
          $.csso(),
          $.rev()
        ],
        js: [
          $.ngmin(),
          $.uglify(),
          $.rev()
        ]
      }))
      .pipe(gulp.dest(config.release))
      .pipe($.size());

  } else {

    return gulp.src([config.app + '/index.html'])
      .pipe(gulp.dest(config.dev))
      .pipe($.size());

  }

});

// PARTIALS
gulp.task('partials', function () {

  if (gutil.env.build === 'prod') {

    return gulp.src([config.app + '/views/**/*.html'])
      .pipe(gulp.dest(config.prod + '/views'))
      .pipe($.size());

  } else if (gutil.env.build === 'release') {

    return gulp.src([config.app + '/views/**/*.html'])
      .pipe(gulp.dest(config.release + '/views'))
      .pipe($.size());

  } else {

    return gulp.src([config.app + '/views/**/*.html'])
      .pipe(gulp.dest(config.dev + '/views'))
      .pipe($.size());

  }

});

gulp.task('modal-views', function () {

  if (gutil.env.build === 'prod') {

    return gulp.src([config.app + '/views/modal/*.html'])
      .pipe(gulp.dest(config.prod + '/views/modal'))
      .pipe($.size());

  } else if (gutil.env.build === 'release') {

    return gulp.src([config.app + '/views/modal/*.html'])
      .pipe(gulp.dest(config.release + '/views/modal'))
      .pipe($.size());

  } else {

    return gulp.src([config.app + '/views/modal/*.html'])
      .pipe(gulp.dest(config.dev + '/views/modal'))
      .pipe($.size());

  }

});

// TEMPLATE
gulp.task('template', function () {

  gulp.src([config.app + '/views/**/*.html'])
    .pipe(templateCache('./', {
      module: 'sicklifesFantasy',
      standalone: false,
      root: './views/'
    }))
    .pipe(gulp.dest(config.app + '/js/templates/templatescache.js'))
    .pipe($.size());

});

// SASS
gulp.task('sass', function () {

  return gulp.src([config.app + '/sass/*.scss'])
    .pipe($.sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest(config.app + '/css/'))
    .pipe($.size());

});

// CSS
gulp.task('css', ['sass'], function () {

  if (gutil.env.build !== 'prod' && gutil.env.build !== 'release') {

    return gulp.src([config.app + '/css/**/*.css'])
      .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
      .pipe(gulp.dest(config.dev + '/css/'))
      .pipe($.size());

  }

});

// JS (partials or template)
gulp.task('js', ['template'], function () {

  if (gutil.env.build !== 'prod' && gutil.env.build !== 'release') {
    return gulp.src([config.app + '/js/**/*.js'])
      .pipe(gulp.dest(config.dev + '/js/'))
      .pipe($.size());
  }

});

// Bower
gulp.task('bower-all', function () {

  if (gutil.env.build !== 'prod' && gutil.env.build !== 'release') {
    return gulp.src([config.app + '/bower_components/**/*.{js,css}'])
      .pipe(gulp.dest(config.dev + '/bower_components/'))
      .pipe($.size());

  }

});

// Fonts
gulp.task('fonts', function () {

  if (gutil.env.build === 'prod') {

    return gulp.src(config.app + '/bower_components/**/*.{woff,ttf}')
      .pipe(gulp.dest(config.prod + '/bower_components/'))
      .pipe($.size());

  } else if (gutil.env.build === 'release') {

    return gulp.src(config.app + '/bower_components/**/*.{woff,ttf}')
      .pipe(gulp.dest(config.release + '/bower_components/'))
      .pipe($.size());

  } else {

    return gulp.src(config.app + '/bower_components/**/*.{woff,ttf}')
      .pipe(gulp.dest(config.dev + '/bower_components/'))
      .pipe($.size());

  }

});

// Images
gulp.task('images', function () {

  if (gutil.env.build === 'prod') {

    return gulp.src([config.app + '/images/**/*.{jpg,png,gif}'])
      .pipe(gulp.dest(config.prod + '/images/'))
      .pipe($.size());

  } else if (gutil.env.build === 'release') {

    return gulp.src([config.app + '/images/**/*.{jpg,png,gif}'])
      .pipe(gulp.dest(config.release + '/images/'))
      .pipe($.size());

  } else {

    return gulp.src([config.app + '/images/**/*.{jpg,png,gif}'])
      .pipe(gulp.dest(config.dev + '/images/'))
      .pipe($.size());

  }

});

// Clean
gulp.task('clean-templatecache', function () {
  return gulp.src([config.app + '/js/templates/templatescache.js'], {read: false}).pipe($.clean({force: true}))
    .pipe($.size());
});

gulp.task('clean-all', function () {
  return gulp.src([config.target], {read: false}).pipe($.clean({force: false}))
    .pipe($.size());
});

/**
 * Builds GUI
 */
gulp.task('build-GUI', [
    'html',
    'bower-all',
    'modal-views',
    'images',
    'fonts'
  ]
);

/**
 * Runs in sequence
 */
gulp.task('build', function (callback) {
  runSequence(
    'start',
    'build-GUI',
    'watch',
    'browser-sync',
    callback);
});

gulp.task('re-build-GUI', function (callback) {
  runSequence(
    'start',
    'build-GUI',
    'bs-reload',
    callback);
});

// Watch
gulp.task('watch', function () {

  // Watch all .html files
  gulp.watch([config.app + '/views/**/*.html', config.app + '/index.html'], ['re-build-GUI']);

  // Watch .scss files
  gulp.watch(config.app + '/sass/**/*.scss', ['re-build-GUI']);

  // Watch .js files
  gulp.watch([config.app + '/js/**/*.js', config.app + '/js/*.js', '!' + config.app + '/js/templates/templatescache.js'], ['re-build-GUI']);

  // Watch image files
  gulp.watch(config.app + '/images/**/*.{png,jpg,gif}', ['re-build-GUI']);

});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('browser-sync', function () {

  if (gutil.env.build === 'prod') {

    browserSync({
      open: gutil.env.open === true,
      port: 8888,
      server: {
        baseDir: config.prod
      }
    });

  } else if (gutil.env.build === 'release') {

    browserSync({
      open: gutil.env.open === true,
      port: 8888,
      server: {
        baseDir: config.release
      }
    });

  } else {

    browserSync({
      open: gutil.env.open === true,
      port: 8888,
      server: {
        baseDir: config.dev
      }
    });

  }

});

gulp.task('default', ['build']);

module.exports = gulp; // for chrome gulp dev-tools