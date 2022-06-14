/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable no-case-declarations */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WS from '../../core/ws';
import DB from '../../core/db';
import {
  log,
  setLoginCookie,
  getLoginCookie,
  parseQueryString,
  setTokenCookie,
  getTokenCookie,
} from '../../utils/lib';
import { MessageType } from '../../types/interfaces';
import RTC from '../../core/rtc';
import s from './Router.module.scss';

const createStreams = (
  _str: MediaStream[]
): { stream: MediaStream; ref: React.Ref<HTMLVideoElement> }[] =>
  _str.map((item) => ({
    stream: item,
    ref: (node: HTMLVideoElement) => {
      // eslint-disable-next-line no-param-reassign
      if (node) node.srcObject = item;
    },
  }));

function Router() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname, search } = location;
  const [id, setId] = useState<number>(getLoginCookie());
  const [auth, setAuth] = useState<boolean>(false);
  const [loggedAs, setLoggedAs] = useState<string>('');
  const [restart, setRestart] = useState<boolean>(false);
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const [roomIsSaved, setRoomIsSaved] = useState<boolean>(false);
  const ws = useMemo(() => new WS(), [restart]);
  const db = useMemo(() => new DB(), [restart]);
  useEffect(() => {
    const roomId = parseInt(pathname.replace('/', ''), 10);
    let rtc: RTC | null = null;
    const roomOpen = Number.isInteger(roomId);
    if (roomOpen) {
      ws.userId = id;
      rtc = new RTC({ roomId, ws });
      rtc.onAddTrack = (e) => {
        // TODO create media stream
        log('info', 'onAddTrack', e);
        const _streams = streams.map((item) => item);
        _streams.push(e.streams[0]);
        setStreams(_streams);
      };
    }
    const qS = parseQueryString(search);
    const token = qS?.token || getTokenCookie()?.token || '';
    ws.onOpen = (ev) => {
      log('info', 'onOpen', ev);
      if (roomOpen && id) {
        rtc?.invite({ targetUserId: roomId });
      }
      db.setToken();
      ws.sendMessage({
        type: MessageType.GET_USER_ID,
        id,
        token: db.token,
        data: {},
      });
    };

    ws.onMessage = (ev) => {
      log('info', 'onMessage', ev.data);
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type, id: _id } = rawMessage;
      let res;
      const args = {
        where: {
          id,
        },
        include: {
          User: {
            select: {
              email: true,
            },
          },
        },
      };
      if (type === MessageType.SET_USER_ID) {
        ws.userId = _id;
        res = db.guestFindFirst(args);
      }
      switch (type) {
        case MessageType.SET_USER_ID:
          const { id: __id, token: _token } = ws.getMessage(MessageType.SET_USER_ID, rawMessage);
          if (_token && _token !== 'null') {
            setTokenCookie(_token);
            setAuth(true);
            db.token = _token;
            let isAuth = false;
            if (qS?.token) {
              isAuth = true;
              navigate(pathname);
            }
            ws.sendMessage({
              id: ws.userId,
              token,
              isAuth,
              type: MessageType.GET_GUEST_FIND_FIRST,
              data: {
                args,
              },
            });
          } else {
            setAuth(false);
            setLoggedAs('');
          }
          if (roomOpen) {
            ws.sendMessage({
              type: MessageType.GET_ROOM,
              id: roomId,
              token: db.token,
              data: undefined,
            });
          }
          setId(__id);
          break;
        case MessageType.SET_GUEST_FIND_FIRST:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const r: Awaited<typeof res> = (rawMessage.data as any).argv;
          setLoggedAs(r?.User[0].email || '');
          break;
        case MessageType.SET_AUTH:
          console.log(ws.getMessage(MessageType.SET_AUTH, rawMessage).data.message);
          break;
        case MessageType.OFFER:
          if (rtc) {
            rtc.handleOfferMessage(rawMessage, (e) => {
              console.log(11, e);
            });
          }
          break;
        case MessageType.CANDIDATE:
          if (rtc) {
            rtc.handleCandidateMessage(rawMessage);
          }
          break;
        case MessageType.ANSWER:
          if (rtc) {
            rtc.handleVideoAnswerMsg(rawMessage, (e) => {
              if (e) {
                log('warn', 'onHandleVideoAnswerMsg', e);
              }
            });
          }
          break;
        case MessageType.SET_ROOM:
          setRoomIsSaved(true);
          break;
        case MessageType.SET_ERROR:
          const {
            data: { message },
          } = ws.getMessage(MessageType.SET_ERROR, rawMessage);
          log('warn', 'error', message);
          break;
        default:
      }
    };
    return () => {
      ws.onOpen = () => {
        /** */
      };
      ws.onMessage = () => {
        /** */
      };
    };
  }, [restart, pathname, roomIsSaved]);

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
  return (
    <div>
      {loggedAs && <div>Logged as {loggedAs}</div>}
      {!auth ? (
        <button
          type="button"
          onClick={() => {
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
          }}
        >
          Login
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setTokenCookie('null');
            setAuth(false);
            setLoggedAs('');
            setRestart(!restart);
          }}
        >
          Logout
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          navigate(`/${new Date().getTime()}`);
        }}
      >
        Create room
      </button>
      <a href={window.location.href.replace(/\?.*/, '')}>
        {window.location.href.replace(/\?.*/, '')}
      </a>
      <div className={s.container}>
        {_streams.map((item, index) => (
          <div key={item.stream.id} className={s.video}>
            <video
              width={300}
              height={200}
              ref={item.ref}
              id={item.stream.id}
              title={item.stream.id}
              autoPlay
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Router;
