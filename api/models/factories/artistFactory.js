var q = require('q');

var Artist = require('../../../api/models/artist');

(function() {
  'use strict';

  module.exports = {
    fromEchonest: function fromEchonest(data) {
      var deferred = q.defer();

      Artist.findOne({ echonestId: data.id }, function(err, artist) {
        if (err) {
          deferred.reject(err);
        } else if (artist) {
          deferred.resolve(artist);
        } else {
          deferred.resolve(new Artist({
            echonestId: data.id,
            name: data.name,
            familiarity: data.familiarity,
          }));
        }
      });

      return deferred.promise;
    }
  }
})();
