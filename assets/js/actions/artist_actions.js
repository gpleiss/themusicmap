'use strict';

var Reflux = require('reflux');
var request = require('superagent');

var ArtistActions = Reflux.createActions({
  fetch: {
    children: ["completed"]
  }
});

ArtistActions.fetch.listen(function() {
  request.get(config.musicMap.endpoint + '/artists.json?fluid=', function(data) {
    var artists = data.body.artists;
    ArtistActions.fetch.completed(artists);
  });
});

module.exports = ArtistActions;
