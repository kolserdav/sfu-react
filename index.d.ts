import { createServer } from './packages/server/src/main';
import Room from './packages/client/dist/package/Main';

interface JuliaTeams {
  createServer: typeof createServer;
  Room: Room;
}

export default JuliaTeams;
