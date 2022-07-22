// @ts-check
const { existsSync, symlink, readFileSync, writeFile } = require('fs');
const { resolve } = require('path');

const destPath = resolve(__dirname, '../packages/server/src/types/interfaces.ts');
const destPath2 = resolve(__dirname, '../packages/room/src/types/interfaces.ts');
const srcPath = resolve(__dirname, '../packages/client/src/package/types/interfaces.ts');

if (existsSync(destPath)) {
  console.warn('Symlink created', destPath);
} else {
  symlink(srcPath, destPath, 'file', (err) => {
    if (err) {
      console.error('Error create symlink', err);
      return;
    }
    console.info('Symlink created', destPath);
  });
}

function copyInterfaces() {
  const data = readFileSync(srcPath).toString();
  let message =
    '// DO NOT WRITE THIS MANUALLY! Use packages/client/src/package/types/interfaces.ts file of packages/server/src/types/interfaces.ts symlink instead\n';
  writeFile(destPath2, message + data, (err) => {
    if (err) {
      console.error('Error ccpy interfaces to room', err);
      return;
    }
    console.info('Interfaces copied', destPath2);
  });
}

copyInterfaces();

module.exports = { copyInterfaces };
