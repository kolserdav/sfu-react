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
import { firefox, Page } from 'playwright';
import { HEADLESS, VIEWPORT, ROOM_URL } from '../utils/constants';

class Browser {
  public pages: Record<string, Page> = {};

  public async createRoom({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }): Promise<{ page: Page }> {
    const browser = await firefox.launch({
      headless: false,
      devtools: true,
      args: [
        '--allow-file-access-from-files',
        '--disable-gesture-requirement-for-media-playback',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
      ],
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize(VIEWPORT);
    await page.goto(`${ROOM_URL}/${roomId}?uid=${userId}`);
    this.pages[roomId] = page;
    return { page };
  }

  public closeRoom({ roomId }: { roomId: string }) {
    this.pages[roomId].close();
  }
}

export default Browser;
