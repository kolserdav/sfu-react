// @ts-check
const { existsSync, symlink } = require('fs');
const { resolve } = require('path');

const destPath = resolve(__dirname, '../packages/server/src/types/interfaces.ts');
const srcPath = resolve(__dirname, '../packages/client/package/types/interfaces.ts');
const srcPathD = resolve(__dirname, '../packages/client/dist/types/interfaces.d.ts');
const destPathD = resolve(__dirname, '../packages/server/dist/types/interfaces.ts');
const isDev = existsSync(srcPath);
const _srcPath = isDev ? srcPath : srcPathD;
const _destPath = isDev ? destPath : destPathD;
if (existsSync(_destPath)) {
  console.info('Symlink created:', _destPath);
} else {
  symlink(_srcPath, _destPath, 'file', (err) => {
    if (err) {
      console.error('Error create symlink', err);
      return;
    }
    console.info('Symlink created:', _destPath);
  });
}
