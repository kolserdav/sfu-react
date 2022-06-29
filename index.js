// @ts-check
const Hall = require('./packages/client/dist/Main.esm').default;
const Room = require('./packages/client/dist/components/Room.esm').default;
const createServer = require('./packages/server/dist/main').default;

module.exports = {
  server: {
    createServer,
  },
  client: {
    Hall,
    Room,
  },
};
