import { createServer } from './packages/server/src/main';

interface JuliaTeamsServer {
  createServer: typeof createServer;
}

export default JuliaTeamsServer;
