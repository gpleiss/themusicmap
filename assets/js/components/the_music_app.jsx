'use strict'

var _ = require('lodash');
var React = require('react');

var ArtistStore = require('../stores/artist_store');
var Map = require('./map.jsx');

var _unsubscribe = _.noop;

var TheMusicApp = React.createFactory(React.createClass({
  getInitialState: function() {
    return {
      artists: [],
    };
  },

  componentDidMount: function() {
    _unsubscribe = ArtistStore.listen(this._onChange);
  },

  componentDidUnmount: function() {
    _unsubscribe();
  },

  render: function() {
    return (
      <Map artists={this.state.artists}></Map>
    );
  },

  _onChange: function() {
    this.setState({
      artists: ArtistStore.getAll(),
    });
  },
}));

module.exports = TheMusicApp;
