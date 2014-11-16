var config = require('../../config/config'),
    artistFactory = require('../../api/models/factories/artistFactory'),
    restler = require('restler'),
    _ = require('lodash'),
    q = require('q');

(function() {
  'use strict';

  module.exports = {
    getFamiliarArtists: function getFamiliarArtists(args) {
      var numArtists = args.numArtists;

      var deferred = q.defer();

      var req = restler.get(config.echonest.endpoint + '/artist/search', {
        query: {
          api_key: config.echonest.apiKey,
          format: 'json',
          bucket: 'familiarity',
          sort: 'familiarity-desc',
          results: numArtists
        }
      });

      req.on('complete', function(data, response) {
        if (response && response.statusCode === 200) {
          q.all(_.map(data.response.artists, artistFactory.fromEchonest))
          .then(function(artists) {
            deferred.resolve(artists);
          });
        }
        else {
          response = response || {statusCode: 'unknown'};
          data.response = data.response || {status: {message: 'unknown'}};
          deferred.reject({
            status: response.statusCode,
            message: data.response.status.message,
          });
        }
      });

      return deferred.promise;
    },

    getSimilarArtists: function getSimilarArtists(artist, args) {
      var numSimilarArtists = args.numSimilarArtists;
      var maxFamiliarityPerc = args.maxFamiliarityPerc;
      var minFamiliarityPerc = args.minFamiliarityPerc;

      var deferred = q.defer();

      function makeRequest() {
        var req = restler.get(config.echonest.endpoint + '/artist/similar', {
          query: {
            api_key: config.echonest.apiKey,
            format: 'json',
            id: artist.echonestId,
            bucket: 'familiarity',
            results: numSimilarArtists,
            max_familiarity: artist.familiarity * maxFamiliarityPerc,
            min_familiarity: artist.familiarity * minFamiliarityPerc,
          }
        });

        req.on('complete', function(data, response) {
          if (response && response.statusCode === 200) {
            q.all(_.map(data.response.artists, artistFactory.fromEchonest))
            .then(function(similarArtists) {
              deferred.resolve(similarArtists);
            });
          }
          else if (response && response.statusCode === 429) {
            deferred.notify('Rate limit hit. Trying again in 20 seconds...');
            setTimeout(makeRequest, 20000);
          }
          else {
            response = response || {statusCode: 'unknown'};
            data.response = data.response || {status: {message: 'unknown'}};
            deferred.reject({
              status: response.statusCode,
              message: data.response.status.message,
            });
          }
        });
      }

      makeRequest();
      return deferred.promise;
    }
  };
})();
