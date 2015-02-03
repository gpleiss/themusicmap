'use strict';

var _ = require('lodash');
var React = require('react/addons');
var Reflux = require('reflux');
var cx = React.addons.classSet;

var SelectedArtistActions = require('../actions/selected_artist_actions');
var SelectedArtistStore = require('../stores/selected_artist_store');

var ListArtist = React.createClass({
  render: function render() {
    var className = cx({
      highlight: this.props.highlight,
    });

    return (
      <li className={className} onMouseOver={this._hoverCallback}>{this.props.name}</li>
    );
  },

  _hoverCallback: function() {
    return SelectedArtistActions.update(this.props.echonestId);
  },
});

var List = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: function getInitialState() {
    return {
      highlightedArtist: null,
    };
  },

  componentDidMount: function componentDidUpdate() {
    this.listenTo(SelectedArtistStore, this._updateHighlightedArtistId);
  },

  render: function render() {
    var artists = _.map(this.props.artists, function(artist, i) {
      var highlight = (artist.echonestId === this.state.highlightedArtistId);
      return (
        <ListArtist key={i} highlight={highlight} {...artist}></ListArtist>
      );
    }, this);

    return (
      <ul className='list'>
        {artists}
      </ul>
    );
  },

  _updateHighlightedArtistId: function(artistId) {
    this.setState({
      highlightedArtistId: artistId,
    });
  },
});

module.exports = List;
