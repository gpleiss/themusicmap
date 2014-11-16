var mongoose = require('mongoose');
var q = require('q');

var config = require('./config/config');
var Artist = require('./api/models/artist');

jake.addListener('start', function () {
  mongoose.connect(config.db);
  jake.logger.log("Connected to database");
});

jake.addListener('complete', function () {
  mongoose.disconnect();
  jake.logger.log("Completed")
});

namespace('db', function() {
  task('drop', destroyAllArtists, {async: true});
});

function destroyAllArtists() {
  q.ninvoke(Artist, 'remove', {})
  .then(function() {
    jake.logger.log('Artist database cleared');
    complete();
  })
  .catch(fail);
}
