var _ = require('lodash');
var q = require('q');

var echonestService = require('../api/services/echonestService');

'use strict';

namespace('echonest', function() {
  task('addSeedArtists', addSeedArtists, {async: true});
});

function addSeedArtists() {
  echonestService.getFamiliarArtists({
    numArtists: 75
  })

  .then(function(seedArtists) {
    return q.all(_.map(seedArtists, function(artist) {
      jake.logger.log('Adding ' + artist.name);
      return q.ninvoke(artist, 'save');
    }));
  })

  .then(function(seedArtistData) {
    var seedArtists = _.map(seedArtistData, _.first);
    return q.all(_.map(seedArtists, function(artist, i) {
      return addSimilarArtistsFor(artist, i*1000);
    }));
  })

  .then(complete)

  .catch(function(err) {
    jake.logger.log(err);
    fail(err);
  });
}

function addSimilarArtistsFor(artist, delay) {
  return q.delay(delay).then(function() {
    jake.logger.log('Finding similar for ' + artist.name);

    return echonestService.getSimilarArtists(artist, {
      maxFamiliarityPerc: 1.03,
      minFamiliarityPerc: 0.93,
      numSimilarArtists: 5
    });
  })

  .progress(jake.logger.log)

  .then(function(similarArtists) {
    return q.all(_.map(similarArtists, function(similarArtist) {
      jake.logger.log('Adding ' + similarArtist.name);
      return q.ninvoke(similarArtist, 'save');
    }));
  })

  .then(function(similarArtists) {
    similarArtists = _.map(similarArtists, _.first);
    artist.similar = similarArtists;
    jake.logger.log('Updating ' + artist.name);
    return q.ninvoke(artist, 'save');
  })

  .catch(function(err) {
    jake.logger.log(err);
    fail(err);
  });
}
