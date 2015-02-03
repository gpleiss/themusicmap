'use strict'

var _ = require('lodash');
var React = require('react');
var Reflux = require('reflux');

var ArtistStore = require('../stores/artist_store');
var Map = require('./map.jsx');
var List = require('./list.jsx');

var TheMusicApp = React.createClass({
  mixins: [Reflux.ListenerMixin],

  getInitialState: function() {
    return {
      artists: [],
    };
  },

  componentDidMount: function() {
    this.listenTo(ArtistStore, this._onChange);
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
