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
import * as werift from 'werift';
import { CancelablePromise } from 'cancelable-promise';
import FFmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { PassThrough } from 'stream';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { v4 } from 'uuid';
import { HEADLESS, VIEWPORT, APP_URL } from '../utils/constants';
import { ErrorCode, MessageType, SendMessageArgs, RECORD_VIDEO_NAME } from '../types/interfaces';
import DB from '../core/db';
import { getLocale, log } from '../utils/lib';
import Settings from './settings';
import RTC from '../core/rtc';

class RecordVideo extends DB {
  public recordPages: Record<string, SendMessageArgs<MessageType.SET_RECORDING>> = {};

  public pages: Record<string, { page: puppeteer.Page; browser: puppeteer.Browser; time: number }> =
    {};

  public mediaRecorders: Record<string, { path: string; mediaRecorder: werift.MediaRecorder }[]> =
    {};

  public settings: Settings;

  private passTroughs: Record<string, PassThrough> = {};

  private rtc: RTC;

  constructor({ settings: _settings, rtc: _rtc }: { settings: Settings; rtc: RTC }) {
    super();
    this.settings = _settings;
    this.rtc = _rtc;
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
      log('info', 'Record page on close', {});
    });
    if (!this.pages[roomId]) {
      this.pages[roomId] = {
        page,
        browser,
        time: 0,
      };
    }
    await page.setViewport(VIEWPORT);
    await page.goto(
      `${APP_URL}/${roomId}?uid=${RECORD_VIDEO_NAME}-${new Date().getTime()}&${RECORD_VIDEO_NAME}=1`
    );
    const recorder = new PuppeteerScreenRecorder(page, {
      followNewTab: true,
      fps: 25,
      ffmpeg_Path: null,
      videoFrame: VIEWPORT,
      aspectRatio: '16:9',
    });
    const iat = new Date().getTime();
    await page.waitForSelector('video');
    this.passTroughs[roomId] = new PassThrough();
    await recorder.startStream(this.passTroughs[roomId]);
    const roomVideoDir = path.resolve(__dirname, `../../rec/${roomId}`);
    if (!fs.existsSync(roomVideoDir)) {
      fs.mkdirSync(roomVideoDir);
    }
    const destination = `${roomVideoDir}/${iat}.mp4`;

    this.mediaRecorders[roomId] = await this.getSoundStream({ roomId });
    new FFmpeg()
      .input(this.passTroughs[roomId])
      .on('end', (d) => {
        console.log('end', d);
      })
      .input(this.mediaRecorders[roomId][0].path, {
        frames: NaN,
        currentFps: NaN,
        currentKbps: NaN,
        targetSize: 0,
        timemark: '00:00:00.00',
      })
      .saveToFile(destination);

    let intervaToClean = setInterval(() => {
      /** */
    }, 10000000);
    this.videoCreate({
      data: {
        name: `${iat}.mp4`,
        roomId: roomId.toString(),
        time: 0,
      },
    });
    const cancelablePromise = new CancelablePromise(() => {
      let time = 0;
      intervaToClean = setInterval(() => {
        time++;
        if (this.pages[roomId]) {
          this.pages[roomId].time = time;
          const { command } = this.recordPages[roomId].data;
          this.settings.sendMessage(
            {
              msg: {
                type: MessageType.SET_RECORDING,
                id: userId,
                connId: '',
                data: {
                  time,
                  command,
                },
              },
              roomId,
            },
            () => {
              if (command === 'stop') {
                clearInterval(intervaToClean);
              }
            }
          );
        } else {
          log('warn', 'Page of room not found', { time, roomId });
        }
      }, 1000);
    });
    return { page, recorder, cancelablePromise, intervaToClean };
  }

  private async getSoundStream({ roomId }: { roomId: string | number }) {
    const keys = this.rtc.getKeysStreams(roomId).filter((item) => {
      const peer = item.split(this.rtc.delimiter);
      return !new RegExp(`^${RECORD_VIDEO_NAME}`).test(peer[1]);
    });
    return keys.map((item) => {
      const id = v4();
      const audio = this.rtc.streams[roomId][item].find((_item) => _item.kind === 'audio');
      const _path = path.resolve(__dirname, `../../rec/${roomId}-${id}.webm`);
      const mediaRecorder = new werift.MediaRecorder([audio], _path, { width: 1, height: 1 });
      mediaRecorder.start();
      return {
        path: _path,
        mediaRecorder,
      };
    });
  }

  private async closeVideoRecord({
    cancelablePromise,
    interval,
    args,
    recorder,
    time,
    roomId,
  }: {
    cancelablePromise: CancelablePromise<string>;
    interval: NodeJS.Timeout;
    recorder: PuppeteerScreenRecorder;
    args: SendMessageArgs<MessageType.GET_RECORD>;
    time: number;
    roomId: string | number;
  }) {
    const {
      id,
      connId,
      data: { userId },
    } = args;
    const locale = getLocale(this.settings.users[id][userId].locale).server;
    clearInterval(interval);
    await recorder.stop();
    const keys = Object.keys(this.mediaRecorders[roomId]);
    for (let i = 0; keys[i]; i++) {
      const item = this.mediaRecorders[roomId][i];
      // eslint-disable-next-line no-await-in-loop
      await item.mediaRecorder.stop();
    }
    this.settings.sendMessage({
      msg: {
        type: MessageType.SET_ERROR,
        id: userId,
        connId,
        data: {
          type: 'info',
          code: ErrorCode.videoRecordStop,
          message: locale.videoRecordStop,
        },
      },
      roomId: id,
    });
    this.videoUpdateTime({ roomId: id, time });
    if (this.pages[id]) {
      log('info', 'Record page was closed', { id });
      this.pages[id].page
        .close()
        .then(() => {
          this.pages[id].browser.close().catch(() => {
            //
          });
          delete this.pages[id];
        })
        .catch(() => {
          delete this.pages[id];
        });
    }
    cancelablePromise.cancel();
  }

  public async handleVideoRecord(args: SendMessageArgs<MessageType.GET_RECORD>) {
    const {
      id,
      data: { command, userId },
      connId,
    } = args;
    this.recordPages[id] = {
      id,
      data: {
        command,
        time: 0,
      },
      connId,
      type: MessageType.SET_RECORDING,
    };
    if (command !== 'start') {
      return;
    }
    const prom = this.startRecord(args);
    let interval = setInterval(() => {
      /** */
    }, 100000000);
    prom.then(async ({ cancelablePromise, recorder, intervaToClean }) => {
      this.pages[id]?.page.on('close', () => {
        if (this.recordPages[id]?.data.command === 'stop') {
          return;
        }
        this.settings.sendMessage({
          msg: {
            type: MessageType.SET_RECORDING,
            id: userId,
            connId,
            data: {
              time: this.pages[id].time,
              command: 'stop',
            },
          },
          roomId: id,
        });
        this.closeVideoRecord({
          cancelablePromise,
          interval,
          time: this.pages[id].time,
          args,
          roomId: id,
          recorder,
        });
      });
      await new Promise((resolve) => {
        interval = setInterval(() => {
          const {
            data: { command: _command, time },
          } = this.recordPages[id];
          switch (_command) {
            case 'stop':
              this.closeVideoRecord({
                cancelablePromise,
                interval,
                time,
                args,
                roomId: id,
                recorder,
              });
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
