const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(
  __dirname,
  '../packages/server/node_modules/.prisma/client/index.d.ts'
);
const destPath = path.resolve(__dirname, '../packages/client/src/package/types/prisma.d.ts');
const destSymlink = path.resolve(__dirname, '../packages/server/src/types/prisma.d.ts');

fs.copyFile(srcPath, destPath, fs.constants.COPYFILE_FICLONE_FORCE, (err) => {
  if (err) {
    console.error('Error copy prisma types', err);
    return;
  }
  if (fs.existsSync(destSymlink)) {
    console.warn('Symlink created', destSymlink);
  } else {
    fs.symlink(srcPath, destSymlink, 'file', (err) => {
      if (err) {
        console.error('Error create symlink', err);
        return;
      }
      console.info('Symlink created', destSymlink);
    });
  }
  console.info('Prisma types copied', destPath);
});
