// @ts-check
const { spawn } = require('child_process');

(async () => {
  console.log('Running "npm run db:dev" command...');
  let res = spawn('npm', ['run', 'db:dev'], {
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
  console.log('Running "npm run db:prod" command...');
  res = spawn('npm', ['run', 'db:prod'], {
    env: process.env,
  });
  res.stdout.on('data', (d) => {
    console.log(d.toString());
  });
  res.stderr.on('data', (d) => {
    console.log(d.toString());
  });
})();
