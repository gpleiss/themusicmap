'use strict';

var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var Artist;

var ArtistSchema = new Schema({
  echonestId: { type: String, index: true },
  name: String,
  familiarity: Number,
  similar: [Artist],
  mapData: {
    x: Number,
    y: Number
  },
  createdAt: { type: Date, default: Date.now },
});

ArtistSchema.methods.updateMapData = function(artistNode, callback) {
  this.mapData = {
    x: artistNode.x,
    y: artistNode.y
  }
  this.save(function(err) {
    if (err) { callback(err); }
    callback(null, true);
  });
};

function radiusForArtist(artist) {
  var val = Math.ceil(100 * Math.pow(artist.familiarity, 10));
  return val;
}

function uniquenessOfEchonestId(value, respond) {
  var self = this;
  Artist.findOne({ echonestId: value }, function (err, artist) {
    if (err) { console.error(err); }
    respond(!(artist && artist.id != self.id));
  });
}

Artist = mongoose.model('Artist', ArtistSchema);
Artist.schema.path('echonestId').validate(uniquenessOfEchonestId, 'Artist already is stored in database');

module.exports = Artist;
