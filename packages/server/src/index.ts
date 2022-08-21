/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { spawn } from 'child_process';
import path from 'path';
import { log } from './utils/lib';
import Server from './main';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line import/no-relative-packages
import { name, version } from '../../../package';

log('info', `${name}@${version} started`, '...', true);

const processArgs = process.argv;
const DEFAULT_PARAMS = {
  port: '3001',
  cors: '',
  db: 'mysql://user:password@127.0.0.1:3306/uyem_db',
};
const ARGS = {
  port: 'Server websocket port',
  cors: 'Allowed origins',
  db: `Database url ${DEFAULT_PARAMS.db}`,
  version: 'Show installed version',
  migrate: 'Run only migrate script',
};
const argv: Partial<typeof ARGS> & Record<string, string> = { ...DEFAULT_PARAMS };
processArgs.forEach((item, index) => {
  if (/^-{1,2}\w+/.test(item)) {
    argv[item.replace(/-/g, '')] = process.argv[index + 1];
  }
});

const args = Object.keys(argv);

const migrate = async (): Promise<number> => {
  const res = spawn('npm', ['run', 'prod:migrate'], {
    env: process.env,
    cwd: path.resolve(__dirname, '../../..'),
  });
  res.stdout.on('data', (d) => {
    // eslint-disable-next-line no-console
    console.log(d.toString());
  });
  res.stderr.on('data', (d) => {
    log('error', d.toString(), '', true);
  });
  return new Promise((resolve) => {
    res.on('exit', (e) => {
      resolve(e);
    });
  });
};

const REQUIRED: (keyof typeof ARGS)[] = [];

const defKeys = Object.keys(ARGS);
const skipedReq = [];

for (let i = 0; REQUIRED[i]; i++) {
  const rArg = REQUIRED[i];
  if (args.indexOf(rArg) === -1) {
    skipedReq.push(rArg);
  }
}

if (skipedReq.length) {
  log('warn', 'Missing required parameter(s):', REQUIRED.join(', '), true);
  // eslint-disable-next-line no-console
  console.log('\n');
  process.exit(1);
}

let port = 3000;
let cors = '';
let code = 0;
let db = '';
(async () => {
  for (let n = 0; args[n]; n++) {
    const arg: string = args[n];
    switch (arg) {
      case 'port':
        port = parseInt(argv.port || DEFAULT_PARAMS.port, 10);
        if (Number.isNaN(port)) {
          log('warn', 'Required number type of port, received:', port, true);
          code = 1;
          break;
        }
        break;
      case 'cors':
        log('info', 'Set up Simple-CORS defence:', argv.cors);
        cors = argv.cors || DEFAULT_PARAMS.cors;
        break;
      case 'db':
        log('info', 'Set up database url:', argv.db);
        db = argv.db || DEFAULT_PARAMS.db;
        if (db === DEFAULT_PARAMS.db) {
          log('warn', 'Parameter "db" not specified, using default:', DEFAULT_PARAMS.db, true);
        } else {
          log('info', 'Using database url:', db, true);
        }
        process.env.DATABASE_URL = db;
        break;
      case 'help':
        log('info', `$ uyem [option] [value] > options:`, ARGS, true);
        code = 0;
        break;
      case 'migrate':
        log('info', 'Start migrate only script...', '', true);
        break;
      default:
        log('warn', 'Unknown argument:', arg);
        for (let i = 0; defKeys[i]; i++) {
          if (new RegExp(arg).test(defKeys[i])) {
            log('info', 'Maybe need: ', defKeys[i], true);
            break;
          }
        }
        log('info', 'Try run:', '--help');
        code = 1;
    }
  }
  log('info', 'Running "npm run prod:migrate" command...', '', true);
  if (code !== 0) {
    log('warn', 'Script end with code:', code, true);
  } else {
    code = await migrate();
    if (args.indexOf('--migrate')) {
      log(code ? 'warn' : 'info', 'Migrate exit with code', code, true);
      return;
    }
    if (code !== 0) {
      log('warn', 'Script end with code:', code, true);
      return;
    }
    Server({ port, cors });
  }
})();
