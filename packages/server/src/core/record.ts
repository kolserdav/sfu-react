/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: record.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Fri Jul 29 2022 21:35:51 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import puppeteer from 'puppeteer';
import path from 'path';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { HEADLESS, VIEWPORT, APP_URL } from '../utils/constants';

export const createRoom = async ({
  roomId,
  recordVideo = false,
}: {
  roomId: string;
  recordVideo?: boolean;
}): Promise<{ page: puppeteer.Page; recorder?: PuppeteerScreenRecorder }> => {
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
  await page.setViewport(VIEWPORT);
  await page.goto(`${APP_URL}/${roomId}?room=1`);
  if (recordVideo) {
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
    return { page, recorder };
  }

  return { page };
};
