'use strict'

var $ = require('jquery');

var Map = require('./map');

$(function() {
  var map = new Map('#map-container');
  map.render();
});
