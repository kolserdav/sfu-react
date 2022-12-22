/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Room.hooks.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
/* eslint-disable no-case-declarations */
import { useEffect, useState, useMemo, useCallback } from 'react';
import WS from '../core/ws';
import RTC from '../core/rtc';
import {
  getCodec,
  getDialogPosition,
  log,
  isClickByDialog,
  parseQueryString,
  getRoomId,
  isDev,
} from '../utils/lib';
import { getWidthOfItem, changeBanList, changeMuteList, setMuteForAllHandler } from './Room.lib';
import {
  LocaleServer,
  LocaleDefault,
  MessageType,
  SendMessageArgs,
  ErrorCode,
  Command,
} from '../types/interfaces';
import { Stream, DialogProps, Volumes, DialogPropsUsersContext } from '../types';
import s from './Room.module.scss';
import c from './ui/CloseButton.module.scss';
import storeStreams, { changeStreams } from '../store/streams';
import {
  START_DELAY,
  SPEAKER_LEVEL,
  DIALOG_DEFAULT,
  DIALOG_VOLUME_DIMENSION,
  VOLUME_MIN,
  DIALOG_SETTINGS_DIMENSION,
  VIDEO_ACTIONS_STYLE,
  VIDEO_STARTED_HOOK_TIMEOUT,
  ROOM_LENGTH_TEST,
  MAX_VIDEO_STREAMS,
  PLAY_VIDEO_TIMEOUT,
  MOBILE_REGEXP,
  BLUR_DISCONNECT_TIMEOUT,
} from '../utils/constants';
import { CookieName, getCookie } from '../utils/cookies';
import storeError, { changeError } from '../store/error';
import storeClickDocument from '../store/clickDocument';
import { getLocalStorage, LocalStorageName, setLocalStorage } from '../utils/localStorage';
import storeMessage from '../store/message';
import storeCanConnect from '../store/canConnect';
import storeRoomIsInactive, { changeRoomIsInactive } from '../store/roomIsInactive';
import storeMuted from '../store/muted';
import storeAdminMuted from '../store/adminMuted';
import storeAsked from '../store/asked';
import storeUserList, { changeUserList } from '../store/userList';
import storeSpeaker, { changeSpeaker } from '../store/speaker';
import storeMuteForAll from '../store/muteForAll';
import storeBanned from '../store/banned';
import storeVolume from '../store/volume';
import storeAdmin from '../store/admin';

