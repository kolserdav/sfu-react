// @ts-check
const path = require('path');
const fs = require('fs');

const srcPath = path.resolve(__dirname, '../packages/client/src/package');
const distPath = path.resolve(__dirname, '../packages/client/dist');

const _dir = fs.readdirSync(srcPath);
readDir(_dir);
console.log('Styles copied', srcPath, distPath);

/**
 *
 * @param {string[]} dir
 * @param {string} prefix
 */
function readDir(dir, prefix = './') {
  dir.forEach((item) => {
    const _srcPath = path.resolve(srcPath, prefix, item);
    if (fs.lstatSync(_srcPath).isDirectory()) {
      console.log(_srcPath);
      return readDir(fs.readdirSync(_srcPath), `${prefix}/${item}`);
    } else if (/\.scss$/.test(item)) {
      fs.copyFileSync(_srcPath, path.resolve(distPath, prefix, item));
    }
  });
}
