// @ts-check
const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '../packages/server/src/interface.ts');
const destPath = path.resolve(__dirname, '../packages/client/src/interface.ts');

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
