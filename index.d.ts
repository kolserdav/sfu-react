import { createServer } from './packages/server/src/main';
import Main from './packages/client/dist/package/Main';
import Room from './packages/client/dist/package/components/Room';

interface Uyem {
  server: {
    createServer: typeof createServer;
  };
  client: {
    Main: Main;
    Room: Room;
  };
}

export default Uyem;
