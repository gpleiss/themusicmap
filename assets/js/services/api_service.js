'use strict';

var q = require('q');
var request = require('superagent');

var ApiService = {
  getArtists: function getArtists() {
    return q.ninvoke(
      request.get(config.musicMap.endpoint + '/artists.json'),
      'end'
    );
  }
};

module.exports = ApiService;
