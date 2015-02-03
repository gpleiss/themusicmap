'use strict'

var _ = require('lodash');
var React = require('react');

var ArtistStore = require('../stores/artist_store');
var Map = require('./map.jsx');
var List = require('./list.jsx');

var _unsubscribe = _.noop;

var TheMusicApp = React.createClass({
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
      <div>
        <Map artists={this.state.artists} width={window.innerWidth - 310} height={window.innerHeight} />
        <List artists={this.state.artists} />
      </div>
    );
  },

  _onChange: function() {
    this.setState({
      artists: ArtistStore.getAll(),
    });
  },
});

module.exports = TheMusicApp;
