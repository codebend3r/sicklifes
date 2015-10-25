/**
 * Updated by crivas on 11/07/2014.
 */

(function () {

  'use strict';

  /* global require:true */

  var gulp = require('gulp'),
    pkg = require('./package.json'),
    config = {
      app: 'app',
      target: 'builds',
      dev: 'builds/dev',
      prod: 'builds/prod',
      release: 'builds/release'
    },
    port = 8880,
    gutil = require('gulp-util'),
    del = require('del'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    runSequence = require('run-sequence'),
    templateCache = require('gulp-angular-templatecache'),
    $ = require('gulp-load-plugins')();

  //=============================================
  // TASKS
  //=============================================

  // start
  gulp.task('start', function () {

    if (typeof gutil.env.build === 'undefined') gutil.env.build = 'dev';

    if (gutil.env.build === 'prod') {

      gutil.log(gutil.colors.yellow('--------------------------'));
      gutil.log(gutil.colors.yellow('PROD BUILD'));
      gutil.log(gutil.colors.yellow('--------------------------'));

    } else if (gutil.env.build === 'release') {

      gutil.log(gutil.colors.green('--------------------------'));
      gutil.log(gutil.colors.green('RELEASE BUILD'));
      gutil.log(gutil.colors.green('--------------------------'));

    } else if (gutil.env.build === 'dev') {

      gutil.log(gutil.colors.cyan('--------------------------'));
      gutil.log(gutil.colors.cyan('DEV BUILD'));
      gutil.log(gutil.colors.cyan('--------------------------'));

    } else {

      gutil.error('--build option undefined or invalid');

    }

  });

  // clean
  gulp.task('clean', function(cb) {
    return del(['builds'], cb);
  });

  // html
  gulp.task('html', ['js', 'css'], function () {

    if (gutil.env.build === 'prod') {

      return gulp.src([config.app + '/index.html'])
        .pipe($.usemin({
          css: [
            $.rev(),
            $.size({
              title: 'css file',
              showFiles: true
            })
          ],
          js: [
            $.ngAnnotate(),
            $.rev(),
            $.size({
              title: 'js file',
              showFiles: true
            })
          ]
        }))
        .pipe(gulp.dest(config.prod))
        .pipe($.size());

    } else if (gutil.env.build === 'release') {

      return gulp.src([config.app + '/index.html'])
        .pipe($.usemin({
          css: [
            $.csso(),
            $.rev(),
            $.size({
              title: 'css file',
              showFiles: true
            })
          ],
          js: [
            $.ngAnnotate(),
            $.uglify(),
            $.rev(),
            $.size({
              title: 'js file',
              showFiles: true
            })
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

  // partials
  gulp.task('partials', function () {

    return gulp.src([config.app + '/views/**/*.html'])
      .pipe(gulp.dest('builds/' + gutil.env.build + '/views/'))
      .pipe($.size());

  });

  // modal-views
  gulp.task('modal-views', function () {

    return gulp.src([config.app + '/views/modal/*.html'])
      .pipe(gulp.dest('builds/' + gutil.env.build + '/views/modal/'))
      .pipe($.size({
        title: 'modal views',
        showFiles: false
      }));

  });

  // template
  gulp.task('template', function () {

    return gulp.src([config.app + '/views/**/*.html'])
      .pipe(templateCache('./', {
        module: 'sicklifes',
        standalone: false,
        root: 'views/'
      }))
      .pipe(gulp.dest(config.app + '/js/templates/templateCache.js'))
      .pipe($.size());

  });

  // sass
  gulp.task('sass', function () {

    return gulp.src([config.app + '/sass/*.scss'])
      .pipe($.sass({
        outputStyle: 'expanded'
      }))
      .pipe(gulp.dest(config.app + '/css/'))
      .pipe($.size());

  });

  // css
  gulp.task('css', ['sass'], function () {

    if (gutil.env.build !== 'prod' && gutil.env.build !== 'release') {

      return gulp.src([config.app + '/css/**/*.css'])
        .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('builds/' + gutil.env.build + '/css/'))
        .pipe($.size({
          title: 'css',
          showFiles: false
        }));

    }

  });

  // js (partials or template)
  gulp.task('js', ['template'], function () {

    if (gutil.env.build !== 'prod' && gutil.env.build !== 'release') {
      return gulp.src([config.app + '/js/**/*.js'])
        .pipe(gulp.dest('builds/' + gutil.env.build + '/js/'))
        .pipe($.size({
          title: 'js',
          showFiles: false
        }));
    }

  });

  // bower
  gulp.task('bower-all', function () {

    if (gutil.env.build !== 'release') {
      return gulp.src([config.app + '/bower_components/**/*.{js,css}'])
        .pipe(gulp.dest('builds/' + gutil.env.build + '/bower_components/'))
        .pipe($.size({
          title: 'bower',
          showFiles: false
        }));

    }

  });

  // fonts
  gulp.task('fonts', function () {

    return gulp.src(config.app + '/bower_components/**/*.{woff,ttf,svg,eot}')
      .pipe(gulp.dest('builds/' + gutil.env.build + '/fonts/'))
      .pipe($.size({
        title: 'fonts',
        showFiles: false
      }));

  });

  // images
  gulp.task('images', function () {

    return gulp.src([config.app + '/images/**/*.{jpg,png,gif}'])
      .pipe(gulp.dest('builds/' + gutil.env.build + '/images/'))
      .pipe($.size({
        title: 'images',
        showFiles: false
      }));

  });

  // clean
  gulp.task('clean-templatecache', function () {
    return gulp.src([config.app + '/js/templates/templateCache.js'], { read: false }).pipe($.clean({ force: true }))
      .pipe($.size());
  });

  /**
   * build-GUI
   */
  gulp.task('build-GUI', function (callback) {

    runSequence(
      'html',
      'bower-all',
      'modal-views',
      'images',
      'fonts',
      callback);

  });

  /**
   * build
   */
  gulp.task('build', function (callback) {
    runSequence(
      'clean',
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

  gulp.task('deploy', function (callback) {
    runSequence(
      'clean-all',
      'start',
      'build-GUI',
      callback);
  });

  /**
   * watch
   */
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
        port: port,
        server: {
          baseDir: config.prod
        }
      });

    } else if (gutil.env.build === 'release') {

      browserSync({
        open: gutil.env.open === true,
        port: port,
        server: {
          baseDir: config.release
        }
      });

    } else {

      browserSync({
        open: gutil.env.open === true,
        port: port,
        server: {
          baseDir: config.dev
        }
      });

    }

  });

  gulp.task('default', ['build']);

  module.exports = gulp; // for chrome gulp dev-tools

})();
