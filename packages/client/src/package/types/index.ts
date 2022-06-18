/******************************************************************************************
 * Repository: https://github.com/kolserdav/uyem.git
 * File name: index.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: BSD-2-Clause
 * License text: Binary distributions of this software include WebRTC and other third-party libraries.
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Sun Jun 19 2022 01:44:53 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
export interface RoomProps {
  id: number | string;
}

export interface Streams {
  targetId: number | string;
  stream: MediaStream;
  ref: React.Ref<HTMLVideoElement>;
}
