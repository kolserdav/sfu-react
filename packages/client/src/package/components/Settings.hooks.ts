import React, { useRef, useState, useEffect, useMemo } from 'react';
import { VideoFull, VideoRecorderState } from '../types';
import { SendMessageArgs, MessageType, LocaleDefault, LocaleValue } from '../types/interfaces';
import { getTime, log } from '../utils/lib';
import storeTimeRecord, { RootState } from '../store/timeRecord';
import { videoRecord } from './Hall.lib';
import storeLocale, { changeLocale } from '../store/locale';
import { getCookie, CookieName, setCookie } from '../utils/cookies';
import { RECORDED_VIDEO_TAKE_DEFAULT } from '../utils/constants';
import storeMessage, { changeMessage } from '../store/message';
import storeError from '../store/error';
import storeVideos from '../store/video';
import { getVideoSrc } from './Settings.lib';
import WS, { Protocol } from '../core/ws';

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
}: {
  roomId: string | number;
  userId: string | number;
}) => {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const recordStartWrapper =
    (command: SendMessageArgs<MessageType.GET_RECORD>['data']['command']) => () => {
      if (command !== _command) {
        _command = command;
        setButtonDisabled(_command === 'start');
      }
      return videoRecord({ command, userId, roomId });
    };

  return { recordStartWrapper, buttonDisabled, setButtonDisabled };
};

export const useTimeRecord = ({
  buttonDisabled,
  setButtonDisabled,
  setSkip,
  skip,
}: {
  buttonDisabled: boolean;
  setButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setSkip: React.Dispatch<React.SetStateAction<number>>;
  skip: number;
}) => {
  const [time, setTime] = useState<string>('');
  const [started, setStarted] = useState<boolean>(false);

  /**
   * Listen change time
   */
  useEffect(() => {
    const { subscribe }: any = storeTimeRecord;
    let timeout = setTimeout(() => {
      /** */
    }, 0);
    /* TODO
    const videoFindFirst = () => {
      storeMessage.dispatch(changeMessage({
        type: 'room'
      }))
    }
    */
    const cleanSubs = subscribe(() => {
      const {
        message: {
          value: {
            data: { time: _time, command },
          },
        },
      }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
      RootState<MessageType.SET_RECORDING> = storeTimeRecord.getState() as any;
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
        timeout = setTimeout(() => {
          //  TODO videoFindFirst();
        }, 1000);
      }
    });
    return () => {
      cleanSubs();
      clearTimeout(timeout);
    };
  }, [started, buttonDisabled, setButtonDisabled, setSkip, skip]);

  return { time, started };
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

export const useSettings = ({
  buttonDisabled,
  setButtonDisabled,
  skip,
  setSkip,
}: {
  buttonDisabled: boolean;
  setButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  setSkip: React.Dispatch<React.SetStateAction<number>>;
  skip: number;
}) => {
  const { lang, changeLang } = useLang();
  const { time, started } = useTimeRecord({ buttonDisabled, setButtonDisabled, skip, setSkip });

  return {
    time,
    started,
    lang,
    changeLang,
  };
};

export const useRecordVideos = ({
  roomId,
  userId,
}: {
  roomId: string | number;
  userId: string | number;
}) => {
  const { recordStartWrapper, buttonDisabled, setButtonDisabled } = useVideoRecord({
    roomId,
    userId,
  });
  const { settingsRef, settingStyle } = useSettingsStyle();
  const [skip, setSkip] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [load, setLoad] = useState<boolean>(false);
  const [videos, setVideos] = useState<VideoFull[]>([]);

  /**
   * Get recorded videos
   */
  useEffect(() => {
    if (!load) {
      return;
    }
    console.log(skip, load);
    storeMessage.dispatch(
      changeMessage({
        message: {
          type: 'room',
          value: {
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
              token: '',
            },
          },
        },
      })
    );
  }, [roomId, userId, skip, load]);

  /**
   * Listen recorded videos
   */
  useEffect(() => {
    const cleanSubs = storeVideos.subscribe(() => {
      const { videos: _videos, count: _count } = storeVideos.getState();
      const __videos = videos.concat(_videos);
      setTimeout(() => {
        setVideos(__videos);
        setCount(_count);
      }, 0);
    });
    return () => {
      cleanSubs();
    };
  }, [videos, buttonDisabled, setButtonDisabled]);

  /**
   * Listen error on initial
   */
  useEffect(() => {
    storeError.subscribe(() => {
      const { error } = storeError.getState();
      if (error === 'initial') {
        setLoad(true);
      }
    });
  }, []);

  return {
    recordStartWrapper,
    buttonDisabled,
    setButtonDisabled,
    settingsRef,
    settingStyle,
    skip,
    count,
    videos,
    setSkip,
  };
};

export const usePlayVideo = ({
  server,
  port,
  roomId,
  setSkip,
  skip,
}: {
  server: string;
  port: number;
  roomId: string | number;
  skip: number;
  setSkip: React.Dispatch<React.SetStateAction<number>>;
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
  const deleteVideoWrapper = (videoId: number) => () => {
    /** */
    console.log(videoId);
  };

  return { deleteVideoWrapper };
};

export const useMessages = ({
  roomId,
  userId,
  server,
  port,
  protocol,
}: {
  roomId: string | number;
  userId: string | number;
  server: string;
  port: number;
  protocol: Protocol;
}) => {
  const ws = useMemo(() => new WS({ server, port, protocol: 'chat' }), [port, server]);

  /**
   * Handle messages
   */
  useEffect(() => {
    const setErrorHandler = ({
      data: { message: children, type },
    }: SendMessageArgs<MessageType.SET_ERROR>) => {
      log(type, children, {}, true);
    };

    ws.onOpen = () => {
      ws.sendMessage({
        id: roomId,
        type: MessageType.GET_CHAT_UNIT,
        connId: '',
        data: {
          userId,
          locale: getCookie(CookieName.lang) || LocaleDefault,
        },
      });
    };
    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type } = rawMessage;
      switch (type) {
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
      log('warn', 'Chat connection closed', {});
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
  }, [ws, userId, roomId]);
};
