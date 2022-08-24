// @ts-check
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');
const { log } = require('../packages/server/dist/utils/lib');
const { stdout } = require('process');
const exConfig = require('./rooms.example.json');

let importErr = false;
/**
 * @type {any}
 */
let config;
try {
  config = require('./rooms.json');
} catch (e) {
  log(
    'warn',
    `Config file ${path.resolve(
      __dirname,
      '../rooms.json'
    )} not specified, use default ${path.resolve(__dirname, '../rooms.example.json')}`,
    {
      CI: Boolean(process.env.CI),
    }
  );
  importErr = true;
}

let { rooms, users, headless, singleRoom, url, delay } = importErr ? exConfig : config;

process.setMaxListeners(0);

let id = 0;

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
  const coeff = (USERS + ROOMS) / 1000;
  const d = Math.ceil(delay >= 1000 ? delay * coeff : (1000 * coeff) / 2);
  log('log', 'Maybe wait for page evaluate:', `${d} seconds ...`, true);
  const t = stdoutWrite(d);
  timeupdate = await page.evaluate(
    async (_uid, _delay, users) => {
      /**
       * @type {Timeupdate}
       */
      let _timeupdate = {};
      const _videos = document.querySelectorAll('video');
      _videos[0].parentElement?.parentElement?.focus();
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
        const { id } = video.parentElement;
        const { id: _id } = video;
        _timeupdate[_id] = await new Promise((resolve) => {
          video.ontimeupdate = () => {
            resolve(true);
          };
          setTimeout(() => {
            resolve(false);
          }, 3000);
        });
        video.ontimeupdate = () => {};
        if (streamIds.indexOf(id) !== -1) {
          console.log(`Non unique stream: ${id} for uid: ${_uid}`);
        }
        streamIds.push(id);
        if (_id === _uid) {
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
        if (errors === 0) {
          if (warnings !== 0) {
            process.exit(1);
          }
          process.exit(0);
        } else {
          process.exit(1);
        }
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
  return delay * ROOMS * USERS;
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

function stdoutClean() {
  if (!Boolean(process.env.CI)) {
    stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
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

/**
 *
 * @returns {Promise<1 | 0>}
 */
const startServer = async () => {
  log('log', 'Run command:', '"npm run prod:migrate"', true);
  let res = spawn('npm', ['run', 'prod:migrate'], {
    env: {
      PATH: process.env.PATH,
    },
  });
  res.stdout.on('data', (d) => {
    console.log(d.toString());
  });
  res.stderr.on('data', (d) => {
    const data = d.toString();
    console.log(data);
  });
  await new Promise((resolve) => {
    res.on('exit', () => {
      resolve(0);
    });
  });
  log('log', 'Run command:', '"npm run start"', true);
  res = spawn('npm', ['run', 'start'], {
    env: {
      PATH: process.env.PATH,
    },
  });
  res.stdout.on('data', (d) => {
    console.log(d.toString());
  });
  res.stderr.on('data', (d) => {
    const data = d.toString();
    console.log(data);
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, 4000);
  });
};

(async () => {
  if (process.env.CI) {
    await startServer();
  }
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
