'use strict';

require("node-jsx").install({ extension: ".jsx" });

var _ = require('lodash');
var browserify = require('browserify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var jsdom = require('jsdom');
var mongoose = require('mongoose');
var q = require('q');
var reactify = require('reactify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');

var app = require('./index');
var config = require('./config/config');
var db = process.env.MONGOLAB_URI || config.db;
var port = process.env.VCAP_APP_PORT || config.port;

var Artist = require('./api/models/artist');
var echonestService = require('./api/services/echonestService');

q.longStackSupport = true;

gulp.task('default', [
  '_scripts',
  'serve',
], function() {
  gulp.watch(['assets/js/**/*.js', 'assets/js/**/*.jsx'], ['_scripts']);
});

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

gulp.task('_scripts', function() {
  var b = browserify('./assets/js/application.jsx');
  b.transform(reactify);

  return b.bundle()
    .pipe(source('./application.jsx'))
    .pipe(rename('application.js'))
    .pipe(gulp.dest('build/'))
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

  return connectToDb()

  .then(function() {
    return q.ninvoke(jsdom, 'env', '<div id="content"></div>');
  })

  .then(function(window) {
    gutil.log('Rendering map...');

    global.window = window;
    global.document = window.document;
    global.navigator = {userAgent: []};
    global.config = config;

    var React = require('react/addons');
    var ArtistActions = require('./assets/js/actions/artist_actions.js');
    var Map = require('./assets/js/components/map.jsx');

    ArtistActions.fetch();

    var node = window.document.getElementById('content');

    var element = React.createElement(Map, {
      width: 1000,
      height: 1000,
      fluid: true,
    });

    React.render(element, node);
    return q.delay(60000);
  })

  .then(function() {
    var ArtistNodeStore = require('./assets/js/stores/artist_node_store.js');
    return q.all(_.map(ArtistNodeStore.getNodes(), function(node, callback) {
      return updateMapDataForArtistFrom(node);
    }));
  })

  .then(disconnectFromDb)

  .fail(function(err) {
    throw err;
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
  return q.ninvoke(Artist, 'findOne', {echonestId: node.echonestId})

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
