var _ = require('lodash');

var config = {
  echonest: {
    apiKey: process.env.ECHONEST_API_KEY,
    endpoint: process.env.ECHONEST_ENDPOINT,
  },
  musicMap: {
    endpoint: process.env.MUSICMAP_ENDPOINT,
    host: process.env.MUSICMAP_HOST,
  }
};

if (process.env.NODE_ENV == 'development') {
  config = _.extend(config, {
    port: 3000,
    db: "mongodb://localhost/themusicmap",
  });
}

module.exports = config;
