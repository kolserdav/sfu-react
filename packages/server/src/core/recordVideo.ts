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
import { cancelable, CancelablePromise } from 'cancelable-promise';
import path from 'path';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { HEADLESS, VIEWPORT, APP_URL } from '../utils/constants';
import { MessageType, SendMessageArgs } from '../types/interfaces';
import WS from './ws';

class RecordVideo {
  public recordPages: Record<string, puppeteer.Page> = {};

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
    this.recordPages[roomId] = page;
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
    const savePath = path.resolve(__dirname, `../../tmp/${roomId}.mp4`);
    await recorder.start(savePath);
    let intervaToClean = setInterval(() => {
      /** */
    }, Infinity);
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
            command: 'start',
          },
        });
      }, 1000);
    });
    return { page, recorder, cancelablePromise, intervaToClean };
  }

  public async handleVideoRecord(args: SendMessageArgs<MessageType.GET_RECORD>) {
    const prom = this.startRecord(args);
    prom.then(({ cancelablePromise, intervaToClean }) => {
      console.log(cancelablePromise);
    });
  }
}
export default RecordVideo;
