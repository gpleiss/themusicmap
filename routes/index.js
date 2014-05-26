var Artist = require('../models/artist').Artist
  , _ = require('underscore');

exports.index = function(req, res){
  res.render('index');
};

exports.mapData = function(req, res) {
  var fluidMap = req.query.fluid == 'true';

  var _echonestId = function(artist) {
    return artist.echonestId;
  }

  Artist.find({$query: {}, $orderby: {'familiarity': -1}}, function(err, artists) {
    var nodes = [];
    var links = [];

    _.each(artists, function(artist) {
      nodes.push(artist.toArtistNode({fluidMap: fluidMap}));
    });

    _.each(artists, function(artist, sourceArtistIndex) {
      _.each(artist.similar, function(similarArtist) {
        var similarArtistIndex = _.indexOf(_.map(artists, _echonestId), _echonestId(similarArtist));

        if (similarArtistIndex !== -1) {
          links.push({
            source: sourceArtistIndex,
            target: similarArtistIndex
          });
        }
      });
    });

    res.json({nodes: nodes, links: links});
  });
};
