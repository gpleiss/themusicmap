'use strict'

var React = require('react');

var ArtistActions = require('./actions/artist_actions');
var TheMusicApp = require('./components/the_music_app.jsx');

ArtistActions.fetch();

React.render(
  <TheMusicApp></TheMusicApp>,
  document.getElementById('content')
);
