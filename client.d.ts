import Hall from './packages/client/dist/package/Main';
import Room from './packages/client/dist/package/components/Room';

interface Client {
  Room: Room;
  Hall: Hall;
}

export default Client;
