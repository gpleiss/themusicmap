'use strict';

var Reflux = require('reflux');

var ApiService = require('../services/api_service');

var ArtistActions = Reflux.createActions({
  fetch: {
    children: ["completed", "failed"]
  }
});

ArtistActions.fetch.listen(function() {
  ApiService.getArtists()
  .then(function(data) {
    var artists = data.body.artists;
    ArtistActions.fetch.completed(artists);
  })
  .fail(function(err) {
    if (err.message.match(/ECONNREFUSED/)) {
      console.error('Failed to hit API.');
    }
    ArtistActions.fetch.failed();
  });
});

module.exports = ArtistActions;
