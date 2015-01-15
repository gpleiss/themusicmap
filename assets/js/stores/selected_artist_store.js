var Reflux = require('reflux');

var SelectedArtistActions = require('../actions/selected_artist_actions');

var SelectedArtistStore = Reflux.createStore({
  init: function init() {
    this.listenTo(SelectedArtistActions.update, this._update);
  },

  _update: function update(artist) {
    this.trigger(artist);
  },
});

module.exports = SelectedArtistStore;
