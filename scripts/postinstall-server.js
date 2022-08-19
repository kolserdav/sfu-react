// @ts-check
const { spawn } = require('child_process');

(async () => {
  console.log('Running "npm run prod:migrate" command...');
  let res = spawn('npm', ['run', 'prod:migrate'], {
    env: process.env,
  });
  res.stdout.on('data', (d) => {
    console.log(d.toString());
  });
  res.stderr.on('data', (d) => {
    console.error(d.toString());
  });
  await new Promise((resolve) => {
    res.on('exit', (e) => {
      console.log('Command "npm run prod:migrate" exit with code:', e);
      resolve(0);
    });
  });
})();
