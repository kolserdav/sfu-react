const { createServer } = require('./server');
const { Hall, Room } = require('./client');

module.exports = {
  server: {
    createServer,
  },
  client: {
    Room,
    Hall,
  },
};
