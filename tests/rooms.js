// @ts-check
const puppeteer = require('puppeteer');
const { log } = require('../packages/server/dist/utils/lib');
const { v4 } = require('uuid');
const { stdout } = require('process');
const { rooms, users, headless, singleRoom, url, delay } = require('./rooms.json');

process.setMaxListeners(0);

// Settings
const ROOMS = singleRoom ? 1 : rooms;
const USERS = users;

const HEADLESS = headless;
const VIEWPORT = {
  width: 640,
  height: 480,
};
const EXIT_DELAY = 1000;

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
let warnings = 0;

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
  const _url = `${url}/${room}?uid=${uid}`;
  page.on('console', (message) => {
    const text = message.text();
    if (!/DevTools/.test(text)) {
      log('warn', `Message on room: ${room} for user: ${uid}:`, message.text(), true);
      warnings++;
    }
  });
  log('info', 'Open page:', _url, true);
  await page.goto(_url);
  await page.waitForSelector('video');
  return page;
}

/**
 * @typedef {Record<string, boolean>} Timeupdate
 */

/**
 * @type {Timeupdate}
 */
let timeupdate = {};
/**
 *
 * @param {EvalPage} evalPage
 * @param {boolean} last
 */
async function evaluateRoom(evalPage, last = false) {
  const { page, room, uid } = evalPage;
  const videos = await page.$$('video');
  const coeff = (USERS + ROOMS) / 1000;
  const d = Math.ceil(delay >= 1000 ? delay * coeff : 1000 * coeff);
  log('log', 'Wait for page evaluate:', `${d} seconds ...`, true);
  const t = stdoutWrite(d);
  await page.waitForTimeout(d * 1000);
  timeupdate = await page.evaluate(
    async (_uid, _delay, users) => {
      /**
       * @type {Timeupdate}
       */
      let _timeupdate = {};
      const _videos = document.querySelectorAll('video');
      _videos[0].parentElement?.parentElement?.focus();
      let check = false;
      const streamIds = [];
      for (let i = 0; _videos[i]; i++) {
        const video = _videos[i];
        if (Boolean(video.played) !== true) {
          log('warn', 'Video not played', { room, uid, id: video.getAttribute('id') }, true);
        }
        /**
         * @type {any}
         */
        const { id } = video.parentElement;
        _timeupdate[id] = await new Promise((resolve) => {
          video.ontimeupdate = () => {
            resolve(true);
          };
          setTimeout(() => {
            resolve(false);
          }, _delay * 2);
        });
        video.ontimeupdate = () => {};
        if (streamIds.indexOf(id) !== -1) {
          console.log(`Non unique stream: ${id} for uid: ${_uid}`);
        }
        streamIds.push(id);
        const title = video.getAttribute('title');
        if (title === _uid) {
          check = true;
        }
      }
      if (!check) {
        console.log(`Self stream not defined uid: ${_uid}`);
      }
      return _timeupdate;
    },
    uid,
    delay,
    USERS
  );
  clearInterval(t);
  // stdoutClean();
  const k = Object.keys(timeupdate);
  const tUval = k.filter((item) => timeupdate[item] === false);
  if (tUval.length) {
    warnings++;
  }
  log(tUval.length === 0 ? 'info' : 'warn', 'Timeupdate', timeupdate, true);
  const { length } = videos;
  count++;
  if (length < USERS) {
    log('error', 'Failed test', { length, USERS, count, room, uid, url: page.url() }, true);
    errors++;
  } else {
    log('info', 'Success test', page.url(), true);
    success++;
  }
  if (count === USERS * ROOMS) {
    setTimeout(() => {
      log('log', 'Test end', { success, warnings, errors }, true);
      if (last) {
        process.exit(0);
      }
    }, EXIT_DELAY);
  }
}

/**
 *
 * @param {number} startTime
 * @returns {number}
 */
function getTime(startTime) {
  const delay = Math.ceil(new Date().getTime() - startTime);
  return delay * ROOMS * USERS + ROOMS * USERS * delay * 2;
}

/**
 *
 * @param {number} seconds
 * @returns {NodeJS.Timeout}
 */
function stdoutWrite(seconds) {
  let oldNumber = seconds.toString();
  stdout.write(oldNumber);
  return setInterval(() => {
    stdout.clearLine(0);
    process.stdout.cursorTo(0);
    oldNumber = `${--seconds}`;
    stdout.write(oldNumber);
  }, 1000);
}

function stdoutClean() {
  stdout.clearLine(0);
  process.stdout.cursorTo(0);
}

/**
 *
 * @param {puppeteer.Page} page
 */
async function reloadPage(page) {
  log('log', 'Reload page:', page.url(), true);
  await page.reload();
  await page.waitForSelector('video');
}

(async () => {
  log('log', 'Start test ...', { USERS, ROOMS }, true);
  /**
   * @type {EvalPage[]}
   */
  const pages = [];
  let startTime = new Date().getTime();
  for (let i = 0; i < ROOMS; i++) {
    const room = typeof singleRoom === 'string' ? singleRoom : v4();
    for (let n = 0; n < USERS; n++) {
      if (n + 1 === USERS && i + 1 === ROOMS) {
        startTime = new Date().getTime();
      }
      const uid = v4();
      const page = await openRoom(room, uid);
      pages.push({
        page,
        uid,
        room,
      });
    }
  }
  let time = getTime(startTime);
  let seconds = Math.ceil(time / 1000);
  log('log', 'Wait for browser load:', `${seconds} seconds ...`, true);
  let timeout = stdoutWrite(seconds);
  await pages[0].page.waitForTimeout(time);
  stdoutClean();
  clearInterval(timeout);
  for (let i = 0; pages[i]; i++) {
    await evaluateRoom(pages[i]);
  }
  await pages[0].page.waitForTimeout(EXIT_DELAY);
  for (let i = 0; pages[i]; i++) {
    if (!pages[i + 1]) {
      startTime = new Date().getTime();
    }
    if (i !== 0) {
      await reloadPage(pages[i].page);
    }
  }
  time = getTime(startTime);
  seconds = Math.ceil(time / 1000);
  log('log', 'Wait for evaluate after reload:', `${seconds} seconds ...`, true);
  timeout = stdoutWrite(seconds);
  await pages[0].page.waitForTimeout(time);
  stdoutClean();
  clearInterval(timeout);
  count = 0;
  for (let i = 0; pages[i]; i++) {
    await evaluateRoom(pages[i], true);
  }
})();
