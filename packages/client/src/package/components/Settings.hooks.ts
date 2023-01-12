/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Settings.hooks.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  DialogDeleteContext,
  DialogProps,
  DialogPropsUsersContext,
  VideoFull,
  VideoRecorderState,
} from '../types';
import { SendMessageArgs, MessageType, LocaleDefault, LocaleValue } from '../types/interfaces';
import { getDialogPosition, getTime, isClickByDialog, log } from '../utils/lib';
import storeLocale, { changeLocale } from '../store/locale';
import { getCookie, CookieName, setCookie } from '../utils/cookies';
import {
  CONTEXT_DEFAULT,
  DIALOG_DEFAULT,
  DIALOG_DELETE_DEFAULT,
  DIALOG_DELETE_DEFAULT_CONTEXT,
  DIALOG_DELETE_DIMENSION,
  RECORDED_VIDEO_TAKE_DEFAULT,
} from '../utils/constants';
import { getVideoSrc } from './Settings.lib';
import WS, { Protocol } from '../core/ws';
import storeCanConnect from '../store/canConnect';
import storeClickDocument from '../store/clickDocument';

export const useLang = () => {
  const [lang, setLang] = useState<LocaleValue>(getCookie(CookieName.lang) || LocaleDefault);

  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LocaleValue;
    setLang(value);
    setCookie(CookieName.lang, value);
    storeLocale.dispatch(changeLocale({ locale: value }));
  };

  return { lang, changeLang };
};

let _command: VideoRecorderState = 'stop';

export const useVideoRecord = ({
  roomId,
  userId,
  ws,
  buttonDisabled,
  setButtonDisabled,
}: {
  roomId: string | number;
  userId: string | number;
  ws: WS;
  buttonDisabled: boolean;
  setButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const recordStartWrapper =
    (command: SendMessageArgs<MessageType.GET_RECORD>['data']['command']) => () => {
      if (command !== _command) {
        _command = command;
        setButtonDisabled(_command === 'start');
      }
      ws.sendMessage({
        type: MessageType.GET_RECORD,
        connId: '',
        id: roomId,
        data: {
          command,
          userId,
        },
      });
    };

  return { recordStartWrapper };
};

export const useSettingsStyle = () => {
  const settingsRef = useRef<HTMLDivElement>(null);
  const [settingStyle, setSettingStyle] = useState<string>();
  useEffect(() => {
    const { current } = settingsRef;
    if (current) {
      setSettingStyle(current.getAttribute('style') || '');
    }
  }, []);
  return { settingsRef, settingStyle };
};

export const usePlayVideo = ({
  server,
  port,
  roomId,
}: {
  server: string;
  port: number;
  roomId: string | number;
}) => {
  const [playedVideo, setPlayedVideo] = useState<string>('');

  const playVideoWrapper = (videoName: string) => () => {
    setPlayedVideo(getVideoSrc({ port, server, name: videoName, roomId }));
  };
  const handleCloseVideo = () => {
    setPlayedVideo('');
  };

  return { playVideoWrapper, playedVideo, handleCloseVideo };
};

export const useDeleteVideo = () => {
  const [dialogDelete, setDialogDelete] =
    useState<Omit<DialogProps<DialogDeleteContext>, 'children'>>(DIALOG_DELETE_DEFAULT);

  const openDeleteDialogWrapper =
    ({ id, name }: DialogDeleteContext) =>
    (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const { clientX: _clientX, clientY: _clientY } = ev;
      const { width, height } = DIALOG_DELETE_DIMENSION;
      const { clientX, clientY } = getDialogPosition({ _clientX, _clientY, width, height });
      setDialogDelete({
        open: true,
        context: {
          id,
          name,
        },
        clientX,
        clientY,
        width,
        height,
      });
    };

  const closeDeleteDialogHandler = useMemo(
    () => () => {
      setDialogDelete({
        open: false,
        clientY: dialogDelete.clientY,
        clientX: dialogDelete.clientX,
        width: 0,
        height: 0,
        context: DIALOG_DELETE_DEFAULT_CONTEXT,
        secure: false,
      });
    },
    [dialogDelete]
  );

  const deleteVideoWrapper = useMemo(
    () =>
      ({ id }: DialogDeleteContext) =>
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log(id);
        closeDeleteDialogHandler();
      },
    [closeDeleteDialogHandler]
  );

  return { openDeleteDialogWrapper, dialogDelete, closeDeleteDialogHandler, deleteVideoWrapper };
};

