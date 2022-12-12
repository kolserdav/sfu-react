/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: [id].tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React from 'react';
import { useRouter, NextRouter } from 'next/router';
import dynamic from 'next/dynamic';

const Main = dynamic(() => import('../../src/package/Main'));

const checkRouterIsLoad = (router: NextRouter) => !/\]/.test(router.asPath);

function Room() {
  const router = useRouter();

  return (
    <div>
      {checkRouterIsLoad(router) && (
        <Main
          // Required props *}
          userId={window.location.search.replace(/\?uid=/, '')}
          // Optional props
          server="localhost"
          port={3001}
          iceServers={[
            {
              urls: ['stun:127.0.0.1:3478'],
            },
            {
              urls: ['turn:127.0.0.2:3478'],
              username: 'username',
              credential: 'password',
            },
          ]}
          name="John Doe"
        />
      )}
    </div>
  );
}

export default Room;
