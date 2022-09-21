// pass on process  DATABASE_URL as mysql://user:password@localhost:3306/uyem_db;
const { createServer, prisma } = require('uyem/server');
createServer({ port: 3001 }, async (ws) => {
  /**
   * Ws listener example
   */
  ws.on('connection', (socket, req) => {
    const con = req.headers['sec-websocket-protocol'];
    console.log('open', con);
    if (con === undefined) {
      console.log(req.headers);
    }
    socket.on('message', (d) => {
      let data = '';
      if (typeof d !== 'string') {
        data = d.toString('utf8');
      } else {
        data = d;
      }
      console.log(data);
    });
    socket.on('close', (e) => {
      console.log('close', con);
    });
  });
  /**
   * Database access example
   */
  const unit = await prisma.unit.findFirst();
  console.log(unit);
});
