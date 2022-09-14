import { useRef, useState, useEffect } from 'react';
import { VideoFull, VideoRecorderState } from '../types';
import { SendMessageArgs, MessageType, LocaleDefault, LocaleValue } from '../types/interfaces';
import { getTime } from '../utils/lib';
import storeTimeRecord, { RootState } from '../store/timeRecord';
import { videoRecord } from './Hall.lib';
import storeLocale, { changeLocale } from '../store/locale';
import { getCookie, CookieName, setCookie } from '../utils/cookies';
import { RECORDED_VIDEO_TAKE_DEFAULT } from '../utils/constants';
import storeMessage, { changeMessage } from '../store/message';
import storeError from '../store/error';
import storeVideos from '../store/video';
import { getVideoSrc } from './Settings.lib';

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

export const useTimeRecord = () => {
  const [time, setTime] = useState<string>('');
  const [started, setStarted] = useState<boolean>(false);

  /**
   * Listen change time
   */
  useEffect(() => {
    const { subscribe }: any = storeTimeRecord;
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
      setTime(getTime(new Date().getTime() - _time * 1000));
    });
    return () => {
      cleanSubs();
    };
  }, [started]);

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

export const useSettings = () => {
  const { lang, changeLang } = useLang();
  const { time, started } = useTimeRecord();

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
  const [take, setTake] = useState<number>(RECORDED_VIDEO_TAKE_DEFAULT);
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
                skip,
                take,
              },
              userId,
              token: '',
            },
          },
        },
      })
    );
    // take is wrong
  }, [roomId, userId, skip, load]);

  /**
   * Listen recorded videos
   */
  useEffect(() => {
    const cleanSubs = storeVideos.subscribe(() => {
      const { videos: _videos, count: _count, take: _take, skip: _skip } = storeVideos.getState();
      setVideos(_videos);
      setCount(_count);
      setTake(_take);
      setSkip(_skip);
    });
    return () => {
      cleanSubs();
    };
  }, []);

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
    settingsRef,
    settingStyle,
    skip,
    take,
    count,
    videos,
    setButtonDisabled,
  };
};

export const usePlayVideo = ({
  server,
  port,
  buttonDisabled,
  setButtonDisabled,
}: {
  server: string;
  port: number;
  buttonDisabled: boolean;
  setButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [playedVideo, setPlayedVideo] = useState<string>('');
  const playVideoWrapper = (videoName: string) => () => {
    setPlayedVideo(getVideoSrc({ port, server, name: videoName }));
    if (buttonDisabled) {
      setButtonDisabled(false);
    }
  };
  const handleCloseVideo = () => {
    setPlayedVideo('');
    setButtonDisabled(false);
  };

  return { playVideoWrapper, playedVideo, handleCloseVideo };
};
