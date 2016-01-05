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
  gulp.task('clean', function (cb) {
    return del(['builds'], cb);
  });

  // html
  gulp.task('html', function () {

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
            $.rev(),
            $.size({
              title: 'js file',
              showFiles: true
            })
          ]
        }))
        .pipe(gulp.dest('builds/' + gutil.env.build))
        .pipe($.size())
        .on('error', gutil.log);

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
            $.stripDebug(),
            $.uglify(),
            $.rev(),
            $.size({
              title: 'js file',
              showFiles: true
            })
          ]
        }))
        .pipe(gulp.dest('builds/' + gutil.env.build))
        .pipe($.size())
        .on('error', gutil.log);

    } else {

      return gulp.src([config.app + '/index.html'])
        .pipe(gulp.dest('builds/' + gutil.env.build))
        .pipe($.size())
        .on('error', gutil.log);

    }

  });

  /**
  * @description generate templates through templatescache
  */
  gulp.task('template', function () {

    return gulp.src([config.app + '/views/**/*.html'])
      .pipe(templateCache('./', {
        module: 'sicklifes',
        standalone: false,
        root: 'views/'
      }))
      .pipe(gulp.dest(config.app + '/js/templates/templateCache.js'))
      .pipe($.size())
      .on('error', gutil.log);

  });

  /**
  * @description converts sass to css
  */
  gulp.task('sass', function () {

    return gulp.src([config.app + '/sass/*.scss'])
      .pipe($.sass({
        outputStyle: 'expanded'
      }))
      .pipe(gulp.dest(config.app + '/css/'))
      .pipe($.size());

  });

  /**
  * @description moves css files to builds
  */
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

  gulp.task('vendor-css', function () {

    return gulp.src([config.app + '/vendor-css/**/*.css'])
      .pipe(gulp.dest('builds/' + gutil.env.build + '/css/'))
      .pipe($.size({
        title: 'css',
        showFiles: false
      }))
      .on('error', gutil.log);

  });

  gulp.task('js', ['template'], function () {

    if (gutil.env.build !== 'prod' && gutil.env.build !== 'release') {

      return gulp.src([config.app + '/js/**/*.js'])
        .pipe(gulp.dest('builds/' + gutil.env.build + '/js/'))
        .pipe($.size({
          title: 'js',
          showFiles: true
        }))
        .on('error', gutil.log);

    }

  });

  gulp.task('bower-all', function () {

    if (gutil.env.build !== 'prod' && gutil.env.build !== 'release') {
      return gulp.src([config.app + '/bower_components/**/*.{js,css}'])
        .pipe(gulp.dest('builds/' + gutil.env.build + '/bower_components/'))
        .pipe($.size({
          title: 'bower',
          showFiles: false
        }))
        .on('error', gutil.log);
    }

  });

  gulp.task('fonts', function () {

    return gulp.src(config.app + '/bower_components/**/*.{woff,ttf,svg,eot}')
      .pipe($.size({
        title: 'fonts',
        showFiles: false
      }))
      .pipe(gulp.dest('builds/' + gutil.env.build + '/bower_components/'))
      //.pipe(gulp.dest('builds/' + gutil.env.build + '/fonts/'))
      .on('error', gutil.log);

  });

  gulp.task('images', function () {

    return gulp.src(config.app + '/images/**/*.{jpg,png,gif}')
      // .pipe($.imagemin({
      //   optimizationLevel: 1
      // }))
      // .pipe($.size({
      //   title: 'images',
      //   showFiles: false
      // }))
      .pipe(gulp.dest('builds/' + gutil.env.build + '/images/'))
      .on('error', gutil.log);

  });

  // clean
  gulp.task('clean-templatecache', function () {

    return gulp.src([config.app + '/js/templates/templateCache.js'], { read: false }).pipe($.clean({ force: true }))
      .pipe($.size())
      .on('error', gutil.log);

  });

  /**
   * build-GUI
   */
  gulp.task('build-GUI', function (cb) {

    runSequence(
      'js',
      'css',
      'html',
      'bower-all',
      //'images',
      'fonts',
      cb);

  });

  /**
   * build
   */
  gulp.task('build', function (cb) {

    runSequence(
      'clean',
      'start',
      'build-GUI',
      'browser-sync',
      'watch',
      cb);

  });

  gulp.task('re-build-GUI', function (cb) {

    runSequence(
      'start',
      'build-GUI',
      'bs-reload',
      cb);

  });

  gulp.task('deploy', function (cb) {

    runSequence(
      'clean',
      'start',
      'build-GUI',
      cb);

  });

  /**
   * watch
   */
  gulp.task('watch', function () {

    // Watch all .html files
    gulp.watch([config.app + '/views/**/*.html', config.app + '/index.html'], ['re-build-GUI']);

    // Watch .scss files
    gulp.watch([config.app + '/sass/**/*.scss'], ['re-build-GUI']);

    // Watch .js files
    gulp.watch([config.app + '/js/**/*.js', config.app + '/js/*.js', '!' + config.app + '/js/templates/templatescache.js'], ['re-build-GUI']);

    // Watch image files
    gulp.watch([config.app + '/images/**/*.{png,jpg,gif}'], ['re-build-GUI']);

  });

  gulp.task('bs-reload', function () {
    browserSync.reload();
  });

  gulp.task('browser-sync', function () {

    browserSync({
      open: gutil.env.open == true,
      port: port,
      server: {
        baseDir: 'builds/' + gutil.env.build
      }
    });

  });

  gulp.task('default', ['build']);

  module.exports = gulp; // for chrome gulp dev-tools

})();
