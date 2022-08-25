// @ts-check
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--allow-file-access-from-files',
      '--disable-gesture-requirement-for-media-playback',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const page = await browser.newPage();
  const trickle = 'https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/';
  await page.goto('http://localhost:3000/1660351415964?uid=1660351522130');
})();
