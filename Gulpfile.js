var gulp = require('gulp');
var gutil = require('gulp-util');
var mongoose = require('mongoose');
var q = require('q');

var app = require('./app');
var config = require('./config/config');
var db = process.env.MONGOLAB_URI || config.db;
var port = process.env.PORT || config.port;

gulp.task('default', [
  'serve',
]);

gulp.task('serve', function() {
  return q.ninvoke(mongoose, 'connect', db)
  .then(function() {
    gutil.log('Connected to mongo db ' + db);
    return q.ninvoke(app, 'listen', port);
  })
  .then(function() {
    gutil.log('Started to express server on port ' + port);
  })
  .fail(function(err) {
    gutil.log(err);
    process.exit(1);
  });
});
