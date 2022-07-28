// @ts-check
const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(
  __dirname,
  '../packages/server/src/werift-webrtc/packages/webrtc/src/peerConnection.ts'
);
const destPath = path.resolve(__dirname, '../packages/client/src/package/types/werift.ts');

if (fs.existsSync(destPath)) {
  console.warn('Werift types copied', destPath);
} else {
  const data = fs.readFileSync(srcPath).toString();
  let message = 'DO NOT EDIT THIS MANUALLY!\n';
  fs.writeFile(destPath, `${message}${data}`, (err) => {
    if (err) {
      console.error('Error copy werift types', err);
      return;
    }
    console.info('Werift types copied', destPath);
  });
}
