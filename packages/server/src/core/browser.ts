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
  public pages: Record<string, puppeteer.Page> = {};

  public async createRoom({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }): Promise<{ page: puppeteer.Page }> {
    const browser = await puppeteer.launch({
      headless: HEADLESS,
      devtools: !HEADLESS,
      args: [
        '--disable-features=WebRtcHideLocalIpsWithMdns',
        '--disable-field-trial-config',
        '--allow-file-access-from-files',
        '--disable-gesture-requirement-for-media-playback',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    });
    const [page] = await browser.pages();
    await page.setViewport(VIEWPORT);
    await page.goto(`${ROOM_URL}/${roomId}?uid=${userId}`);
    this.pages[roomId] = page;
    return { page };
  }

  public closeRoom({ roomId }: { roomId: string }) {
    this.pages[roomId].close();
  }
}

export default Browser;
