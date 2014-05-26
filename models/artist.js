var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var ArtistSchema = new Schema({
  echonestId: { type: String, index: true },
  name: String,
  familiarity: Number,
  similar: [exports.Artist],
  mapData: {
    x: Number,
    y: Number
  },
  createdAt: { type: Date, default: Date.now },
});

ArtistSchema.methods.toArtistNode = function(options) {
  options = options || {};

  var node = {
    id: this.echonestId,
    name: this.name,
    radius: radiusForArtist(this),
  };

  if (this.mapData.x && !options.fluidMap) {
    node.x = this.mapData.x;
    node.y = this.mapData.y;
    node.fixed = true;
  }

  return node;
}

ArtistSchema.methods.updateMapData = function(artistNode, callback, errCallback) {
  this.mapData = {
    x: artistNode.x,
    y: artistNode.y
  }
  this.save(function(err) {
    if (err && errCallback) { errCallback(); }
    else if (err) { console.error(err); }
    callback();
  });
}

function radiusForArtist(artist) {
  val = Math.ceil(100 * Math.pow(artist.familiarity, 10));
  return val;
}

function uniquenessOfEchonestId(value, respond) {
  var self = this;
  exports.Artist.findOne({ echonestId: value }, function (err, artist) {
    if (err) { console.error(err); }
    respond(!(artist && artist.id != self.id));
  });
}

exports.Artist = mongoose.model('Artist', ArtistSchema);
exports.Artist.schema.path('echonestId').validate(uniquenessOfEchonestId, 'Artist already is stored in database');
