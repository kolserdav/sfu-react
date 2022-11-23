/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Settings.lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
// eslint-disable-next-line import/prefer-default-export
export const getVideoSrc = ({
  port,
  server,
  name,
  roomId,
}: {
  port: number;
  server: string;
  name: string;
  roomId: string | number;
}) => {
  let protocol = 'http:';
  if (typeof window !== 'undefined') {
    protocol = window.location.protocol;
  }
  return `${protocol}//${server}:${port}/${roomId}/${name}`;
};
