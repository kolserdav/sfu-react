import { useRef, useState, useEffect } from 'react';
import { VideoRecorderState } from '../types';
import { SendMessageArgs, MessageType, LocaleDefault, LocaleValue } from '../types/interfaces';
import { getTime } from '../utils/lib';
import storeTimeRecord, { RootState } from '../store/timeRecord';
import { videoRecordWrapper } from './Hall.lib';
import storeLocale, { changeLocale } from '../store/locale';
import { getCookie, CookieName, setCookie } from '../utils/cookies';

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

let _command: VideoRecorderState = 'start';

export const useVideoRecord = ({
  roomId,
  userId,
}: {
  roomId: string | number;
  userId: string | number;
}) => {
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const recordStartHandler = (
    command: SendMessageArgs<MessageType.GET_RECORD>['data']['command']
  ) => {
    if (command !== _command) {
      _command = command;
      setButtonDisabled(_command === 'start');
    }
    return videoRecordWrapper({ command, userId, roomId });
  };

  return { recordStartHandler, buttonDisabled };
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

export const useSettings = ({
  roomId,
  userId,
}: {
  roomId: string | number;
  userId: string | number;
}) => {
  const { lang, changeLang } = useLang();
  const { time, started } = useTimeRecord();
  const { recordStartHandler, buttonDisabled } = useVideoRecord({ roomId, userId });
  const { settingsRef, settingStyle } = useSettingsStyle();
  return {
    settingsRef,
    settingStyle,
    recordStartHandler,
    buttonDisabled,
    time,
    started,
    lang,
    changeLang,
  };
};
