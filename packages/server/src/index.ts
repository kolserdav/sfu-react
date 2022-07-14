/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: 
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { log } from './utils/lib';
import Server from './main';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { name, version } from '../../../package.json';

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
};
const argv: Partial<typeof ARGS> & Record<string, string> = DEFAULT_PARAMS;
processArgs
  .map((item, index) => {
    if (/^-{1,2}\w+/.test(item)) {
      argv[item.replace(/-/g, '')] = process.argv[index + 1];
    }
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .filter((item) => item !== undefined) as any;

const args = Object.keys(argv);

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
  console.log('\n');
  process.exit(1);
}

let port = 3000;
let cors = '';
let code = 0;

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
      cors = argv.db || DEFAULT_PARAMS.db;
      break;
    case 'help':
      log('info', `$ uyem [option] [value] > options:`, ARGS, true);
      code = 0;
      break;
    default:
      if (arg === '$0' || arg === '_') {
        break;
      }
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
if (code !== undefined) {
  log('warn', 'Script end with code:', code, true);
} else {
  Server({ port, cors });
}
