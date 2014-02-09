var mongoose = require('mongoose')
  , echojs = require('echojs')
  , async = require('async')
  , config = require('./config/config')[process.env.ENV]
  , mapConfig = require('./config/map').mapConfig
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

var _findSimilarArtists = function(artist, callback) {
  echo('artist/similar').get({
    id: artist.echonestId,
    max_familiarity: artist.familiarity * mapConfig.similarArtistAttrs.maxFamiliarityPerc,
    min_familiarity: artist.familiarity * mapConfig.similarArtistAttrs.minFamiliarityPerc,
    bucket: 'familiarity',
    results: mapConfig.similarArtistAttrs.numSimilarArtists,
  },
  function (err, json) {
    if (err && err == 429) {
      jake.logger.log("Rate limit hit. Trying again in 20 seconds...");
      setTimeout(function() {
        _findSimilarArtists(artist, callback);
      }, 20000);
    }
    else if (err) {
      fail(err);
    }
    else {
      async.map(json.response.artists, _findOrCreateArtist, function(err, similarArtists) {
        if (similarArtists[0] && similarArtists[0] != undefined) {
          artist.similar = similarArtists;
        }
        artist.save(function(err) {
          if (err) { throw new Error(err); }
          jake.logger.log(artist);
          callback();
        });
      });
    }
  });
}

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
        results: mapConfig.numSeedArtists
      }, function (err, json) {
        if (err) { fail(err); }
        async.mapSeries(json.response.artists, _findOrCreateArtist, function(err, artists) {
          if (err) { fail(err); }
          async.eachSeries(artists, _findSimilarArtists, function(err) {
            if (err) { fail(err); }
            complete();
          });
        });
      });
    }

    else {
      jake.logger.log("Database already seeded");
      complete();
    }
  });
}, {async: true});
