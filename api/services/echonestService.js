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

      req.on('success', function(data) {
        deferred.resolve(_.map(data.response.artists, artistFactory.fromEchonest));
      });

      req.on('fail', function(data, response) {
        deferred.reject({
          status: response.statusCode,
          code: data.response.status.code,
          message: data.response.status.message,
        });
      });

      return deferred.promise;
    }
  };
})();
