//@ts-check
const puppeteer = require('puppeteer');
// @ts-ignore
const { spawn, ChildProcessWithoutNullStreams } = require('child_process');
const { log } = require('../packages/server/dist/utils/lib');

const VIEWPORT = {
  width: 640,
  height: 480,
};

/**
 * @param {string} url
 * @param {string} room
 * @param {string | number} uid
 * @param {boolean} headless
 * @returns {Promise<puppeteer.Page>}
 */
async function openRoom(url, room, uid, headless) {
  const browser = await puppeteer.launch({
    headless,
    defaultViewport: VIEWPORT,
    args: [
      '--allow-file-access-from-files',
      '--disable-gesture-requirement-for-media-playback',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const [page] = await browser.pages();
  const _url = `${url}/room/${room}?uid=${uid}`;
  page.on('console', (message) => {
    const text = message.text();
    if (!/DevTools/.test(text) && !/webpack-dev-server/.test(text)) {
      log('warn', `Message on room: ${room} for user: ${uid}:`, message.text(), true);
    }
  });
  log('info', 'Open page:', _url, true);
  await page.goto(_url);
  await page.waitForSelector('video');
  return page;
}

/**
 *
 * @returns {Promise<{client: ChildProcessWithoutNullStreams | undefined; server: ChildProcessWithoutNullStreams} | 0>}
 */
const startServer = async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, 3000);
  });
  if (!process.env.CI) {
    return 0;
  }
  log('log', 'Run command:', '"npm run prod:migrate"', true);
  /**
   * @type {any}
   */
  const env = { PATH: process.env.PATH };
  let server = spawn('npm', ['run', 'prod:migrate'], {
    env,
  });
  server.stdout.on('data', (d) => {
    console.log(d.toString());
  });
  server.stderr.on('data', (d) => {
    const data = d.toString();
    console.log(data);
  });
  await new Promise((resolve) => {
    server.on('exit', () => {
      resolve(0);
    });
  });
  log('log', 'Run command:', '"npm run start"', true);
  server = spawn('npm', ['run', 'start'], {
    env,
  });
  server.stdout.on('data', (d) => {
    console.log(d.toString());
  });
  server.stderr.on('data', (d) => {
    const data = d.toString();
    console.log(data);
  });
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, 4000);
  });
  let client;
  if (process.env.TEST_NEXT) {
    log('log', 'Run command:', '"npm run start:client-next"', true);
    client = spawn('npm', ['run', 'start:client-next'], {
      env,
    });
    client.stdout.on('data', (d) => {
      console.log(d.toString());
    });
    client.stderr.on('data', (d) => {
      const data = d.toString();
      console.log(data);
    });
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(0);
      }, 4000);
    });
  }
  return {
    client,
    server,
  };
};

module.exports = { openRoom, startServer };
