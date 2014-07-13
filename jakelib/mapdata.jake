var async = require('async')
  , jsdom = require('jsdom');

var Artist = require('../api/models/artist');


namespace('mapdata', function() {
  task('update', function update() {
    var scripts = [
      'http://localhost:3000/javascripts/vendor/jquery-1.11.0.min.js',
      'http://localhost:3000/javascripts/vendor/d3.v3.min.js',
      'http://localhost:3000/javascripts/map.js'
    ];

    jsdom.env({
      url: 'http://localhost:3000/',
      scripts: scripts,
      done: function(err, window) {
        if (err && err.message.match(/ECONNREFUSED/)) {
          fail('Node server must be started.');
        }
        else if (err) { jake.logger.error(err); }

        var map = computeMapData(window);
        setTimeout(function() { 
          updateMapData(map, window);
        }, 10000);
      }
    });
  }, {async: true});
});


function computeMapData(window) {
  jake.logger.log("Computing new map data...");

  var map = new window.Map('#map', {width: 800, height: 600});
  map.render({fluidMap: true});
  return map;
}

function updateMapData(map, window) {
  jake.logger.log("Saving...");

  async.each(map.nodes(), function(node, callback) {
    Artist.findOne({echonestId: node.id}, function(err, artist) {
      artist.updateMapData(node, callback);
    });
  }, function() {
    window.close();
    complete();
  });
}
