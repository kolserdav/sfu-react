const { createServer } = require('uyem/server');

const onRoomOpen = (args) => {
  console.log('open', args);
};
const onRoomClose = (args) => {
  console.log('close', args);
};
const onRoomConnect = (args) => {
  console.log('connect', args);
};
const onRoomDisconnect = (args) => {
  console.log('disconnect', args);
};

createServer({ port: 3001, onRoomOpen, onRoomClose, onRoomConnect, onRoomDisconnect });
