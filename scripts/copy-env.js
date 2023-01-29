// @ts-check
const { existsSync, copyFile } = require('fs');
const { resolve } = require('path');

const srcEnvCl = resolve(__dirname, '../packages/client/.env.example');
const destEnvCl = resolve(__dirname, '../packages/client/.env');
const srcEnvS = resolve(__dirname, '../packages/server/.env.example');
const destEnvS = resolve(__dirname, '../packages/server/.env');

if (existsSync(destEnvCl)) {
  console.info('Client env copied:', destEnvCl);
} else {
  copyFile(srcEnvCl, destEnvCl, (err) => {
    if (err) {
      console.error('Error ccopy env client', err);
      return;
    }
    console.info('Client env copied:', destEnvCl);
  });
}
if (existsSync(destEnvS)) {
  console.info('Server env copied:', destEnvS);
} else {
  copyFile(srcEnvS, destEnvS, (err) => {
    if (err) {
      console.error('Error copy env sever', err);
      return;
    }
    console.info('Server env copied:', destEnvS);
  });
}
