import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WS from '../../core/ws';
import RTC from '../../core/rtc';
import DB from '../../core/db';
import { setLoginCookie, setTokenCookie } from '../../utils/lib';
import { MessageType } from '../../types/interfaces';
import s from './Router.module.scss';
import { useHandleMessages } from './Router.hooks';

const createStreams = (
  strArr: { stream: MediaStream; userId: number }[]
): { userId: number; ref: React.Ref<HTMLVideoElement> }[] =>
  strArr.map((item) => ({
    userId: item.userId,
    ref: (node: HTMLVideoElement) => {
      // eslint-disable-next-line no-param-reassign
      if (node) node.srcObject = item.stream;
    },
  }));

function Router() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const [restart, setRestart] = useState<boolean>(false);
  const ws = useMemo(() => new WS(), [restart, pathname]);
  const rtc = useMemo(() => new RTC({ ws }), [restart, pathname]);
  const db = useMemo(() => new DB(), [restart, pathname]);
  const { auth, loggedAs, streams, id } = useHandleMessages({ ws, db, rtc, restart });

  const login = () => {
    const email = prompt('Set email');
    if (email) {
      ws.sendMessage({
        type: MessageType.GET_AUTH,
        id,
        token: '',
        data: {
          email,
        },
      });
    }
  };

  const logout = () => {
    setTokenCookie('null');
    setRestart(!restart);
  };

  const createRoom = () => {
    navigate(`/${new Date().getTime()}`);
  };

  /**
   * onFocus page
   */
  useEffect(() => {
    window.onfocus = () => {
      if (process.env.NODE_ENV === 'production') {
        setRestart(!restart);
      }
    };
    return () => {
      window.onfocus = () => {
        /** */
      };
    };
  }, [id, db]);

  /**
   * Save id
   */
  useEffect(() => {
    if (id) {
      setLoginCookie({ userId: id });
    }
  }, [id]);

  const _streams = useMemo(() => createStreams(streams), [streams]);
  const roomLink = `${window.location.href.replace(/\?.*/, '')}${
    process.env.NODE_ENV === 'development' ? '?userId=0' : ''
  }`;
  return (
    <div>
      {loggedAs && <div>Logged as {loggedAs}</div>}
      {!auth ? (
        <button type="button" onClick={login}>
          Login
        </button>
      ) : (
        <button type="button" onClick={logout}>
          Logout
        </button>
      )}
      <button type="button" onClick={createRoom}>
        Create room
      </button>
      <a href={roomLink}>{roomLink}</a>
      <div className={s.container}>
        {_streams.map((item) => (
          <div key={item.userId} className={s.video}>
            <video
              width={300}
              height={200}
              ref={item.ref}
              id={item.userId.toString()}
              title={item.userId.toString()}
              autoPlay
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Router;
