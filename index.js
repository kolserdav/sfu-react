const server = require('./server');
const client = require('./client');

module.exports = {
  server: {
    ...server,
  },
  client: {
    ...client,
  },
};
