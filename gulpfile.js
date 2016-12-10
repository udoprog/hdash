var source = require('vinyl-source-stream');
var gulp = require('gulp');
var babelify = require('babelify');
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');
var del = require('del');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var browserify = require('browserify');
var watchify = require('watchify');
var webserver = require('gulp-webserver');
var sourcemaps = require('gulp-sourcemaps');
var watchLess = require('gulp-watch-less');
var tsify = require('tsify');

var production = process.env.NODE_ENV === 'production';

gulp.task('clean', function() {
    del.sync('dist');
});

gulp.task('default', ['serve']);

gulp.task('build', function(){
  staticContent(false);
  scripts(false);
  stylesheets(false);
});

gulp.task('watch', function() {
  staticContent(true);
  scripts(true);
  stylesheets(true);
});

gulp.task('serve', function() {
  staticContent(false);
  scripts(true);
  stylesheets(true);

  gulp.src('dist')
    .pipe(webserver({
      livereload: true,
      open: true,
      fallback: 'index.html'
    }));
});

function stylesheets(doWatch) {
  var bundle = gulp.src('src/**/*.less');

  if (doWatch) {
    bundle = bundle.pipe(watchLess('src/main.less'));
  }

  bundle = bundle
    .pipe(less({
       paths: ['./node_modules']
     }));

  if (production) {
    bundle = bundle.pipe(cssnano());
  }

  bundle.pipe(gulp.dest('dist'));
}

function scripts(doWatch) {
  var bundler, rebundle;

  bundler = browserify('./src/main.tsx', {
    basedir: __dirname,
    debug: !production,
    cache: {},
    packageCache: {},
    fullPaths: doWatch,
    extensions: ['.tsx']
  });

  if (doWatch) {
    bundler = watchify(bundler);
  }

  bundler = bundler
    .plugin(tsify, {
      jsx: 'react',
      target: 'es5',
      baseUrl: './src'
    });

  rebundle = function(files) {
    if (files) {
      files.forEach(function(file) {
        gutil.log("File Updated:", file);
      });
    }

    return bundler.bundle()
      .on('error', function(e) {
        gutil.log("Browserify Error:", e.toString());
      })
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('dist'));
  };

  bundler.on('update', rebundle);
  return rebundle();
}

function staticContent(doWatch) {
  var bundle;

  if (doWatch) {
    bundle = watch('src/**/*.html');
  } else {
    bundle = gulp.src('src/**/*.html');
  }

  bundle.pipe(gulp.dest('dist'));
}
