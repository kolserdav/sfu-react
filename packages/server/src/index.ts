// @ts-check
/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { exec } from 'child_process';
import path from 'path';
import { cleanDbUrl, log } from './utils/lib';
import { LogLevel } from './types/interfaces';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line import/no-relative-packages
import { name, version } from '../../../package';
import { DATABASE_URL } from './utils/constants';

log('info', `${name}@${version} started`, '...', true);
process.chdir(path.resolve(__dirname, '../../..'));

const processArgs = process.argv;
const DEFAULT_PARAMS = {
  port: '3001',
  cors: '',
  db: 'mysql://user:password@127.0.0.1:3306/uyem_db',
  cloud: '/tmp',
};
const ARGS = {
  help: 'This document',
  port: 'Server websocket port',
  log: 'Level of logs 0 - all | 1 - info | 2 - warn | 3 - error',
  cors: 'Allowed origins',
  db: `Database url ${DEFAULT_PARAMS.db}`,
  version: 'Show installed version',
  migrate: 'Run only migrate script',
  cloud: 'Video recording and image storage path',
};
const argv: Partial<typeof ARGS> & Record<string, string> = { ...DEFAULT_PARAMS };
processArgs.forEach((item, index) => {
  if (/^-{1,2}\w+/.test(item)) {
    argv[item.replace(/-/g, '')] = process.argv[index + 1];
  }
});

const args = Object.keys(argv);

const migrate = async (): Promise<number | null> => {
  log('info', 'Running "npm run migrate" command...', '', true);
  return new Promise((resolve) => {
    const res = exec(
      'npm run migrate',
      {
        env: process.env,
        cwd: path.resolve(__dirname, '../../..'),
      },
      (error) => {
        if (error) {
          log('error', 'Failed "npm run migrate" command', error);
          resolve(error.code || 0);
        }
      }
    );
    res.stdout?.on('data', (d) => {
      // eslint-disable-next-line no-console
      console.log(d.toString());
    });
    res.stderr?.on('data', (d) => {
      log('error', d.toString(), '', true);
    });

    res.on('exit', (e) => {
      resolve(e);
    });
  });
};

const REQUIRED: (keyof typeof ARGS)[] = [];

const defKeys = Object.keys(ARGS);
const skipedReq: (keyof typeof ARGS)[] = [];

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
let logLevel: LogLevel;
let db = '';
let cloud = '';
let skipMigrate = false;
(async () => {
  for (let n = 0; args[n]; n++) {
    const arg: string = args[n];
    switch (arg) {
      case 'help':
        log('info', `$ uyem --[option] [value]`, '>', true);
        log('info', 'Options:', ARGS, true);
        code = 0;
        skipMigrate = true;
        break;
      case 'log':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logLevel = parseInt(argv.log as string, 10) as any;
        if (Number.isNaN(logLevel)) {
          log('warn', 'Argument "log" is not a number', argv.log, true);
          code = 1;
        }
        break;
      case 'port':
        port = parseInt(argv.port || DEFAULT_PARAMS.port, 10);
        if (Number.isNaN(port)) {
          log('warn', 'Required number type of "port", received:', port, true);
          code = 1;
          break;
        }
        break;
      case 'cloud':
        cloud = argv.cloud || DEFAULT_PARAMS.cloud;
        break;
      case 'cors':
        log('info', 'Set up Simple-CORS defence:', argv.cors);
        cors = argv.cors || DEFAULT_PARAMS.cors;
        break;
      case 'db':
        db = argv.db || DEFAULT_PARAMS.db;
        process.env.DATABASE_URL = db || DATABASE_URL;
        if (db === DEFAULT_PARAMS.db && !skipMigrate) {
          log('warn', 'Parameter "db" not specified, using default:', DEFAULT_PARAMS.db, true);
        } else if (!skipMigrate) {
          log('info', 'Using database url:', cleanDbUrl(db), true);
        }
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
  if (code !== 0) {
    log('warn', 'Script end with code:', code, true);
  } else {
    if (!skipMigrate) {
      code = (await migrate()) || 0;
      if (process.argv.indexOf('--migrate') !== -1) {
        log(code ? 'warn' : 'info', 'Migrate exit with code', code, true);
        return;
      }
    }
    if (code !== 0) {
      log('warn', 'Script end with code:', code, true);
    } else if (!skipMigrate) {
      // eslint-disable-next-line global-require
      import('./main').then(({ createServer }) => {
        createServer({ port, cors, logLevel, cloudPath: cloud, db });
      });
    }
  }
})();
