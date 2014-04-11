var jsdom = require('jsdom')
  , mongoose = require('mongoose')
  , async = require('async')
  , _ = require('underscore')
  , fs = require('fs');

var config = require('../config/config')[process.env.ENV]
  , Artist = require('../models/artist').Artist

mongoose.connect(config.db);

jsdom.env({
  url: 'http://localhost:3000/',
  scripts: [
    'http://localhost:3000/javascripts/vendor/jquery-1.11.0.min.js',
    'http://localhost:3000/javascripts/vendor/d3.v3.min.js',
    'http://localhost:3000/javascripts/map.js'
  ],
  done: function(err, window) {
    if (err) { console.log(err) }

    var map = new window.Map('#map', {width: 800, height: 600});
    map.render();

    setTimeout(function() {
      async.eachSeries(map.nodes(), function(node, callback) {
        Artist.findOne({echonestId: node.id}, function(err, artist) {
          artist.mapData = {
            x: node.x,
            y: node.y
          };

          artist.save(function(err) {
            if (err) { console.error(err); }
            callback(null);
          });
        });
      },

      function() {
        var svgsrc = window.document.innerHTML;
        fs.writeFile('index.html', svgsrc, function(err) {
          if(err) { console.error(err) }
          console.log('The file was saved!')
          mongoose.disconnect();
        });
      })
    }, 10000);
  }
});
