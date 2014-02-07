var mongoose = require('mongoose')
  , echojs = require('echojs')
  , async = require('async')
  , config = require('./config/config')[process.env.ENV]
  , Artist = require('./models/artist').Artist;

var echo = echojs({key: process.env.ECHONEST_KEY});


jake.addListener('start', function () {
  mongoose.connect(config.db);
  jake.logger.log("Connected to database");
});

jake.addListener('complete', function () {
  mongoose.disconnect();
  jake.logger.log("Completed")
});

var _findOrCreateArtist = function(artistData, callback) {
  Artist.findOne({ echonestId: artistData.id }, function (err, existingArtist) {
    if (err) { throw new Error(err); }

    if (!existingArtist) {
      var artist = new Artist({
        echonestId: artistData.id,
        name: artistData.name,
        familiarity: artistData.familiarity,
      });
      artist.save(function(err) {
        if (err) { console.error(err); }
        callback(null, artist);
      });
    } else {
      callback(null, existingArtist);
    }
  });
};

task('drop', function () {
  Artist.remove({}, function(err) {
    if (err) { throw new Error(err); }
    jake.logger.log("Artists database cleared");
    complete();
  });
}, {async: true});

task('seed', function () {
  Artist.count(function (err, count) {
    if (err) { fail(err); }

    if (count == 0) {
      jake.logger.log("Seeding database...");
      echo('artist/search').get({
        bucket: 'familiarity',
        sort: 'familiarity-desc',
        results: 10
      }, function (err, json) {
        if (err) { fail(err); }
        async.eachSeries(json.response.artists, _findOrCreateArtist, complete);
      });
    }

    else {
      jake.logger.log("Database already seeded");
      complete();
    }
  });
}, {async: true});

task('expand', ['seed'], function () {
  async.forever(function (callback) {
    Artist.findOne({$query: {processed: false}, $orderby: {'familiarity': -1}}, function (err, artist) {
      if (err) { fail(err); }

      echo('artist/similar').get({
        id: artist.echonestId,
        max_familiarity: artist.familiarity,
        min_familiarity: artist.familiarity * 0.7,
        bucket: 'familiarity',
        results: 5,
      },
      function (err, json) {
        if (err && err == 429) {
          fail("Rate limit hit.");
        }
        else if (err) {
          fail(err);
        }
        else {
          async.map(json.response.artists, _findOrCreateArtist, function(err, similarArtists) {
            artist.processed = true;
            if (similarArtists[0] && similarArtists[0] != undefined) {
              artist.similar = similarArtists;
            }
            artist.save(function(err) {
              jake.logger.log(artist);
              if (err) { throw new Error(err); }
              callback();
            });
          });
        }
      });
    });
  }, function (err) {
    if (err) { fail(err); }
    complete();
  });
}, {async: true});
