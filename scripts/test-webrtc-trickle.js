// @ts-check
const { firefox } = require('playwright');

(async () => {
  const browser = await firefox.launch({
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
  await page.goto('https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/');
})();