// eslint-disable-next-line import/prefer-default-export
export const useConnection = ({
  id,
  roomId,
  iceServers,
  server,
  port,
  userName,
  cleanAudioAnalyzer,
  locale,
}: {
  id: number | string;
  roomId: number | string | null;
  iceServers: RTCConfiguration['iceServers'];
  server: string;
  port: number;
  userName: string;
  cleanAudioAnalyzer: (uid: string | number) => void;
  locale: LocaleServer['client'];
}) => {
  const ws = useMemo(() => new WS({ server, port, protocol: 'room' }), [server, port]);
  const rtc = useMemo(() => new RTC({ ws }), [ws]);
  const [selfStream, setSelfStream] = useState<null | MediaStream>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [shareScreen, setShareScreen] = useState<boolean>(false);
  const [roomIsSaved, setRoomIsSaved] = useState<boolean>(false);
  const [lenght, setLenght] = useState<number>(streams.length);
  const [muted, setMuted] = useState<boolean>(true);
  const [adminMuted, setAdminMuted] = useState<boolean>(false);
  const [muteds, setMuteds] = useState<(string | number)[]>([]);
  const [offVideo, setOffVideo] = useState<(string | number)[]>([]);
  const [askeds, setAskeds] = useState<(string | number)[]>([]);
  const [adminMuteds, setAdminMuteds] = useState<(string | number)[]>([]);
  const [video, setVideo] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [error, setError] = useState<keyof typeof ErrorCode>();
  const [connectionId, setConnectionId] = useState<string>('');
  const [canConnect, setCanConnect] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>();
  const [onVideoTimer, setOnVideoTimer] = useState<number>(0);
  const [blurTimeout, setBlurTimeout] = useState<NodeJS.Timeout>(
    setTimeout(() => {
      /** */
    }, 0)
  );

  const addStream = useMemo(
    () =>
      ({
        target,
        stream,
        connId,
        name,
        isOwner: _isOwner,
        change = false,
      }: {
        target: string | number;
        name: string;
        stream: MediaStream;
        connId: string;
        isOwner: boolean;
        change?: boolean;
      }) => {
        const _stream: Stream = {
          target,
          stream,
          name,
          connId,
          isOwner: _isOwner,
          ref: (node) => {
            if (node) {
              // eslint-disable-next-line no-param-reassign
              node.srcObject = stream;
            }
          },
        };
        storeStreams.dispatch(changeStreams({ type: 'add', stream: _stream, change }));
        log('info', 'Add stream', { ..._stream });
      },
    []
  );
  const lostStreamHandler: typeof rtc.lostStreamHandler = useMemo(
    () =>
      ({ connId, target, eventName, roomId: _roomId }) => {
        log('warn', 'Lost stream handler', { roomId, target, eventName });
        let _connId = connId;
        Object.keys(rtc.peerConnections).forEach((item) => {
          const peer = item.split(rtc.delimiter);
          if (peer[1] === target.toString()) {
            // eslint-disable-next-line prefer-destructuring
            _connId = peer[2];
          }
        });
        rtc.closeVideoCall({
          roomId: _roomId,
          userId: ws.userId,
          target,
          connId: _connId,
          eventName: 'lost-stream-handler',
        });
        ws.sendMessage({
          type: MessageType.GET_CLOSE_PEER_CONNECTION,
          connId: _connId,
          id: ws.userId,
          data: {
            roomId: _roomId,
            target,
          },
        });
      },
    [roomId, rtc, ws]
  );

  const reloadHandler = useMemo(
    () => () => {
      Object.keys(rtc.peerConnections).forEach((item) => {
        const peer = item.split(rtc.delimiter);
        if (peer[1] !== id) {
          lostStreamHandler({
            roomId: peer[0],
            target: peer[1],
            connId: peer[2],
            eventName: 'reload-page',
          });
        }
      });
    },
    [id, lostStreamHandler, rtc.delimiter, rtc.peerConnections]
  );

  const screenShare = useMemo(
    () => async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!roomId || !selfStream) {
        return;
      }
      ws.shareScreen = !shareScreen;
      if (!ws.shareScreen) {
        selfStream.getVideoTracks()[0]?.stop();
      }
      rtc.setLocalStream(null);
      const oldStream = rtc.localStream;
      const stream = await rtc.getTracks({ locale });
      if (stream) {
        setSelfStream(stream);
        rtc.sendNeedReconnect(id);
        reloadHandler();
      } else {
        ws.shareScreen = !ws.shareScreen;
        rtc.setLocalStream(oldStream);
      }
      setShareScreen(ws.shareScreen);
    },
    [roomId, rtc, ws, shareScreen, locale, selfStream, reloadHandler, id]
  );

  const changeMuted = useMemo(
    () => () => {
      if (!roomId) {
        return;
      }
      const _muted = !muted;
      setMuted(_muted);
      ws.sendMessage({
        type: MessageType.GET_MUTE,
        id: ws.userId,
        connId: connectionId,
        data: {
          muted: _muted,
          roomId,
        },
      });
    },
    [muted, ws, roomId, connectionId]
  );

  const askFloor = useMemo(
    () => () => {
      if (!roomId) {
        return;
      }
      ws.sendMessage({
        type: MessageType.GET_ASK_FLOOR,
        connId: connectionId,
        id: roomId,
        data: {
          userId: id,
          command: 'add',
        },
      });
    },
    [connectionId, id, roomId, ws]
  );

  const clickToMuteWrapper = useMemo(
    () => (context: DialogProps<DialogPropsUsersContext>['context']) => () => {
      const { unitId: userId } = context;
      if (!userId || !roomId) {
        return;
      }
      ws.sendMessage({
        type: MessageType.GET_TO_MUTE,
        connId: connectionId,
        id: roomId,
        data: {
          target: userId,
        },
      });
      if (askeds.indexOf(userId) !== -1) {
        ws.sendMessage({
          type: MessageType.GET_ASK_FLOOR,
          connId: connectionId,
          id: roomId,
          data: {
            userId,
            command: 'delete',
          },
        });
      }
    },
    [askeds, connectionId, roomId, ws]
  );

  const clickToUnMuteWrapper = useMemo(
    () => (context: DialogProps<DialogPropsUsersContext>['context']) => () => {
      const { unitId: userId } = context;
      if (!userId || !roomId) {
        return;
      }
      ws.sendMessage({
        type: MessageType.GET_TO_UNMUTE,
        connId: connectionId,
        id: roomId,
        data: {
          target: userId,
        },
      });
      if (askeds.indexOf(userId) !== -1) {
        ws.sendMessage({
          type: MessageType.GET_ASK_FLOOR,
          connId: connectionId,
          id: roomId,
          data: {
            userId,
            command: 'delete',
          },
        });
      }
    },
    [askeds, connectionId, roomId, ws]
  );

  const clickToBanWrapper = useMemo(
    () => (context: DialogProps<DialogPropsUsersContext>['context']) => () => {
      const { unitId: userId } = context;
      if (!userId || !roomId) {
        return;
      }
      ws.sendMessage({
        type: MessageType.GET_TO_BAN,
        connId: connectionId,
        id: roomId,
        data: {
          target: userId,
          userId: ws.userId,
        },
      });
    },
    [connectionId, roomId, ws]
  );

  const setAskFloorHandler = useMemo(
    () =>
      ({ data: { asked, userId } }: SendMessageArgs<MessageType.SET_ASK_FLOOR>) => {
        setAskeds(asked);
        const { userList } = storeUserList.getState();
        const _userList = { ...userList };
        _userList.askeds = asked;
        storeUserList.dispatch(changeUserList({ userList: _userList }));
      },
    []
  );

  /**
   * Start connection
   */
  useEffect(() => {
    if (!selfStream || !roomId || !roomIsSaved) {
      return;
    }
    const peerId = rtc.getPeerId(roomId, 0, connectionId);
    if (rtc.peerConnections[peerId] !== undefined) {
      log('warn', 'Start connection is exists', { peerId });
      return;
    }
    rtc.createPeerConnection({
      userId: ws.userId,
      target: 0,
      connId: connectionId,
      roomId,
      onTrack: ({ addedUserId }) => {
        log('info', '-> Added local stream to room', { addedUserId, id });
      },
      iceServers,
      eventName: 'first',
    });
    rtc.addTracks({ stream: selfStream, roomId, connId: connectionId, target: 0 }, (e) => {
      if (!e) {
        addStream({
          target: ws.userId,
          stream: selfStream,
          connId: connectionId,
          name: ws.name,
          change: true,
          isOwner,
        });
      } else {
        log('warn', 'Stream not added', e);
      }
    });
  }, [
    selfStream,
    addStream,
    connectionId,
    iceServers,
    id,
    isOwner,
    roomId,
    rtc,
    ws.name,
    ws.userId,
    roomIsSaved,
    shareScreen,
  ]);

  /**
   * On blur listener
   */
  useEffect(() => {
    const onBlurHandler = () => {
      if (MOBILE_REGEXP.test(navigator.userAgent) || MOBILE_REGEXP.test(navigator.platform)) {
        const _blurTimeout = setTimeout(() => {
          // TODO test it and provide for chat and settings
          ws.connection.close();
        }, BLUR_DISCONNECT_TIMEOUT);
        setBlurTimeout(_blurTimeout);
      }
    };
    window.addEventListener('blur', onBlurHandler);
    return () => {
      window.removeEventListener('blur', onBlurHandler);
    };
  }, [ws.connection]);

  /**
   * On focus listener
   */
  useEffect(() => {
    const onFocusHandler = () => {
      clearTimeout(blurTimeout);
    };
    window.addEventListener('focus', onFocusHandler);
    return () => {
      window.removeEventListener('focus', onFocusHandler);
    };
  }, [blurTimeout]);

  /**
   * Listen end share screen
   */
  useEffect(() => {
    if (!selfStream) {
      return;
    }
    selfStream.getVideoTracks()[0].onended = async (_) => {
      ws.shareScreen = false;
      rtc.setLocalStream(null);
      const stream = await rtc.getTracks({ locale });
      setSelfStream(stream);
      rtc.sendNeedReconnect(id);
      reloadHandler();
      setShareScreen(false);
    };
  }, [selfStream, locale, rtc, ws, reloadHandler, id]);

  /**
   * Set self stream
   */
  useEffect(() => {
    (async () => {
      const stream = await rtc.getTracks({ locale });

      setSelfStream(stream);
    })();
  }, [rtc, locale]);

  /**
   * Save video settings
   */
  useEffect(() => {
    if (!roomId) {
      return;
    }
    if (selfStream) {
      const { width, height } = selfStream.getVideoTracks()[0].getSettings();
      if (width && height) {
        ws.sendMessage({
          type: MessageType.GET_VIDEO_SETTINGS,
          id: roomId,
          connId: connectionId,
          data: { width, height, userId: id },
        });
      }
    }
  }, [selfStream, roomId, connectionId, ws, id]);

  /**
   * Listen change muted
   */
  useEffect(() => {
    const cleanSubs = storeMuted.subscribe(() => {
      const { id: _id } = storeMuted.getState();
      if (_id === id) {
        changeMuted();
      }
    });
    return () => {
      cleanSubs();
    };
  }, [muted, changeMuted, id]);

  /**
   * Listen banned
   */
  useEffect(() => {
    const cleanSubs = storeBanned.subscribe(() => {
      const { id: _id } = storeBanned.getState();
      if (isOwner && _id !== id) {
        clickToBanWrapper({ unitId: _id.toString(), isOwner: false })();
      }
    });
    return () => {
      cleanSubs();
    };
  }, [clickToBanWrapper, isOwner, id]);

  /**
   * Listen mute for all
   */
  useEffect(() => {
    if (!roomId) {
      return () => {
        /** */
      };
    }
    const cleanSubs = storeMuteForAll.subscribe(() => {
      const { type, muteForAll } = storeMuteForAll.getState();
      if (type === MessageType.GET_MUTE_FOR_ALL) {
        ws.sendMessage({
          type: MessageType.GET_MUTE_FOR_ALL,
          id: roomId,
          connId: connectionId,
          data: {
            value: muteForAll,
          },
        });
      }
    });
    return () => {
      cleanSubs();
    };
  }, [ws, connectionId, roomId]);

  /**
   * Listen ask floor
   */
  useEffect(() => {
    const cleanSubs = storeAsked.subscribe(() => {
      const { userId } = storeAsked.getState();
      if (userId === id) {
        askFloor();
      }
    });
    return () => {
      cleanSubs();
    };
  }, [askFloor, id]);

  /**
   * Listen change admin muted
   */
  useEffect(() => {
    const cleanSubs = storeAdminMuted.subscribe(() => {
      const { id: _id, adminMuted: _adminMuted } = storeAdminMuted.getState();
      const context: DialogProps<DialogPropsUsersContext>['context'] = {
        unitId: _id.toString(),
        isOwner: false,
      };
      if (!_adminMuted) {
        if (_id) {
          clickToUnMuteWrapper(context)();
        }
      } else if (_id) {
        clickToMuteWrapper(context)();
      }
    });
    return () => {
      cleanSubs();
    };
  }, [muted, changeMuted, id, clickToMuteWrapper, clickToUnMuteWrapper]);

  /**
   * Change muted
   */
  useEffect(() => {
    if (rtc.localStream && rtc.localStream.getAudioTracks().length) {
      rtc.localStream.getAudioTracks()[0].enabled = !muted;
    }
  }, [muted, rtc.localStream]);

  /**
   * Change adminMuted
   */
  useEffect(() => {
    if (rtc.localStream && rtc.localStream.getAudioTracks().length) {
      rtc.localStream.getAudioTracks()[0].enabled = !adminMuted;
    }
  }, [adminMuted, rtc.localStream]);

  const setVideoHandler = useMemo(
    () =>
      ({ target, command }: { target: string | number; command: Command }) => {
        if (!roomId) {
          return;
        }
        ws.sendMessage({
          id: roomId,
          type: MessageType.GET_VIDEO_TRACK,
          connId: connectionId,
          data: {
            target,
            userId: ws.userId,
            command,
          },
        });
      },
    [roomId, ws, connectionId]
  );

  const clickToVideoOffWrapper = useMemo(
    () =>
      ({ unitId }: DialogProps<DialogPropsUsersContext>['context']) =>
      () => {
        setVideoHandler({ target: unitId, command: 'add' });
      },
    [setVideoHandler]
  );

  const changeVideoWrapper = useMemo(
    () => (target: string | number) => () => {
      const _video = !video;
      setVideo(_video);
      setVideoHandler({ target, command: !_video ? 'add' : 'delete' });
    },
    [video, setVideoHandler]
  );

  const clickToSetAdminWrapper = useMemo(
    () =>
      ({ unitId, isOwner: _isOwner }: DialogProps<DialogPropsUsersContext>['context']) =>
      () => {
        if (!roomId) {
          return;
        }
        ws.sendMessage({
          id: roomId,
          type: MessageType.GET_TO_ADMIN,
          connId: connectionId,
          data: {
            target: unitId,
            userId: ws.userId,
            command: !_isOwner ? 'add' : 'delete',
          },
        });
      },
    [roomId, ws, connectionId]
  );

  /**
   * On play video timer
   */
  useEffect(() => {
    let interval = setInterval(() => {
      /** */
    }, 0);
    if (onVideoTimer !== 0) {
      interval = setInterval(() => {
        setOnVideoTimer(onVideoTimer - 1);
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [onVideoTimer]);

  /**
   * Change video enabled
   */
  useEffect(() => {
    if (rtc.localStream && rtc.localStream.getVideoTracks().length) {
      rtc.localStream.getVideoTracks()[0].enabled = video;
    }
  }, [video, rtc.localStream]);

  /**
   * On change pathname
   */
  useEffect(
    () => () => {
      const _roomId = getRoomId(window.location.pathname);
      if (_roomId !== roomId) {
        ws.connection.close();
        rtc.closeAllConnections(true);
        setStreams([]);
        setLenght(0);
      }
    },
    [roomId, rtc, ws.connection]
  );

  /**
   * Listen reload page
   */
  useEffect(() => {
    window.addEventListener('beforeunload', reloadHandler);
    return () => {
      window.removeEventListener('beforeunload', reloadHandler);
    };
  }, [id, rtc, reloadHandler]);

  /**
   * Listen set admin
   */
  useEffect(() => {
    const cleanSubs = storeAdmin.subscribe(() => {
      const { id: _id, admin } = storeAdmin.getState();
      clickToSetAdminWrapper({ unitId: _id.toString(), isOwner: !admin })();
    });
    return () => {
      cleanSubs();
    };
  }, [clickToSetAdminWrapper]);

  /**
   * Connections handlers
   */
  useEffect(() => {
    ws.onOpen = () => {
      setTimeout(() => {
        ws.sendMessage({
          type: MessageType.GET_USER_ID,
          id,
          data: {
            userName,
            locale: getCookie(CookieName.lang) || LocaleDefault,
          },
          connId: '',
        });
      }, START_DELAY);
    };
    if (!roomId || typeof isPublic === 'undefined') {
      return () => {
        /** */
      };
    }
    if (!ws.userId) {
      ws.setUserId(id);
    }

    const removeStreamHandler = ({
      data: { roomId: _roomId, target: _target },
      connId: _connId,
    }: SendMessageArgs<MessageType.SET_CLOSE_PEER_CONNECTION>) => {
      const peerId = rtc.getPeerId(_roomId, _target, _connId);
      cleanAudioAnalyzer(_target);
      const _stream = streams.find((item) => item.target === _target);
      if (_stream) {
        storeStreams.dispatch(changeStreams({ type: 'delete', stream: _stream }));
      } else {
        log('warn', 'Close call without stream', { peerId });
      }
    };

    /**
     * 'add' send server/main.js and 'added' listen on Room.hooks.ts
     */
    const changeRoomUnitHandler = async ({
      id: userId,
      data: {
        target,
        eventName,
        roomLength,
        muteds: _muteds,
        name,
        adminMuteds: _adminMuteds,
        isOwner: _isOwner,
        asked,
        banneds,
      },
      connId,
    }: SendMessageArgs<MessageType.SET_CHANGE_UNIT>) => {
      if (lenght !== roomLength) {
        setLenght(ROOM_LENGTH_TEST || roomLength);
      }
      setAskeds(asked);
      rtc.muteds = _muteds.concat(_adminMuteds);
      setMuteds(rtc.muteds);
      setAdminMuteds(_adminMuteds);
      setAdminMuted(_adminMuteds.indexOf(userId) !== -1);
      storeUserList.dispatch(
        changeUserList({
          userList: {
            adminMuteds: _adminMuteds,
            muteds: _muteds,
            askeds: asked,
            banneds,
          },
        })
      );
      switch (eventName) {
        case 'add':
        case 'added':
          if (userId !== target) {
            if (!selfStream) {
              return;
            }
            log('info', 'Change room unit handler', {
              userId,
              target,
              roomLength,
              connId,
              eventName,
            });
            rtc.createPeerConnection({
              roomId,
              target,
              userId: id,
              connId,
              onTrack: ({ addedUserId, stream: _stream }) => {
                log('info', 'Added unit track', { addedUserId, s: _stream, connId });
                addStream({
                  target: addedUserId,
                  stream: _stream,
                  connId,
                  name,
                  change: true,
                  isOwner: _isOwner,
                });
              },
              iceServers,
              eventName: 'back',
            });
            rtc.addTracks({ roomId, stream: selfStream, target, connId }, (e) => {
              if (!e) {
                if (eventName !== 'added' && target !== userId) {
                  ws.sendMessage({
                    type: MessageType.SET_CHANGE_UNIT,
                    id: target,
                    connId,
                    data: {
                      target: userId,
                      name: ws.name,
                      roomLength,
                      eventName: 'added',
                      muteds: _muteds,
                      adminMuteds: _adminMuteds,
                      isOwner,
                      asked: askeds,
                      banneds,
                    },
                  });
                }
              } else {
                log('warn', 'Messagedge SET_CHANGE_UNIT not send', { userId, target, connId });
              }
            });
          }
          break;
        case 'delete':
          log('info', 'Need delete user', {
            roomId,
            target,
            userId,
            connId,
            k: Object.keys(rtc.peerConnections),
          });
          rtc.closeVideoCall({ roomId, target, userId, connId, eventName: 'delete-room-unit' });
          const _stream = streams.find((item) => item.target === target);
          if (_stream) {
            storeStreams.dispatch(changeStreams({ type: 'delete', stream: _stream }));
          }
          break;
      }
    };

    const changeMuteHandler = (args: SendMessageArgs<MessageType.SET_MUTE>) => {
      const {
        id: userId,
        data: { muteds: _muteds, adminMuteds: _adminMuteds },
      } = args;
      rtc.muteds = _muteds.concat(_adminMuteds);
      setAdminMuteds(_adminMuteds);
      setMuteds(rtc.muteds);
      setAdminMuted(_adminMuteds.indexOf(userId) !== -1);
    };

    const handleError = ({
      data: { message, type: _type, code },
    }: SendMessageArgs<MessageType.SET_ERROR>) => {
      log(_type, message, { _type, code }, true);
      setError(code);
      storeError.dispatch(
        changeError({
          error: code,
        })
      );
      switch (code) {
        case ErrorCode.youAreBanned:
          setCanConnect(false);
          break;
        case ErrorCode.roomIsInactive:
          if (message !== '') {
            storeRoomIsInactive.dispatch(
              changeRoomIsInactive({
                roomIsInactive: true,
              })
            );
          }
          break;
        default:
      }
    };

    const needReconnectHandler = ({
      data: { userId },
      connId,
    }: SendMessageArgs<MessageType.GET_NEED_RECONNECT>) => {
      lostStreamHandler({
        connId,
        target: userId,
        eventName: 'need-reconnect',
        roomId,
      });
    };

    const setRoomHandler = async ({
      connId,
      data: { isOwner: _isOwner, asked },
    }: SendMessageArgs<MessageType.SET_ROOM>) => {
      if (!canConnect) {
        return;
      }
      setAskeds(asked);
      setRoomIsSaved(true);
      setIsOwner(_isOwner);
      setConnectionId(connId);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changeRoomGuestsHandler = async ({
      rawMessage,
    }: {
      rawMessage: SendMessageArgs<MessageType.SET_ROOM_GUESTS>;
    }) => {
      if (!roomId) {
        return;
      }
      const {
        data: { roomUsers, muteds: _muteds, adminMuteds: _adminMuteds, asked, banneds },
        connId,
      } = ws.getMessage(MessageType.SET_ROOM_GUESTS, rawMessage);
      rtc.muteds = (_muteds || []).concat(_adminMuteds || []);
      const _streams: Stream[] = storeStreams.getState().streams as Stream[];
      log('info', 'Run change room gusets handler', {
        roomUsers,
        id,
        st: _streams.map((i) => i.target),
      });
      rtc.roomLength = roomUsers?.length || 0;
      setLenght(ROOM_LENGTH_TEST || roomUsers.length);
      setAdminMuteds(_adminMuteds);
      setMuteds(rtc.muteds);
      setAskeds(asked);
      setAdminMuted(_adminMuteds.indexOf(id) !== -1);
      storeUserList.dispatch(
        changeUserList({
          userList: {
            adminMuteds: _adminMuteds,
            muteds: _muteds,
            askeds: asked,
            banneds,
          },
        })
      );
      roomUsers.forEach(async (item) => {
        if (item.id !== id) {
          const _isExists = _streams.filter((_item) => item.id === _item.target);
          if (!_isExists[0]) {
            if (!selfStream) {
              return;
            }
            const skip = rtc.createPeerConnection({
              roomId,
              target: item.id,
              userId: id,
              connId,
              onTrack: ({ addedUserId, stream: _stream }) => {
                log('info', 'Added tracks of new user', { addedUserId, _stream });
                addStream({
                  target: addedUserId,
                  stream: _stream,
                  connId,
                  name: item.name,
                  change: true,
                  isOwner: item.isOwner,
                });
              },
              iceServers,
              eventName: 'check',
            });
            if (skip) {
              return;
            }
            rtc.addTracks({ roomId, stream: selfStream, target: item.id, connId }, (e) => {
              if (e) {
                log('warn', 'Failed add tracks', { roomId, userId: id, target: item, connId });
                return;
              }
              log('info', 'Change room guests connection', {
                roomId,
                target: item,
                userId: id,
                connId,
              });
            });
          }
        }
      });
      // Remove disconnected
      streams.forEach((item) => {
        const isExists = roomUsers.filter((_item) => _item.id === item.target);
        if (!isExists[0]) {
          Object.keys(rtc.peerConnections).forEach((__item) => {
            const peer = __item.split(rtc.delimiter);
            if (peer[1] === item.target) {
              streams.forEach((i) => {
                if (i.target === item.target) {
                  storeStreams.dispatch(changeStreams({ type: 'delete', stream: i }));
                }
              });
              rtc.closeVideoCall({
                roomId,
                userId: id,
                target: item.target,
                connId: peer[2],
                eventName: 'change-room-guests',
              });
            }
          });
        }
        return isExists[0] !== undefined;
      });
    };

    const setVideoTrackHandler = ({
      data: { offVideo: _offVideo, command, target, userId },
    }: SendMessageArgs<MessageType.SET_VIDEO_TRACK>) => {
      setOffVideo(_offVideo);
      if (target !== userId && target === ws.userId && command === 'add') {
        setOnVideoTimer(PLAY_VIDEO_TIMEOUT / 1000);
        setVideo(false);
      }
    };

    const setToAdminHandler = ({
      data: { target, command },
    }: SendMessageArgs<MessageType.SET_TO_ADMIN>) => {
      const { streams: _streams } = storeStreams.getState();
      let stream: Stream | undefined;
      _streams.every((item, i) => {
        if (item.target === target) {
          stream = { ...item };
          return false;
        }
        return true;
      });
      if (typeof stream !== 'undefined') {
        stream.isOwner = command === 'add';
        if (stream.isOwner !== isOwner && target === id) {
          setIsOwner(stream.isOwner);
        }
        storeStreams.dispatch(
          changeStreams({
            stream,
            type: 'delete',
            change: true,
          })
        );
        storeStreams.dispatch(
          changeStreams({
            stream,
            type: 'add',
            change: true,
          })
        );
      } else {
        log('warn', 'Stream for change isOwner is missing', { target, command });
      }
    };

    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type, connId } = rawMessage;
      switch (type) {
        case MessageType.SET_USER_ID:
          /**
           * Connect to room
           */
          setConnectionId(connId);
          rtc.connId = connId;
          ws.name = ws.getMessage(MessageType.SET_USER_ID, rawMessage).data.name;
          ws.sendMessage({
            type: MessageType.GET_ROOM,
            id: roomId,
            data: {
              userId: id,
              mimeType: getCodec(),
              isPublic,
            },
            connId,
          });
          break;
        case MessageType.CANDIDATE:
          rtc.handleCandidateMessage(rawMessage);
          break;
        case MessageType.SET_ROOM_GUESTS:
          changeRoomGuestsHandler({ rawMessage });
          break;
        case MessageType.SET_CLOSE_PEER_CONNECTION:
          removeStreamHandler(rawMessage);
          break;
        case MessageType.SET_MUTE:
          changeMuteHandler(rawMessage);
          break;
        case MessageType.ANSWER:
          rtc.handleVideoAnswerMsg(rawMessage);
          break;
        case MessageType.SET_ROOM:
          setRoomHandler(rawMessage);
          break;
        case MessageType.GET_NEED_RECONNECT:
          needReconnectHandler(rawMessage);
          break;
        case MessageType.SET_CHANGE_UNIT:
          changeRoomUnitHandler(rawMessage);
          break;
        case MessageType.SET_ASK_FLOOR:
          setAskFloorHandler(rawMessage);
          break;
        case MessageType.SET_MUTE_LIST:
          changeMuteList(rawMessage);
          break;
        case MessageType.SET_VIDEO_TRACK:
          setVideoTrackHandler(rawMessage);
          break;
        case MessageType.SET_MUTE_FOR_ALL:
          setMuteForAllHandler(rawMessage);
          break;
        case MessageType.SET_BAN_LIST:
          changeBanList(rawMessage);
          break;
        case MessageType.SET_TO_ADMIN:
          setToAdminHandler(rawMessage);
          break;
        case MessageType.SET_ERROR:
          handleError(rawMessage);
          break;
        default:
      }
    };
    ws.onError = (e) => {
      log('error', 'Ws error', e);
    };
    ws.onClose = (e) => {
      log('warn', 'Ws close', e);
    };
    return () => {
      ws.onOpen = () => {
        /** */
      };
      ws.onMessage = () => {
        /** */
      };
      ws.onError = () => {
        /** */
      };
      ws.onClose = () => {
        /** */
      };
    };
  }, [
    askeds,
    cleanAudioAnalyzer,
    roomId,
    streams,
    selfStream,
    ws,
    rtc,
    id,
    setAskFloorHandler,
    roomIsSaved,
    lenght,
    iceServers,
    rtc.lostStreamHandler,
    locale,
    userName,
    addStream,
    isOwner,
    canConnect,
    isPublic,
    lostStreamHandler,
  ]);

  /**
   * Set lost stream handler
   */
  useEffect(() => {
    rtc.lostStreamHandler = (opts) => {
      lostStreamHandler(opts);
    };
  }, [lostStreamHandler, rtc]);

  /**
   * Listen can connect
   */
  useEffect(() => {
    const cleanSubs = storeCanConnect.subscribe(() => {
      const { canConnect: _canConnect } = storeCanConnect.getState();
      setCanConnect(_canConnect);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  /**
   * Check is public
   */
  useEffect(() => {
    const qS = parseQueryString();
    let _isPublic;
    if (typeof window !== 'undefined' && qS) {
      _isPublic = qS.public === '1';
    } else if (typeof window !== 'undefined' && !qS) {
      _isPublic = false;
    }
    log('log', 'Is public is', _isPublic);
    if (typeof _isPublic === 'boolean') {
      setIsPublic(_isPublic);
    }
  }, []);

  /**
   * Send message from storeMessage
   */
  useEffect(() => {
    const storeMessageHandler = (second = false) => {
      const {
        message: { type, value },
      } = storeMessage.getState();
      if (type === 'room') {
        if (ws.connection.readyState === ws.connection.OPEN) {
          ws.sendMessage(value);
        } else if (second === false) {
          setTimeout(() => {
            storeMessageHandler(true);
          }, 1000);
        } else {
          log('warn', 'Ws not found on sendMessage', { type, value });
        }
      }
    };
    const cleanSubs = storeMessage.subscribe(storeMessageHandler);
    return () => {
      cleanSubs();
    };
  }, [ws]);

  /**
   * Set streams from store
   */
  useEffect(() => {
    const cleanSubs = storeStreams.subscribe(() => {
      const state = storeStreams.getState();
      setStreams(state.streams);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  /**
   * Check room list
   */
  useEffect(() => {
    if (!roomId || ErrorCode.initial !== error) {
      return () => {
        //
      };
    }
    let interval = setTimeout(() => {
      //
    });
    let _streams: Stream[] = storeStreams.getState().streams as Stream[];
    interval = setInterval(() => {
      _streams = storeStreams.getState().streams as Stream[];
      if (_streams.length !== lenght && ws.connection.readyState) {
        ws.sendMessage({
          type: MessageType.GET_ROOM_GUESTS,
          id,
          connId: connectionId,
          data: {
            roomId,
          },
        });
      }
    }, 1000);

    return () => {
      clearTimeout(interval);
    };
  }, [roomId, ws, lenght, streams, connectionId, id, error]);

  const _streams = useMemo(
    () =>
      ROOM_LENGTH_TEST && isDev()
        ? new Array(ROOM_LENGTH_TEST)
            .fill(0)
            .map(() => streams[0])
            .filter((item) => item !== undefined)
        : streams.map((item) => {
            const _item = { ...item };
            _item.hidden = offVideo.indexOf(item.target) !== -1;
            return _item;
          }),
    [streams, offVideo]
  );

  return {
    askFloor,
    askeds,
    streams: _streams,
    lenght,
    rtc,
    lostStreamHandler: rtc.lostStreamHandler,
    screenShare,
    shareScreen,
    muted,
    changeMuted,
    muteds,
    video,
    offVideo,
    changeVideoWrapper,
    isOwner,
    adminMuted,
    adminMuteds,
    clickToMuteWrapper,
    clickToUnMuteWrapper,
    clickToBanWrapper,
    clickToVideoOffWrapper,
    clickToSetAdminWrapper,
    onVideoTimer,
  };
};

let oldLenght = 0;

export const useVideoDimensions = ({
  lenght,
  container,
}: {
  lenght: number;
  container: HTMLDivElement | null;
}) => {
  let time = 0;
  return useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement, Event>, stream: MediaStream) => {
      time++;
      if (time % 5 === 0) {
        requestAnimationFrame(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { target }: { target: HTMLVideoElement } = e as any;
          const isFull = target.getAttribute('data') === 'full';
          const _container = !isFull ? container : (target.parentElement as HTMLDivElement);
          if (_container) {
            const { clientHeight, clientWidth } = _container;
            const { videoHeight, videoWidth } = target;
            const coeff = videoWidth / videoHeight;
            const { width, cols, rows } = getWidthOfItem({
              lenght,
              container: _container,
              coeff: videoWidth / videoHeight,
            });
            // Change track constraints
            stream.getVideoTracks().forEach((item) => {
              if ((videoWidth !== width || oldLenght !== lenght) && lenght !== 0) {
                oldLenght = lenght;
                let _width = width;
                let _height = width;
                if (coeff >= 1) {
                  _height = Math.floor(width / coeff);
                  if (isFull) {
                    _height =
                      clientWidth > clientHeight * coeff
                        ? clientHeight
                        : Math.floor(clientWidth / coeff);
                    _width = Math.floor(_height * coeff);
                  }
                } else {
                  _width = Math.floor(width * coeff);
                  if (isFull) {
                    _width =
                      clientHeight > clientWidth / coeff
                        ? clientWidth
                        : Math.floor(clientHeight * coeff);
                    _height = Math.floor(_width / coeff);
                  }
                }
                target.setAttribute('width', _width.toString());
                target.setAttribute('height', _height.toString());
                target.parentElement?.setAttribute('style', `width: 100%;height: 100%`);
                const { nextElementSibling: actions } = target;
                const isActions = actions?.getAttribute('class')?.indexOf(s.video__actions) !== -1;
                if (isFull) {
                  if (isActions) {
                    // 10px - padding of IconButton, 1rem - right of CloseButton
                    actions?.setAttribute('style', `top: 40px; ${VIDEO_ACTIONS_STYLE}`);
                  }
                } else {
                  if (isActions) {
                    actions?.setAttribute('style', `top: 0;${VIDEO_ACTIONS_STYLE}`);
                  }
                  target.parentElement?.setAttribute(
                    'style',
                    `width: ${_width}px;height: ${_height}px;`
                  );
                }
                target.parentElement?.parentElement?.setAttribute(
                  'style',
                  `grid-template-columns: repeat(${cols}, auto);
                  grid-template-rows: repeat(${rows}, auto);
                  transition: width 0.3s ease-in;`
                );
              }
            });
          }
        });
      }
    },
    [lenght, container, time]
  );
};

export const useOnclickClose =
  ({ lenght, container }: { lenght: number; container: HTMLDivElement | null }) =>
  (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (container) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { target }: any = e;
      const { nodeName } = target;
      const button: HTMLButtonElement =
        nodeName === 'path'
          ? target.parentElement?.parentElement
          : nodeName === 'svg'
          ? target.parentElement
          : target;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const video: HTMLVideoElement = button.nextElementSibling as any;
      const { videoWidth, videoHeight } = video;
      const { width } = getWidthOfItem({ lenght, container, coeff: videoWidth / videoHeight });
      const coeff = videoWidth / videoHeight;
      const height = width / coeff;
      video.parentElement?.classList.remove(s.video__fixed);
      button.classList.remove(c.open);
      video.setAttribute('data', '');
      video.setAttribute('width', width.toString());
      video.setAttribute('height', height.toString());
    }
  };

export const usePressEscape = () => (e: React.KeyboardEvent<HTMLDivElement>) => {
  /** TODO */
};

const analyzer: Record<string, AnalyserNode[]> = {};
const freqs: Record<string, Uint8Array[]> = {};
const audioLevels: Record<string, number> = {};

export const useAudioAnalyzer = () => {
  const [speaker, setSpeaker] = useState<string | number>(0);
  const createAudioAnalyzer = useMemo(
    () => (item: Stream) => {
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaStreamSource(item.stream);
      const audioGain = audioContext.createGain();
      const audioChannelSplitter = audioContext.createChannelSplitter(audioSource.channelCount);
      audioSource.connect(audioGain);
      audioGain.connect(audioChannelSplitter);
      analyzer[item.target] = [];
      freqs[item.target] = [];
      for (let i = 0; i < audioSource.channelCount; i++) {
        analyzer[item.target][i] = audioContext.createAnalyser();
        analyzer[item.target][i].minDecibels = -100;
        analyzer[item.target][i].maxDecibels = 0;
        analyzer[item.target][i].smoothingTimeConstant = 0.8;
        analyzer[item.target][i].fftSize = 32;
        freqs[item.target][i] = new Uint8Array(analyzer[item.target][i].frequencyBinCount);
        audioChannelSplitter.connect(analyzer[item.target][i], i, 0);
      }
    },
    []
  );

  const analyzeSoundLevel = useMemo(
    () => (uid: string | number) => {
      if (analyzer[uid]) {
        for (let i = 0; i < analyzer[uid].length; i++) {
          analyzer[uid][i].getByteFrequencyData(freqs[uid][i]);
          let level = 0;
          freqs[uid][i].forEach((item) => {
            level = Math.max(level, item);
          });
          audioLevels[uid] = level / 256;
        }
      }
    },
    []
  );

  const cleanAudioAnalyzer = useMemo(
    () => (uid: string | number) => {
      if (analyzer[uid]) {
        delete analyzer[uid];
      } else {
        log('info', 'Audio analyzer not found', uid);
      }
      if (freqs[uid]) {
        delete freqs[uid];
      } else {
        log('info', 'Audio analyzer freqs not found', uid);
      }
      if (audioLevels[uid]) {
        delete audioLevels[uid];
      } else {
        log('info', 'Audio analyzer levels not found', uid);
      }
    },
    []
  );

  /**
   * Compare audio levels
   */
  useEffect(() => {
    const timeout = setInterval(() => {
      const audioLevelsArr: { uid: string | number; level: number }[] = [];
      const keys = Object.keys(audioLevels);
      for (let i = 0; keys[i]; i++) {
        audioLevelsArr.push({
          uid: keys[i],
          level: audioLevels[keys[i]],
        });
      }
      const target = audioLevelsArr.sort((a, b) => {
        if (a.level < b.level) {
          return 1;
        }
        return -1;
      });
      if (target[0]) {
        let _speaker: number | string = 0;
        if (target[0].level >= SPEAKER_LEVEL) {
          _speaker = target[0].uid;
        }
        setSpeaker(_speaker);
        storeSpeaker.dispatch(changeSpeaker({ speaker: _speaker }));
      }
    }, 1000);
    return () => {
      clearInterval(timeout);
    };
  }, []);

  return { analyzeSoundLevel, createAudioAnalyzer, cleanAudioAnalyzer, speaker };
};

export const useVolumeDialog = ({
  roomId,
  container,
  userId,
}: {
  roomId: string | number;
  container: React.MutableRefObject<HTMLDivElement | null>;
  userId: string | number;
}) => {
  const [dialog, setDialog] =
    useState<Omit<DialogProps<DialogPropsUsersContext>, 'children'>>(DIALOG_DEFAULT);
  const savedVolumes = useMemo(() => {
    const ls = getLocalStorage(LocalStorageName.VOLUMES);
    if (!ls) {
      return null;
    }
    return ls[roomId] || null;
  }, [roomId]);
  const [volumes, setVolumes] = useState<Volumes>(savedVolumes || {});

  /**
   * Change volume
   */
  useMemo(() => {
    const { current } = container;
    if (current) {
      const videos = current.querySelectorAll('video');
      for (let i = 0; videos[i]; i++) {
        const video = videos[i];
        if (volumes[video.id] && video.id !== userId) {
          video.volume = volumes[video.id] / 100;
        }
      }
    }
  }, [volumes, container, userId]);

  const changeVolumeWrapper = useMemo(
    () =>
      (targetId: number | string) =>
      (ev: { target: { value: React.ChangeEvent<HTMLInputElement>['target']['value'] } }) => {
        const { value } = ev.target;
        const _volumes = { ...volumes };
        const volumeNum = parseInt(value, 10);
        _volumes[targetId] = volumeNum >= VOLUME_MIN ? volumeNum : VOLUME_MIN;
        _volumes['0'] = _volumes[targetId];
        setVolumes(_volumes);
        setLocalStorage(LocalStorageName.VOLUMES, {
          [roomId]: _volumes,
        });
      },
    [roomId, volumes]
  );

  /**
   * Listen volume
   */
  useEffect(() => {
    const cleanSubs = storeVolume.subscribe(() => {
      const { id, volume } = storeVolume.getState();
      changeVolumeWrapper(id)({ target: { value: volume.toString() } });
    });
    return () => {
      cleanSubs();
    };
  }, [changeVolumeWrapper]);

  const clickToVolume = useMemo(
    () => (targetId: string | number) => (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const { clientX: _clientX, clientY: _clientY } = ev;
      const { width, height } = DIALOG_VOLUME_DIMENSION;
      const { clientX, clientY } = getDialogPosition({ _clientX, _clientY, width, height });
      setTimeout(() => {
        setDialog({
          open: true,
          clientX,
          clientY,
          context: { unitId: targetId.toString(), isOwner: false },
          width,
          height,
        });
      }, 0);
    },
    []
  );

  /**
   * Listen click document
   */
  useEffect(() => {
    const cleanStore = storeClickDocument.subscribe(() => {
      const {
        clickDocument: { clientX, clientY },
      } = storeClickDocument.getState();
      const isTarget = isClickByDialog({ clientX, clientY, dialog });
      if (!isTarget) {
        setDialog({
          open: false,
          clientY: dialog.clientY,
          clientX: dialog.clientX,
          width: 0,
          height: 0,
          context: DIALOG_DEFAULT.context,
          secure: false,
        });
      }
    });
    return () => {
      cleanStore();
    };
  }, [dialog]);

  return { dialog, clickToVolume, changeVolumeWrapper, volumes };
};

export const useSettingsDialog = () => {
  const [dialogSettings, setDialogSettings] =
    useState<Omit<DialogProps<DialogPropsUsersContext>, 'children'>>(DIALOG_DEFAULT);

  const clickToSettingsWrapper =
    ({ target, isOwner }: { target: string | number; isOwner: boolean }) =>
    (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const { clientX: _clientX, clientY: _clientY } = ev;
      const { width, height } = DIALOG_SETTINGS_DIMENSION;
      const { clientX, clientY } = getDialogPosition({ _clientX, _clientY, width, height });
      setTimeout(() => {
        setDialogSettings({
          open: true,
          clientX,
          clientY,
          context: { unitId: target.toString(), isOwner },
          width,
          height,
        });
      }, 0);
    };

  /**
   * Listen click document
   */
  useEffect(() => {
    const cleanStore = storeClickDocument.subscribe(() => {
      setDialogSettings({
        open: false,
        clientY: dialogSettings.clientY,
        clientX: dialogSettings.clientX,
        width: 0,
        height: 0,
        context: DIALOG_DEFAULT.context,
        secure: false,
      });
    });
    return () => {
      cleanStore();
    };
  }, [dialogSettings]);

  return {
    dialogSettings,
    clickToSettingsWrapper,
  };
};

export const useVideoStarted = ({
  streams,
  rtc,
  lostStreamHandler,
  roomId,
}: {
  streams: Stream[];
  rtc: RTC;
  lostStreamHandler: typeof rtc.lostStreamHandler;
  roomId: string | number;
}) => {
  const [played, setPlayed] = useState<Record<string, boolean>>({});
  const [timeStart, setTimeStart] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<Record<string | number, number>>({});

  /**
   * Clean played
   */
  useEffect(() => {
    if (!timeStart) {
      setTimeStart(true);
      const _played = { ...played };
      streams.forEach((item) => {
        _played[item.target] = false;
      });
      setPlayed(_played);
    }
  }, [streams, timeStart, played]);

  /**
   * Check not played
   */
  useEffect(() => {
    let mounted = true;
    const timeout = setInterval(() => {
      if (timeStart) {
        const diffs: Stream[] = [];
        if (Object.keys(played).length === streams.length) {
          streams.forEach((item) => {
            const that = Object.keys(played).find(
              (_item) => _item === item.target.toString() && !played[_item]
            );
            if (that) {
              diffs.push(item);
            }
          });
        } else {
          streams.forEach((item) => {
            const that = Object.keys(played).find((_item) => _item === item.target.toString());
            if (!that) {
              diffs.push(item);
            }
          });
        }
        const _attempts = { ...attempts };
        diffs.forEach((item) => {
          if (!played[item.target] && mounted) {
            lostStreamHandler({ ...item, eventName: 'not-played', roomId });
          }
        });
        setAttempts(_attempts);
      }
    }, VIDEO_STARTED_HOOK_TIMEOUT);
    return () => {
      clearInterval(timeout);
      mounted = false;
    };
  }, [played, streams, lostStreamHandler, attempts, timeStart, rtc.muteds, rtc.roomLength, roomId]);

  return { played, setPlayed };
};

export const useVideoHandlers = ({
  analyzeSoundLevel,
  createAudioAnalyzer,
  lostStreamHandler,
  setPlayed,
  played,
  setVideoDimensions,
  roomId,
}: {
  analyzeSoundLevel: (uid: string | number) => void;
  createAudioAnalyzer: (item: Stream) => void;
  lostStreamHandler: RTC['lostStreamHandler'];
  setPlayed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  played: Record<string, boolean>;
  setVideoDimensions: (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
    stream: MediaStream
  ) => void;
  roomId: string | number;
}) => {
  const onTimeUpdateWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      analyzeSoundLevel(item.target);
      if (item.stream.active === false) {
        log('warn', `Stream is not active ${item.target}`, {
          uid: item.target,
          stream: item.stream,
        });
        lostStreamHandler({
          target: item.target,
          connId: item.connId,
          eventName: 'stream-not-active',
          roomId,
        });
      } else {
        if (!played[item.target]) {
          const _played = { ...played };
          _played[item.target] = true;
          setPlayed(_played);
        }
        if (!item.hidden) {
          setVideoDimensions(e, item.stream);
        }
      }
    },
    [analyzeSoundLevel, lostStreamHandler, setPlayed, setVideoDimensions, played, roomId]
  );

  const onLoadedDataWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { target }: { target: HTMLVideoElement } = e as any;
      target.play();
      const tracks = item.stream.getTracks();
      if (tracks.length < 2) {
        log('warn', 'Stream have less than 2 tracks', { item, tracks });
      }
    },
    []
  );

  const onLoadedMetadataWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      log('info', 'Meta data loaded', { ...item });
      createAudioAnalyzer(item);
      if (!played[item.target]) {
        const _played = { ...played };
        _played[item.target] = true;
        setPlayed(_played);
      }
    },
    [played, createAudioAnalyzer, setPlayed]
  );

  const onEmptiedWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      log('info', 'Empty video data', {
        stream: item.stream,
        id: item.target,
        tracks: item.stream.getTracks(),
      });
    },
    []
  );

  const onSuspendWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      log('info', 'Suspend video data', {
        stream: item.stream,
        id: item.target,
        tracks: item.stream.getTracks(),
      });
    },
    []
  );

  const onStalledWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      log('warn', 'Stalled video data', {
        stream: item.stream,
        id: item.target,
        tracks: item.stream.getTracks(),
      });
    },
    []
  );

  const onAbortWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      log('info', 'Abort video data', {
        stream: item.stream,
        id: item.target,
        tracks: item.stream.getTracks(),
      });
    },
    []
  );

  const onEndedWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      log('warn', 'End video data', {
        stream: item.stream,
        id: item.target,
        tracks: item.stream.getTracks(),
      });
    },
    []
  );

  const onWaitingWrapper = useMemo(
    () => (item: Stream) => (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      log('warn', 'Waiting video data', {
        active: item.stream.active,
        id: item.target,
        t: (e.target as HTMLVideoElement).played,
      });
    },
    []
  );

  return {
    onAbortWrapper,
    onEmptiedWrapper,
    onEndedWrapper,
    onLoadedDataWrapper,
    onLoadedMetadataWrapper,
    onStalledWrapper,
    onSuspendWrapper,
    onWaitingWrapper,
    onTimeUpdateWrapper,
  };
};

export const useMaxVideoStreams = ({ streams }: { streams: Stream[] }) => {
  const [canPlayVideo, setCanPlayVideo] = useState<boolean>(false);

  const activeVideoLength = useMemo(
    () => streams.filter((item) => item.hidden !== true).length,
    [streams]
  );

  /**
   * Set can play video
   */
  useEffect(() => {
    const _canPlayVideo = activeVideoLength < MAX_VIDEO_STREAMS;
    if (_canPlayVideo !== canPlayVideo) {
      setCanPlayVideo(_canPlayVideo);
    }
  }, [canPlayVideo, activeVideoLength]);

  return { canPlayVideo, activeVideoLength };
};
