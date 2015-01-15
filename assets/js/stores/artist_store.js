var Reflux = require('reflux');

var ArtistActions = require('../actions/artist_actions');

var _artists = [];

var ArtistStore = Reflux.createStore({
  init: function init() {
    this.listenTo(ArtistActions.fetch.completed, this._update);
  },

  getAll: function getAll() {
    return _artists;
  },

  _update: function update(artists) {
    _artists = artists;
    this.trigger(artists);
  },
});

module.exports = ArtistStore;
