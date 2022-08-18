// @ts-check
const { existsSync, symlink } = require('fs');
const { resolve } = require('path');

const destPath = resolve(__dirname, '../packages/server/src/types/interfaces.ts');
const srcPath = resolve(__dirname, '../packages/client/src/package/types/interfaces.ts');
const srcPathD = resolve(__dirname, '../packages/client/dist/types/interfaces.d.ts');

if (existsSync(destPath)) {
  console.warn('Symlink created', destPath);
} else {
  const _srcPath = existsSync(srcPath) ? srcPath : srcPathD;
  symlink(_srcPath, destPath, 'file', (err) => {
    if (err) {
      console.error('Error create symlink', err);
      return;
    }
    console.info('Symlink created', destPath);
  });
}
