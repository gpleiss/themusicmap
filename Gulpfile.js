'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jsdom = require('jsdom');
var mongoose = require('mongoose');
var q = require('q');

var app = require('./app');
var config = require('./config/config');
var db = process.env.MONGOLAB_URI || config.db;
var port = process.env.PORT || config.port;

var Artist = require('./api/models/artist');
var echonestService = require('./api/services/echonestService');

q.longStackSupport = true;

gulp.task('default', [
  'serve',
]);

gulp.task('serve', function() {
  return connectToDb()

  .then(function() {
    gutil.log('Connected to mongo db ' + db);
    return q.ninvoke(app, 'listen', port);
  })

  .then(function() {
    gutil.log('Started to express server on port ' + port);
  })

  .fail(function(err) {
    throw err;
  });
});

gulp.task('dropDb', function() {
  return connectToDb()

  .then(function() {
    return q.ninvoke(Artist, 'remove', {})
  })

  .then(function() {
    gutil.log('Removed all artists from db');
  })

  .then(disconnectFromDb)

  .fail(function(err) {
    throw err;
  });
});

gulp.task('seedArtists', function() {
  return connectToDb()

  .then(function() {
    return echonestService.getFamiliarArtists({
      numArtists: 75
    });
  })

  .then(function(seedArtists) {
    return q.all(_.map(seedArtists, function(artist) {
      gutil.log('Adding ' + artist.name);
      return q.ninvoke(artist, 'save');
    }));
  })

  .then(function(seedArtistData) {
    var seedArtists = _.map(seedArtistData, _.first);
    return q.all(_.map(seedArtists, function(artist, i) {
      return addSimilarArtistsFor(artist, i*1000);
    }));
  })

  .then(disconnectFromDb)

  .fail(function(err) {
    throw err;
  });
});

gulp.task('renderMap', function() {
  var scripts = [
    'http://localhost:3000/javascripts/vendor/jquery-1.11.0.min.js',
    'http://localhost:3000/javascripts/vendor/d3.v3.min.js',
    'http://localhost:3000/javascripts/map.js'
  ];

  return connectToDb()

  .then(function() {
    return q.ninvoke(jsdom, 'env', 'http://localhost:3000/', scripts);
  })

  .then(function(window) {
    gutil.log('Rendering map...');

    var map = new window.Map('#map', {width: 800, height: 600});
    map.render({fliudMap: true});
    return q(map).delay(10000);
  })

  .then(function(map) {
    return q.all(_.map(map.nodes(), function(node, callback) {
      return updateMapDataForArtistFrom(node);
    }));
  })

  .then(disconnectFromDb)

  .fail(function(err) {
    if (err.message.match(/ECONNREFUSED/)) {
      gutil.log('Failed. Is node server started?');
      process.exit(1);
    } else {
      throw err;
    }
  });
});

function addSimilarArtistsFor(artist, delay) {
  return q.delay(delay).then(function() {
    gutil.log('Finding similar for ' + artist.name);

    return echonestService.getSimilarArtists(artist, {
      maxFamiliarityPerc: 1.03,
      minFamiliarityPerc: 0.93,
      numSimilarArtists: 5
    });
  })

  .progress(gutil.log)

  .then(function(similarArtists) {
    return q.all(_.map(similarArtists, function(similarArtist) {
      gutil.log('Adding ' + similarArtist.name);
      return q.ninvoke(similarArtist, 'save');
    }));
  })

  .then(function(similarArtists) {
    similarArtists = _.map(similarArtists, _.first);
    artist.similar = similarArtists;
    gutil.log('Updating ' + artist.name);
    return q.ninvoke(artist, 'save');
  })

  .catch(function(err) {
    throw err;
  });
}

function updateMapDataForArtistFrom(node) {
  return q.ninvoke(Artist, 'findOne', {echonestId: node.id})

  .then(function(artist) {
    return q.ninvoke(artist, 'updateMapData', node);
  })

  .catch(function(err) {
    throw err;
  });
}

function connectToDb() {
  return q.ninvoke(mongoose, 'connect', db);
}

function disconnectFromDb() {
  return q.ninvoke(mongoose, 'disconnect');
}
