var _ = require('lodash');

var config = {
};

if (process.env.NODE_ENV == 'development') {
  config = _.extend(config, {
    db: "mongodb://localhost/themusicmap",
  });
}

module.exports = config;
