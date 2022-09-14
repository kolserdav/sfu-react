import React from 'react';
import { useRouter, NextRouter } from 'next/router';
import Main from '../src/package/Main';

const checkRouterIsLoad = (router: NextRouter) => !/\]/.test(router.asPath);

function Room() {
  const router = useRouter();
  return (
    <div>
      {checkRouterIsLoad(router) && (
        <Main
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
