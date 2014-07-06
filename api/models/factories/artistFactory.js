var Artist = require('../../../models/artist').Artist;

(function() {
  'use strict';

  module.exports = {
    fromEchonest: function(data) {
      return new Artist({
        echonestId: data.id,
        name: data.name,
        familiarity: data.familiarity,
      });
    }
  }
})();
