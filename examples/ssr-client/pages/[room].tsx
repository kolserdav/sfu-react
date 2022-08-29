import React from 'react';
import { useRouter, NextRouter } from 'next/router';
import dynamic from 'next/dynamic';

const Uyem = dynamic(() => import('uyem'));

/**
 * Check if router.asPath are not contain []
 * it is optional, you can to get userId an another way
 */
const checkRouterIsLoad = (router: NextRouter) => !/\]/.test(router.asPath);

function Room() {
  const router = useRouter();
  return (
    <div>
      {checkRouterIsLoad(router) && (
        <Uyem
          room={{
            server: 'localhost',
            port: 3001,
            iceServers: [
              {
                urls: ['stun:127.0.0.1:3478'],
              },
              {
                urls: ['turn:127.0.0.2:3478'],
                username: 'username',
                credential: 'password',
              },
            ],
            userId: router.asPath.replace(/.+\?uid=/, '') || '0',
          }}
        />
      )}
    </div>
  );
}

export default Room;
