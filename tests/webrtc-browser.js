// @ts-check
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--allow-file-access-from-files',
      '--disable-gesture-requirement-for-media-playback',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const trickle = 'https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/';
  await page.goto('http://localhost:3000/1660351415964?uid=1660351522130');
})();
