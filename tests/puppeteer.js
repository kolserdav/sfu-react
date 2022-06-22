// @ts-check
const puppeteer = require('puppeteer');
const { log } = require('../packages/server/dist/utils/lib');
const { v4 } = require('uuid');
const { stdout } = require('process');

process.setMaxListeners(0);

// Settings
const ROOMS = 2;
const USERS = 8;
const HEADLESS = true;
const VIEWPORT = {
  width: 640,
  height: 480,
};

/**
 *
 * @param {string} room
 * @param {string} uid
 * @returns {Promise<puppeteer.Page>}
 */
async function openRoom(room, uid) {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: VIEWPORT,
    args: [
      '--allow-file-access-from-files',
      '--disable-gesture-requirement-for-media-playback',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const [page] = await browser.pages();
  const url = `http://localhost:3000/${room}?uid=${uid}`;
  page.on('console', (message) => {
    const text = message.text();
    if (!/DevTools/.test(text)) {
      log('warn', `Message on room: ${room} for user: ${uid}:`, message.text(), true);
    }
  });
  log('info', 'Open page', url, true);
  await page.goto(url);
  return page;
}

/**
 *
 * @typedef {{
 *  page: puppeteer.Page;
 *  uid: string;
 *  room: string;
 * }} EvalPage
 */

let count = 0;
let success = 0;
let errors = 0;

/**
 *
 * @param {EvalPage} evalPage
 */
async function evaluateRoom(evalPage) {
  const { page, room, uid } = evalPage;
  const videos = await page.$$('video');
  const { length } = videos;
  count++;
  if (length !== USERS) {
    log('error', 'Failed test', { length, USERS, count }, true);
    errors++;
  } else {
    log('info', 'Success test', { length, USERS, count }, true);
    success++;
  }
  if (count === USERS * ROOMS) {
    setTimeout(() => {
      log('log', 'Test end', { errors, success }, true);
      process.exit(0);
    }, 1000);
  }
}

(async () => {
  log('log', 'Start test ...', { USERS, ROOMS }, true);
  /**
   * @type {EvalPage[]}
   */
  const pages = [];
  const startTime = new Date().getTime();
  for (let i = 0; i < ROOMS; i++) {
    const room = v4();
    for (let n = 0; n < USERS; n++) {
      const uid = v4();
      const page = await openRoom(room, uid);
      pages.push({
        page,
        uid,
        room,
      });
    }
  }
  const delay = Math.ceil(new Date().getTime() - startTime);
  const time = USERS * ROOMS * delay;
  let seconds = Math.ceil(time / 1000);
  log('log', 'Wait for evaluate:', `${seconds} seconds ...`, true);
  let oldNumber = seconds.toString();
  stdout.write(oldNumber);
  let timeout = setInterval(() => {
    stdout.clearLine(0);
    process.stdout.cursorTo(0);
    oldNumber = `${--seconds}`;
    stdout.write(oldNumber);
  }, 1000);
  await pages[0].page.waitForTimeout(time);
  clearInterval(timeout);
  for (let i = 0; pages[i]; i++) {
    await evaluateRoom(pages[i]);
  }
})();
