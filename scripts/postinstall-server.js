// @ts-check
const { spawn } = require('child_process');
const { resolve } = require('path');
const { existsSync } = require('fs');

const srcPath = resolve(__dirname, '../packages/client/src/package/types/interfaces.ts');
const isDev = existsSync(srcPath);
(async () => {
  if (isDev) {
    console.log('Running "npm run db:dev" command...');
    const res = spawn('npm', ['run', 'db:dev'], {
      env: process.env,
    });
    res.stdout.on('data', (d) => {
      console.log(d.toString());
    });
    res.stderr.on('data', (d) => {
      console.log(d.toString());
    });
    await new Promise((resolve) => {
      res.on('exit', (e) => {
        resolve(0);
      });
    });
  } else {
    console.log('Skipping "npm run db:dev" command.');
  }
  console.log('Running "npm run db:prod" command...');
  const res = spawn('npm', ['run', 'db:prod'], {
    env: process.env,
  });
  res.stdout.on('data', (d) => {
    console.log(d.toString());
  });
  res.stderr.on('data', (d) => {
    console.log(d.toString());
  });
})();
