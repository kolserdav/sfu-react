import Hall from './packages/client/dist/Main.esm';
import Room from './packages/client/dist/components/Room.esm';
import createServer from './packages/server/src/main';

export const server = {
  createServer,
};

export const client = {
  Hall,
  Room,
};
