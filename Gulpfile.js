/**
 * Updated by crivas on 9/12/2014.
 */

'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  config = {
    app: 'app',
    dev: 'builds/dev',
    prod: 'builds/prod',
    release: 'builds/release'
  },
  env = 'dev',
  gutil = require('gulp-util'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  templateCache = require('gulp-angular-templatecache'),
  $ = require('gulp-load-plugins')();

//=============================================
// TASKS
//=============================================

// HTML
gulp.task('html', [ 'template', 'css' ], function () {

  if (gutil.env.prod === true) {

    gutil.log(gutil.colors.yellow('PROD BUILD'));

    return gulp.src([ config.app + '/index.html' ])
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

  } else if (gutil.env.release === true) {

    gutil.log(gutil.colors.green('RELEASE BUILD'));

    return gulp.src([ config.app + '/index.html' ])
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

    gutil.log(gutil.colors.cyan('DEV BUILD'));

    return gulp.src([ config.app + '/index.html' ])
      .pipe(gulp.dest(config.dev))
      .pipe($.size());

  }

});

gulp.task('template', function () {

  gulp.src([config.app + '/views/**/*.html', '!' + config.app + '/views/directives/assets/*.html', '!' + config.app + '/views/assets.html'])
    .pipe(templateCache('./', {
      module: 'sicklifesFantasy',
      standalone: false,
      root: './views/'
    }))
    .pipe(gulp.dest(config.app + '/js/templates/templatescache.js'));

});

// SASS
gulp.task('sass', function () {

  return gulp.src([config.app + '/sass/*.scss'])
    .pipe($.sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest(config.app + '/css/'))

});

// CSS
gulp.task('css', [ 'sass' ], function () {

  if (gutil.env.dev === true) {

    return gulp.src([config.app + '/css/**/*.css'])
      .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
      .pipe(gulp.dest(config.dev + '/css/'))

  }

});

// JS
gulp.task('scripts', function () {

  if (gutil.env.dev === true) {
    return gulp.src([ config.app + '/js/**/*.js' ])
      .pipe(gulp.dest(config.dev + '/js/'))
  }

});

// Bower
gulp.task('bower-all', function () {

  if (gutil.env.dev === true) {
    return gulp.src([ config.app + '/bower_components/**/*.{js,css}' ])
      .pipe(gulp.dest(config.dev + '/bower_components/'))

  }

});


// Clean

gulp.task('clean-all', [
  'clean-templatecache',
  'clean-dev',
  'clean-prod',
  'clean-release'
]);

gulp.task('clean-templatecache', function () {
  return gulp.src([config.app + '/js/templates/templatescache.js'], { read: false }).pipe($.clean({force: true}));
});

gulp.task('clean-dev', function () {
  return gulp.src([config.dev, config.app + '/css/*.css'], { read: false }).pipe($.clean({force: false}));
});

gulp.task('clean-prod', function () {
  return gulp.src([config.prod, config.app + '/css/*.css'], { read: false }).pipe($.clean({force: false}));
});

gulp.task('clean-release', function () {
  return gulp.src([config.release, config.app + '/css/*.css'], { read: false }).pipe($.clean({force: false}));
});


// Export GUI

gulp.task('move-GUI-css', [ 'template', 'css' ], function () {
  return gulp.src([config.dev + '/css/*.css'])
    .pipe(gulp.dest(config.dev + '/css'));
});

gulp.task('move-GUI-js', [ 'template', 'scripts' ], function () {
  return gulp.src([config.dev + '/js/**/*.js'])
    .pipe(gulp.dest(config.dev + '/js'));
});

gulp.task('move-GUI-html', [ 'template' ], function () {
  return gulp.src([config.dev + '/index.html'])
    .pipe(gulp.dest(config.dev + '/index.html'));
});

gulp.task('move-view-html', [ 'template' ], function () {
  return gulp.src([config.dev + '/views/*.html', config.dev + '/views/**/*.html'])
    .pipe(gulp.dest(config.dev + '/index.html'));
});

gulp.task('move-GUI-images', [ 'images' ], function () {
  return gulp.src([config.dev + '/images/**/*.{png,jpg,gif,svg}'])
    .pipe(gulp.dest(config.dev + '/images'));
});

// Build
gulp.task('build', [
    'css',
    'html',
    'scripts',
    'bower-all'
  ]
);

// Watch
gulp.task('watch', [ 'browser-sync' ], function () {

  // Watch all .html files
  gulp.watch([config.app + '/views/**/*.html', config.app + '/index.html'], [ 'bs-reload' ]);

  // Watch .scss files
  gulp.watch(config.app + '/sass/**/*.scss', [ 'bs-reload' ]);

  // Watch .js files
  gulp.watch([config.app + '/js/**/*.js', config.app + '/js/*.js', '!' + config.app + '/js/templates/templatescache.js'], [ 'bs-reload' ]);

  // Watch image files
  gulp.watch(config.app + '/images/**/*.{png,jpg,gif}', [ 'bs-reload' ]);

});


gulp.task('bs-reload', [ 'build' ], function () {
  browserSync.reload();
});

gulp.task('browser-sync', [ 'build' ], function () {
  browserSync({
    open: false,
    port: 8888,
    server: {
      baseDir: config.dev
    }
  });
});

gulp.task('default', [ 'watch' ]);

module.exports = gulp; // for chrome gulp dev-tools