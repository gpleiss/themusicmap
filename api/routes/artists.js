'use strict';

var q = require('q');

var Artist = require('../models/artist');

var index = function index(req, res) {
  q.ninvoke(Artist, 'find', {$query: {}, $orderby: {'familiarity': -1}})

  .then(function(artists) {
    res.json({artists: artists});
  })

  .done();
};

module.exports = {
  index: index,
};
