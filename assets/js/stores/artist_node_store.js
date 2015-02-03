'use strict';

var _ = require('lodash');
var d3 = require('d3');
var Reflux = require('reflux');

var ArtistNodeActions = require('../actions/artist_node_actions');
var ArtistStore = require('./artist_store');

var _fluid = false;
var _force = d3.layout.force()
  .charge(-120)
  .linkDistance(30);

var ArtistNodeStore = Reflux.createStore({
  init: function init() {
    this.listenTo(ArtistNodeActions.init, this._initForce);
    this.listenTo(ArtistStore, this._onArtistUpdate);
  },

  getNodes: function getNodes() {
    return _force.nodes();
  },

  getLinks: function getLinks() {
    return _force.links();
  },

  _initForce: function _initForce(width, height, fluid) {
    var self = this;

    _force.size([width, height]);
    _force.on('tick', self._onNodeUpdate);
    _fluid = fluid;
  },

  _onNodeUpdate: function _onNodeUpdate() {
    this.trigger(this.getNodes(), this.getLinks());
  },

  _onArtistUpdate: function _onArtistUpdate(newArtists) {
    var newEchonestIds = _.map(newArtists, 'echonestId');
    var artistNodeHash = _.indexBy(this.getNodes(), 'echonestId');

    var artistNodes = _.map(newArtists, function(newArtist, i) {
      return artistNodeHash[newArtist.echonestId] || {
        index: i,
        echonestId: newArtist.echonestId,
        name: newArtist.name,
        radius: Math.ceil(100 * Math.pow(newArtist.familiarity, 10)),
        x: newArtist.mapData ? newArtist.mapData.x : null,
        y: newArtist.mapData ? newArtist.mapData.y : null,
        fixed: _fluid ? false : (newArtist.mapData && newArtist.mapData.x),
      };
    });

    var artistLinks = _(newArtists).map(function(newArtist, sourceArtistIndex) {
      return _.map(newArtist.similar, function(similarArtist) {
        var similarArtistIndex = _.indexOf(newEchonestIds, similarArtist.echonestId);
        if (similarArtistIndex !== -1) {
          return {
            source: sourceArtistIndex,
            target: similarArtistIndex,
          };
        }
      });
    }).flatten().compact().value();

    _force.stop();
    _force.nodes(artistNodes);
    _force.links(artistLinks);
    _force.start();

    this.trigger(this.getNodes(), this.getLinks());
  },
});

module.exports = ArtistNodeStore;
