var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var istanbul = require('gulp-babel-istanbul');
var mergeStream = require('merge-stream');
var path = require('path');
var webpack = require('webpack');
var nodemon = require('nodemon');
var WebpackNode = require('./webpack.node.babel');
//Test
var mocha = require('gulp-mocha');
var util = require('gulp-util');

function onBuild(done) {
  return function(err, stats) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log(stats.toString());
    }

    if(done) {
      done();
    }
  }
}

function swallowError (error) {

  // If you want details of the error in the console
  console.log(error.toString());

  this.emit('end');
}

gulp.task('build', function(done) {
  webpack(WebpackNode).run(onBuild(done));
});

gulp.task('watch', function() {
  webpack(WebpackNode).watch(100, function(err, stats) {
    onBuild()(err, stats);
    nodemon.restart();
  })
});

gulp.task('test', function(cb) {
  mergeStream(
    gulp.src(['./app/**/*.js', './app/*.js', './server.js'])
        .pipe(istanbul())
        .on('error', swallowError),
    gulp.src(['./test/**/*.js'])
        .pipe(babel(
          {presets: ['es2015'],
          plugins: ['transform-runtime']}
        ))
        .on('error', swallowError)
  ).pipe(plumber())
        .pipe(istanbul.hookRequire())
        .on('error', swallowError)
        .on('finish', function () {
          gulp.src(['./test/**/*.test.js'])
              .pipe(mocha())
              .on('error', swallowError)
              .pipe(istanbul.writeReports()) // Creating the reports after tests ran 
              .on('error', swallowError)
              .on('end', cb);
        });  
});

gulp.task('watch-test', function() {
  gulp.watch(['./app/**/*.js', './test/**/*.js'], function() {
    gulp.run('test', function() {
      console.log('Test rerun');
    })
  })
});

gulp.task('run', ['watch'], function() {
  nodemon({
    execMap: {
      js: 'node'
    },
    script: path.join(__dirname, 'build/backend'),
    ignore: ['*'],
    watch: ['./'],
    ext: 'noop'
  }).on('restart', function() {
    console.log('Restarted!');
  });
})
