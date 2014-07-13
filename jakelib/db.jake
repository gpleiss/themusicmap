var async = require('async')
  , echojs = require('echojs');

var mapConfig = require('../config/map').mapConfig
  , Artist = require('../api/models/artist');

var echo = echojs({key: process.env.ECHONEST_KEY});


namespace('db', function() {
  task('drop', function drop() {
    Artist.remove({}, function(err) {
      if (err) { throw new Error(err); }
      jake.logger.log("Artists database cleared");
      complete();
    });
  }, {async: true});

  task('seed', function seed() {
    Artist.count(function (err, count) {
      if (err) { jake.logger.error(err); }

      if (count == 0) {
        jake.logger.log("Seeding database...");
        echo('artist/search').get({
          bucket: 'familiarity',
          sort: 'familiarity-desc',
          results: mapConfig.numSeedArtists
        }, function (err, json) {
          if (err) { jake.logger.error(err); }
          async.mapSeries(json.response.artists, findOrCreateArtist, function(err, artists) {
            if (err) { jake.logger.error(err); }
            async.eachSeries(artists, findSimilarArtists, function(err) {
              if (err) { jake.logger.error(err); }
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
});


function findOrCreateArtist(artistData, callback) {
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
}

function findSimilarArtists(artist, callback) {
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
        findSimilarArtists(artist, callback);
      }, 20000);
    }
    else if (err) {
      jake.logger.error(err);
    }
    else {
      async.map(json.response.artists, findOrCreateArtist, function(err, similarArtists) {
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
