#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  console.log('Running "npm run postinstall-server" command...');
  const res = spawn('npm', ['run', 'postinstall-server'], {
    env: process.env,
    cwd: path.resolve(__dirname, '../'),
  });
  res.stdout.on('data', (d) => {
    console.log(d.toString());
  });
  res.stderr.on('data', (d) => {
    console.error(d.toString());
  });
  await new Promise((resolve) => {
    res.on('exit', (e) => {
      console.log('Command "npm run postinstall-server" exit with code:', e);
      resolve(0);
    });
  });
  require('../packages/server/dist');
})();
