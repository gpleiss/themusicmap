var mongoose = require('mongoose')
  , Schema = mongoose.Schema;


var artistSchema = new Schema({
  echonestId: { type: String, index: true },
  name: String,
  familiarity: Number,
  similar: [Artist],
  createdAt: { type: Date, default: Date.now },
});

var Artist = mongoose.model('Artist', artistSchema);

var _uniquenessOfEchonestId = function (value, respond) {
  var self = this;
  Artist.findOne({ echonestId: value }, function (err, artist) {
    if (err) { console.error(err); }
    respond(!(artist && artist.id != self.id));
  });
}

Artist.schema.path('echonestId').validate(_uniquenessOfEchonestId, 'Artist already is stored in database');

exports.Artist = Artist;
