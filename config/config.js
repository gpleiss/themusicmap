var _ = require('lodash');

var config = {
  echonest: {
    endpoint: process.env.ECHONEST_ENDPOINT,
    apiKey: process.env.ECHONEST_API_KEY,
  },
};

if (process.env.NODE_ENV == 'development') {
  config = _.extend(config, {
    db: "mongodb://localhost/themusicmap",
  });
}

module.exports = config;
