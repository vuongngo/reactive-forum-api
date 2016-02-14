var gulp = require('gulp');
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
    gulp.src(['app/**/*.js', 'app/*.js', 'server.js'])
        .pipe(istanbul()),
    gulp.src(['test/**/*.js'])
        .pipe(babel(
          {presets: ['es2015']}
        ))
  ).pipe(istanbul.hookRequire())
        .on('finish', function () {
          gulp.src(['test/**/*.js'])
              .pipe(mocha())
              .pipe(istanbul.writeReports()) // Creating the reports after tests ran 
              .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } })) // Enforce a coverage of at least 90% 
              .on('end', cb);
        });  
});

gulp.task('watch-test', function() {
  gulp.watch([path.join(__dirname, 'build/backend'), 'test/**/*.js'], function() {
    gulp.run('test', function() {
      console.log('Test rerun');
   }) 
  });
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
