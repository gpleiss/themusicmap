var mongoose = require('mongoose');
var config = require('./config/config');

jake.addListener('start', function () {
  mongoose.connect(config.db);
  jake.logger.log("Connected to database");
});

jake.addListener('complete', function () {
  mongoose.disconnect();
  jake.logger.log("Completed")
});
