// pass on process  DATABASE_URL as mysql://user:password@localhost:3306/uyem_db;
const { createServer } = require('uyem/server');

createServer({ port: 3233, db: 'mysql://root:root@127.0.0.1:3306/uyem_db' });
