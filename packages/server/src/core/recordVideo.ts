/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: record.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import puppeteer from 'puppeteer';
import { CancelablePromise } from 'cancelable-promise';
import path from 'path';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { HEADLESS, VIEWPORT, APP_URL } from '../utils/constants';
import { ErrorCode, MessageType, SendMessageArgs } from '../types/interfaces';
import WS from './ws';
import { getLocale, log } from '../utils/lib';

class RecordVideo {
  public recordPages: Record<string, SendMessageArgs<MessageType.SET_RECORDING>> = {};

  public pages: Record<string, { page: puppeteer.Page; browser: puppeteer.Browser }> = {};

  public ws: WS;

  constructor({ ws: _ws }: { ws: WS }) {
    this.ws = _ws;
  }

  async startRecord({
    id: roomId,
    data: { userId },
  }: SendMessageArgs<MessageType.GET_RECORD>): Promise<{
    page: puppeteer.Page;
    recorder?: PuppeteerScreenRecorder;
    cancelablePromise?: CancelablePromise<string>;
    intervaToClean?: NodeJS.Timeout;
  }> {
    const browser = await puppeteer.launch({
      headless: HEADLESS,
      devtools: !HEADLESS,
      args: [
        '--allow-file-access-from-files',
        '--disable-gesture-requirement-for-media-playback',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    });
    const [page] = await browser.pages();
    page.on('close', () => {
      log('warn', 'Record page on close', {});
    });
    if (!this.pages[roomId]) {
      this.pages[roomId] = {
        page,
        browser,
      };
    }
    await page.setViewport(VIEWPORT);
    // TODO get uid
    await page.goto(`${APP_URL}/${roomId}?uid=record-${new Date().getTime()}&record=1`);

    const Config = {
      followNewTab: true,
      fps: 25,
      ffmpeg_Path: null,
      videoFrame: VIEWPORT,
      aspectRatio: '16:9',
    };
    const recorder = new PuppeteerScreenRecorder(page, Config);
    const savePath = path.resolve(__dirname, `../../rec/${roomId}.mp4`);
    await recorder.start(savePath);
    let intervaToClean = setInterval(() => {
      /** */
    }, 10000000);
    const cancelablePromise = new CancelablePromise((_) => {
      let time = 0;
      intervaToClean = setInterval(() => {
        time++;
        this.ws.sendMessage({
          type: MessageType.SET_RECORDING,
          id: userId,
          connId: '',
          data: {
            time,
            command: this.recordPages[roomId]?.data.command || 'stop',
          },
        });
      }, 1000);
    });
    return { page, recorder, cancelablePromise, intervaToClean };
  }

  public async handleVideoRecord(args: SendMessageArgs<MessageType.GET_RECORD>) {
    const {
      id,
      data: { userId, command },
      connId,
    } = args;
    const prom = this.startRecord(args);
    const locale = getLocale(this.ws.users[userId].locale).server;
    this.recordPages[id] = {
      id,
      data: {
        command,
        time: 0,
      },
      connId: '',
      type: MessageType.SET_RECORDING,
    };
    let interval = setInterval(() => {
      /** */
    }, 100000000);
    prom.then(async ({ cancelablePromise, recorder, intervaToClean }) => {
      await new Promise((resolve) => {
        interval = setInterval(() => {
          const {
            data: { command: _command },
          } = this.recordPages[id];
          switch (_command) {
            case 'stop':
              cancelablePromise.cancel();
              clearInterval(interval);
              recorder.stop();
              clearInterval(intervaToClean);
              this.ws.sendMessage({
                type: MessageType.SET_ERROR,
                id: userId,
                connId,
                data: {
                  type: 'info',
                  code: ErrorCode.videoRecordStop,
                  message: locale.videoRecordStop,
                },
              });
              if (this.pages[id]) {
                this.pages[id].page.close().then(() => {
                  this.pages[id].browser.close();
                  delete this.pages[id];
                });
              } else {
                log('warn', 'Record page not found', { id });
              }
              resolve(0);
              break;
            default:
          }
        }, 1000);
      });
    });
  }
}
export default RecordVideo;
