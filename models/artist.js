var mongoose = require('mongoose')
  , Schema = mongoose.Schema;


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

ArtistSchema.methods._radius = function() {
  val = Math.ceil(20 * Math.pow(this.familiarity, 2));
  return val;
}

ArtistSchema.methods.toArtistNode = function() {
  var node = {
    id: this.echonestId,
    name: this.name,
    radius: this._radius(),
  };

  if (this.mapData.x) {
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

var Artist = mongoose.model('Artist', ArtistSchema);

var _uniquenessOfEchonestId = function (value, respond) {
  var self = this;
  Artist.findOne({ echonestId: value }, function (err, artist) {
    if (err) { console.error(err); }
    respond(!(artist && artist.id != self.id));
  });
}

Artist.schema.path('echonestId').validate(_uniquenessOfEchonestId, 'Artist already is stored in database');

exports.Artist = Artist;
