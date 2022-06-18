/******************************************************************************************
 * Repository: https://github.com/kolserdav/julia-teams.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Sat Jun 18 2022 10:59:02 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { log } from './utils/lib';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { name, version } from '../../../package.json';

log('info', `${name}@${version} started`, '...', true);

process.on('uncaughtException', (err: Error) => {
  log('error', 'uncaughtException', err);
});
process.on('unhandledRejection', (err: Error) => {
  log('error', 'unhandledRejection', err);
});

const argv = yargs(hideBin(process.argv)).argv;

const args = Object.keys(argv);

const ARGS = {
  port: 'Server websocket port',
  version: 'Show installed version',
};

const REQUIRED: (keyof typeof ARGS)[] = ['port'];

const defKeys = Object.keys(ARGS);
const skipedReq = [];

for (let i = 0; REQUIRED[i]; i++) {
  const rArg = REQUIRED[i];
  if (args.indexOf(rArg) === -1) {
    skipedReq.push(rArg);
  }
}
if (skipedReq.length) {
  log('error', 'Missing required parameter(s):', REQUIRED.join(', '), true);
  console.log('\n');
  process.exit(1);
}

for (let n = 0; args[n]; n++) {
  const arg = args[n];
  switch (arg) {
    case 'port':
      break;
    case 'help':
      log('info', ``, ARGS, true);
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
      process.exit(1);
  }
}
