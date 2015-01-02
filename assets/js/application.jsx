'use strict'

var _ = global._ = require('lodash');
var $ = require('jquery');
var React = require('react');
var request = require('superagent');

var Map = React.createFactory(require('./components/map.jsx'));

var IndexPage = React.createFactory(React.createClass({
  getInitialState: function() {
    return {
      artists: [],
      artistLinks: [],
      artistNodes: [],
    };
  },

  componentDidMount: function componentDidMount() {
    var self = this;

    request.get(config.musicMap.endpoint + '/artists.json?fluid=', function(data) {
      var artists = data.body.artists;

      self.setState({
        artists: artists,
      });
    });
  },

  render: function() {
    return (
      <Map artists={this.state.artists}></Map>
    );
  }
}));

React.render(
  <IndexPage></IndexPage>,
  document.getElementById('content')
);
