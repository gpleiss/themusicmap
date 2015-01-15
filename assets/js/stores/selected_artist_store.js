var Reflux = require('reflux');

var SelectedArtistActions = require('../actions/selected_artist_actions');

var _selectedArtistId = null;

var SelectedArtistStore = Reflux.createStore({
  init: function init() {
    this.listenTo(SelectedArtistActions.update, this._update);
  },

  _update: function update(artistId) {
    if (artistId !== _selectedArtistId) {
      _selectedArtistId = artistId;
      this.trigger(artistId);
    }
  },
});

module.exports = SelectedArtistStore;
