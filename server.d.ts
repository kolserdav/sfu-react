import { createServer } from './packages/server/src/main';

interface UyemServer {
  createServer: typeof createServer;
}

export default UyemServer;
