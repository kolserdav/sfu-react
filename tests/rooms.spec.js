/* eslint-disable global-require */
// @ts-check
const path = require('path');
const puppeteer = require('puppeteer');
// @ts-ignore
const { ChildProcessWithoutNullStreams } = require('child_process');
const { stdout } = require('process');
const { log } = require('../packages/server/dist/utils/lib');
const exConfig = require('./rooms.example.json');
const { openRoom, startServer } = require('./lib');

let importErr = false;
/**
 * @type {any}
 */
let config;
try {
  // @ts-ignore
  config = require('./rooms.json');
  log('info', `Config file ${path.resolve(__dirname, 'rooms.json')} used.`, {
    CI: Boolean(process.env.CI),
    TEST_NEXT: Boolean(process.env.TEST_NEXT),
  });
} catch (e) {
  log(
    'warn',
    `Config file ${path.resolve(
      __dirname,
      '../rooms.json'
    )} not specified, use default ${path.resolve(__dirname, '../rooms.example.json')}`,
    {
      CI: Boolean(process.env.CI),
      TEST_NEXT: Boolean(process.env.TEST_NEXT),
    }
  );
  importErr = true;
}

const { rooms, users, headless, singleRoom, url, delay } = importErr ? exConfig : config;

process.setMaxListeners(0);

let id = 1;

// Settings
const ROOMS = singleRoom ? 1 : rooms;
const USERS = users;

const EXIT_DELAY = 1000;

/**
 *
 * @typedef {{
 *  page: puppeteer.Page;
 *  uid: string;
 *  room: string;
 * }} EvalPage
 * @typedef {{server: ChildProcessWithoutNullStreams; client: ChildProcessWithoutNullStreams | undefined}} StartServer
 */

let count = 0;
let success = 0;
let errors = 0;
let warnings = 0;

/**
 * @typedef {Record<string, boolean>} Timeupdate
 */

function stdoutClean() {
  if (!process.env.CI) {
    stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
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
    stdoutClean();
    oldNumber = `${--seconds}`;
    stdout.write(oldNumber);
  }, 1000);
}

/**
 * @type {Timeupdate}
 */
let timeupdate = {};
/**
 *
 * @param {EvalPage} evalPage
 * @param {StartServer | 0} res
 * @param {boolean} last
 */
async function evaluateRoom(evalPage, res, last = false) {
  const { page, room, uid } = evalPage;
  const coeff = (USERS + ROOMS) / 1000;
  const d = Math.ceil(delay >= 1000 ? delay * coeff : (1000 * coeff) / 2);
  log('log', 'Maybe wait for page evaluate:', `${d} seconds ...`, true);
  const t = stdoutWrite(d);
  timeupdate = await page.evaluate(
    async (_uid, _delay) => {
      /**
       * @type {Timeupdate}
       */
      const _timeupdate = {};
      const _videos = document.querySelectorAll('video');
      _videos[0]?.parentElement?.parentElement?.focus();
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(0);
        }, _delay);
      });
      let check = false;
      const streamIds = [];
      for (let i = 0; _videos[i]; i++) {
        const video = _videos[i];
        /**
         * @type {any}
         */
        const { id: _id } = video.parentElement;
        const { id: __id } = video;
        _timeupdate[__id] = await new Promise((resolve) => {
          video.ontimeupdate = () => {
            resolve(true);
          };
          setTimeout(() => {
            resolve(false);
          }, 3000);
        });
        video.ontimeupdate = () => {
          /** */
        };
        if (streamIds.indexOf(_id) !== -1) {
          console.log(`Non unique stream: ${_id} for uid: ${_uid}`);
        }
        streamIds.push(_id);
        if (__id === _uid) {
          check = true;
        }
      }
      if (!check) {
        console.log(`Self stream not defined uid: ${_uid}`);
      }
      return _timeupdate;
    },
    uid,
    d,
    USERS
  );
  clearInterval(t);
  // stdoutClean();
  const k = Object.keys(timeupdate);
  const tUval = k.filter((item) => timeupdate[item] === false);
  tUval.forEach(() => {
    warnings++;
  });
  log(tUval.length === 0 ? 'info' : 'warn', `Videos played ${evalPage.uid}`, timeupdate, true);

  const videos = await page.$$('video');
  const { length } = videos;
  count++;
  if (length < USERS) {
    await page.waitForTimeout(((USERS * ROOMS) / 2) * 1000);
  }
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
        let code = 0;
        if (errors === 0) {
          if (warnings !== 0) {
            code = 1;
          }
        } else {
          code = 1;
        }
        if (res !== 0) {
          const { client, server } = res;
          server.kill();
          if (process.env.TEST_NEXT !== 'false' && client) {
            client.kill();
          }
        }
        process.exit(code);
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
  const _delay = Math.ceil(new Date().getTime() - startTime);
  return _delay * ROOMS * USERS;
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
  const res = await startServer();
  log('log', 'Start test ...', { USERS, ROOMS }, true);
  /**
   * @type {EvalPage[]}
   */
  const pages = [];
  let startTime = new Date().getTime();
  for (let i = 0; i < ROOMS; i++) {
    const room = typeof singleRoom === 'string' ? singleRoom : (++id).toString();
    for (let n = 0; n < USERS; n++) {
      if (n + 1 === USERS && i + 1 === ROOMS) {
        startTime = new Date().getTime();
      }
      const uid = (++id).toString();
      const page = await openRoom(url, room, uid, headless);
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
    await evaluateRoom(pages[i], res);
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
    await evaluateRoom(pages[i], res, true);
  }
})();
