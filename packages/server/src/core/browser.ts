/******************************************************************************************
 * Repository: https://github.com/kolserdav/react-node-webrtc-sfu.git
 * File name: page.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text:
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Thu Jul 14 2022 16:24:49 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import puppeteer from 'puppeteer';
import { HEADLESS, VIEWPORT, ROOM_URL } from '../utils/constants';

class Browser {
  public async createRoom({ roomId }: { roomId: string }): Promise<{ page: puppeteer.Page }> {
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
    await page.goto(`${ROOM_URL}/room/${roomId}`);
    return { page };
  }
}

export default Browser;
