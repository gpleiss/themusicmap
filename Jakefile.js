var mongoose = require('mongoose');
var config = require('./config/config')[process.env.ENV];

jake.addListener('start', function () {
  mongoose.connect(config.db);
  jake.logger.log("Connected to database");
});

jake.addListener('complete', function () {
  mongoose.disconnect();
  jake.logger.log("Completed")
});
