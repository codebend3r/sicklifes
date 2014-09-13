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
  gulpif = require('gulp-if'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  templateCache = require('gulp-angular-templatecache'),
  $ = require('gulp-load-plugins')();

//=============================================
// TASKS
//=============================================

gulp.task('set-to-dev', function () {
  env = 'dev';
});

gulp.task('set-to-prod', function () {
  env = 'prod';
});

gulp.task('set-to-release', function () {
  env = 'release';
});

// HTML
gulp.task('html', function () {
  return gulp.src([ config.app + '/index.html' ])
    // RELEASE
    .pipe(gulpif(env === 'release',
      $.usemin({
        css: [
          $.csso(),
          $.rev()
        ],
        js: [
          $.ngmin(),
          $.uglify(),
          $.rev()
        ]
      })
    ))
    .pipe(gulpif(env === 'release',
      gulp.dest(config.release)
    ))
    // PROD
    .pipe(gulpif(env === 'prod',
      $.usemin({
        css: [$.rev()],
        js: [$.rev()]
      })
    ))
    .pipe(gulpif(env === 'prod',
      gulp.dest(config.prod)
    ))
    // DEV
    .pipe(gulpif(env === 'dev',
      gulp.dest(config.dev)
    ))

});

gulp.task('partials', function () {
  return gulp.src([ config.app + '/views/**/*.html' ])
    .pipe(gulpif(env === 'release',
      gulp.dest(config.release)
    ))
    .pipe(gulpif(env === 'prod',
      gulp.dest(config.prod)
    ))
    .pipe(gulpif(env === 'dev',
      gulp.dest(config.dev + '/views')
    ))

});

gulp.task('template', function () {
  gulp.src([config.app + '/views/**/*.html'])
    .pipe(templateCache('./', {
      module: 'sicklifesApp',
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
  return gulp.src([config.app + '/css/**/*.css'])
    .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest(config.dev + '/css/'))

});

// JS
gulp.task('scripts', function () {
  return gulp.src([ config.app + '/js/**/*.js' ])
    .pipe(gulp.dest(config.dev + '/js/'))

});

// Bower
gulp.task('bower-all', function () {
  return gulp.src([ config.app + '/bower_components/**/*.{js,css}' ])
    .pipe(gulp.dest(config.dev + '/bower_components/'))

});

// Images
gulp.task('images', function () {
  return gulp.src(config.app + '/images/**/*.{png,jpg,gif,svg}')
    .pipe(gulpif(env === 'dev',
      gulp.dest(config.dev + '/images/')
    ))
    .pipe(gulpif(env === 'prod',
      $.imagemin({
        optimizationLevel: 2,
        progressive: true,
        interlaced: true
      })
    ))
    .pipe(gulpif(env === 'prod',
      gulp.dest(config.prod + '/images/')
    ))
    .pipe(gulpif(env === 'release',
      $.imagemin({
        optimizationLevel: 1,
        progressive: true,
        interlaced: true
      })
    ))
    .pipe(gulpif(env === 'release',
      gulp.dest(config.release + '/images/')
    ))

});


// Clean

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

gulp.task('move-GUI-images', [ 'images' ], function () {
  return gulp.src([config.dev + '/images/**/*.{png,jpg,gif,svg}'])
    .pipe(gulp.dest(config.dev + '/images'));
});

// Build
gulp.task('build', [
    'css',
    'partials',
    'html',
    'scripts',
    'bower-all'
    //'images'
  ]
);


gulp.task('build-prod', [
  'css',
  'html',
  'images'
]);

gulp.task('build-release', [
  'css',
  'html',
  'images'
]);

// Karma - Unit
gulp.task('karma', function () {
  gulp.src(['test/unit/**/*.js'])
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }));

});

gulp.task('protractor', function () {
  gulp.src(['test/e2e/*.js'])
    .pipe($.protractor.protractor({
      configFile: 'protractor.conf.js',
      debug: false
    }));
});

// Watch
gulp.task('watch', [ 'browser-sync' ], function () {

  // Watch all .html files
  gulp.watch([config.app + '/views/**/*.html', config.app + '/index.html'], [ 'set-to-dev', 'build' ]);

  // Watch .scss files
  gulp.watch(config.app + '/sass/**/*.scss', [ 'set-to-dev', 'build' ]);

  // Watch .js files
  gulp.watch([config.app + '/js/**/*.js', config.app + '/js/*.js', '!' + config.app + '/js/templates/templatescache.js'], [ 'set-to-dev', 'build' ]);

  // Watch image files
  gulp.watch(config.app + '/images/**/*.{png,jpg,gif}', [ 'set-to-dev', 'build' ]);

});


gulp.task('bs-reload', function () {
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

gulp.task('default', [ 'set-to-dev', 'watch' ]);

module.exports = gulp; // for chrome gulp dev-tools