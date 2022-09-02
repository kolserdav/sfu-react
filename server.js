const { createServer, prisma } = require('./packages/server/dist/main').default;

module.exports = {
  createServer,
  prisma,
};
