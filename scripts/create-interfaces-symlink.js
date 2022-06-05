// @ts-check
const fs = require('fs');
const path = require('path');

const destPath = path.resolve(__dirname, '../packages/server/src/types/interfaces.ts');
const srcPath = path.resolve(__dirname, '../packages/client/src/package/types/interfaces.ts');

if (fs.existsSync(destPath)) {
  console.warn('Symlink created', destPath);
} else {
  fs.symlink(srcPath, destPath, 'file', (err) => {
    if (err) {
      console.error('Error create symlink', err);
      return;
    }
    console.info('Symlink created', destPath);
  });
}
