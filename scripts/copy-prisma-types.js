// @ts-check
const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '../node_modules/.prisma/client/index.d.ts');
const srcPathD = path.resolve(__dirname, '../packages/client/dist/types/prisma.d.ts');
const destPath = path.resolve(__dirname, '../packages/client/src/package/types/prisma.d.ts');
const destSymlink = path.resolve(__dirname, '../packages/server/src/types/prisma.d.ts');
const srcPathI = path.resolve(__dirname, '../packages/client/src/package/types/interfaces.ts');
const isDev = fs.existsSync(srcPathI);
let _srcPath = isDev ? srcPath : srcPathD;
const data = fs.readFileSync(_srcPath);
if (fs.existsSync(destSymlink)) {
  console.warn('Symlink created', destSymlink);
} else {
  if (isDev) {
    console.log('Copy prisma file to:', destPath);
    fs.writeFileSync(destPath, data);
  }
  fs.symlink(_srcPath, destSymlink, 'file', (err) => {
    if (err) {
      console.error('Error create symlink', err);
      return;
    }
    console.info('Symlink created', destSymlink);
  });
}