export const useMessages = ({
  roomId,
  userId,
  server,
  port,
  protocol,
  token,
}: {
  roomId: string | number;
  userId: string | number;
  server: string;
  port: number;
  protocol: Protocol;
  token: string;
}) => {
  const ws = useMemo(() => new WS({ server, port, protocol: 'settings' }), [port, server]);
  const [time, setTime] = useState<string>('');
  const [started, setStarted] = useState<boolean>(false);
  const [connId, setConnId] = useState<string>('');
  const [skip, setSkip] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [videos, setVideos] = useState<VideoFull[]>([]);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [loadProcent, setLoadProcent] = useState<number>(0);

  /**
   * Listen can connect
   */
  useEffect(() => {
    const cleanSubs = storeCanConnect.subscribe(() => {
      const { canConnect: _canConnect } = storeCanConnect.getState();
      if (!_canConnect) {
        ws.connection.close();
      }
    });
    return () => {
      cleanSubs();
    };
  }, [ws.connection]);

  /**
   * Handle messages
   */
  useEffect(() => {
    ws.onOpen = () => {
      ws.sendMessage({
        id: roomId,
        type: MessageType.GET_SETTINGS_UNIT,
        connId: '',
        data: {
          userId,
          locale: getCookie(CookieName.lang) || LocaleDefault,
        },
      });
    };
    const setErrorHandler = ({
      data: { message: children, type },
    }: SendMessageArgs<MessageType.SET_ERROR>) => {
      log(type, children, {}, true);
    };

    const setVideoFindManyHandler = ({
      data: {
        videos: { result, count: _count },
      },
      id: _id,
    }: SendMessageArgs<MessageType.SET_VIDEO_FIND_MANY>) => {
      setCount(_count);
      setVideos(result.concat(videos));
    };

    const setVideoFindFirstHandler = ({
      data: { video },
      id: _id,
    }: SendMessageArgs<MessageType.SET_VIDEO_FIND_FIRST>) => {
      if (video) {
        const _video = [video];
        setVideos(_video.concat(videos));
      }
    };

    const handleRecordingTime = ({
      data: { time: _time, command },
    }: SendMessageArgs<MessageType.SET_RECORDING>) => {
      const _started = command === 'start';
      if (_started && !started) {
        setStarted(true);
      }
      if (!_started && started) {
        setStarted(false);
      }
      if (buttonDisabled) {
        setButtonDisabled(false);
      }
      setTime(getTime(new Date().getTime() - _time * 1000));
      if (command === 'stop') {
        setLoadProcent(0);
        setTimeout(() => {
          ws.sendMessage({
            id: roomId,
            connId,
            type: MessageType.GET_VIDEO_FIND_FIRST,
            data: {
              token,
              userId,
              args: {
                where: {
                  roomId: roomId.toString(),
                },
                orderBy: {
                  created: 'desc',
                },
              },
            },
          });
          // TODO check event
        }, 3000);
      }
    };

    const setCreateVideoHandler = ({
      data: { procent },
    }: SendMessageArgs<MessageType.SET_CREATE_VIDEO>) => {
      setLoadProcent(procent);
    };

    const setSettingsUnitHandler = ({
      connId: _connId,
    }: SendMessageArgs<MessageType.SET_SETTINGS_UNIT>) => {
      ws.sendMessage({
        type: MessageType.GET_VIDEO_FIND_MANY,
        id: roomId,
        connId: '',
        data: {
          args: {
            where: {
              roomId: roomId.toString(),
            },
            orderBy: {
              created: 'desc',
            },
            skip,
            take: RECORDED_VIDEO_TAKE_DEFAULT,
          },
          userId,
          token,
        },
      });
      setConnId(_connId);
      setSkip(skip + RECORDED_VIDEO_TAKE_DEFAULT);
    };

    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type } = rawMessage;
      switch (type) {
        case MessageType.SET_SETTINGS_UNIT:
          setSettingsUnitHandler(rawMessage);
          break;
        case MessageType.SET_VIDEO_FIND_MANY:
          setVideoFindManyHandler(rawMessage);
          break;
        case MessageType.SET_CREATE_VIDEO:
          setCreateVideoHandler(rawMessage);
          break;
        case MessageType.SET_VIDEO_FIND_FIRST:
          setVideoFindFirstHandler(rawMessage);
          break;
        case MessageType.SET_RECORDING:
          handleRecordingTime(rawMessage);
          break;
        case MessageType.SET_ERROR:
          setErrorHandler(rawMessage);
          break;
        default:
      }
    };
    ws.onError = (e) => {
      log('error', 'Error chat', { e });
    };
    ws.onClose = () => {
      log('warn', 'Settings connection closed', {});
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
  }, [ws, userId, roomId, connId, skip, videos, buttonDisabled, started, token]);

  return { videos, time, started, buttonDisabled, setButtonDisabled, ws, loadProcent };
};
