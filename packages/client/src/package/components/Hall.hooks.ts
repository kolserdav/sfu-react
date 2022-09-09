import React, { useEffect, useMemo, useState, useRef } from 'react';
import storeLocale, { changeLocale } from '../store/locale';
import {
  LocaleDefault,
  LocaleValue,
  MessageType,
  RoomUser,
  SendMessageArgs,
  UserList,
} from '../types/interfaces';
import { VideoRecorderState } from '../types';
import { getTime } from '../utils/lib';
import { getCookie, CookieName, setCookie } from '../utils/cookies';
import storeStreams from '../store/streams';
import storeUserList from '../store/userList';
import storeMessage, { changeMessage } from '../store/message';
import storeTimeRecord, { RootState } from '../store/timeRecord';
import { videoRecordWrapper } from './Hall.lib';
import { LocalStorageName } from '../utils/localStorage';

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

export const useSettings = ({ open }: { open: boolean }) => {
  const defaultOpenSettings = useMemo(
    () => typeof localStorage.getItem(LocalStorageName.SETTINGS_OPEN) === 'string',
    []
  );
  const [openSettings, setOpenSettings] = useState<boolean>(defaultOpenSettings);
  const openSettingsDialog = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setOpenSettings(!openSettings);
  };

  /**
   * Listen close
   */
  useEffect(() => {
    if (openSettings && !open) {
      setOpenSettings(false);
    }
  }, [open, openSettings]);

  return { openSettings, openSettingsDialog };
};

export const useUsers = ({
  userId,
  roomId,
}: {
  userId: string | number;
  roomId: string | number;
}) => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [users, setUsers] = useState<UserList[]>([]);
  const [banneds, setBanneds] = useState<RoomUser[]>([]);
  const [muteds, setMuteds] = useState<(string | number)[]>([]);
  const [adminMuteds, setAdminMuteds] = useState<(string | number)[]>([]);

  const unBanWrapper =
    (target: string | number) => (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      storeMessage.dispatch(
        changeMessage({
          message: {
            type: 'room',
            value: {
              type: MessageType.GET_TO_UNBAN,
              id: roomId,
              connId: '',
              data: {
                target,
                userId,
              },
            },
          },
        })
      );
    };

  /**
   * Listen change users
   */
  useEffect(() => {
    const cleanSubs = storeStreams.subscribe(() => {
      const state = storeStreams.getState();
      let _isOwner = false;
      const _users = state.streams.map((item) => {
        if (item.target === userId) {
          _isOwner = item.isOwner;
        }
        return {
          id: item.target,
          name: item.name,
          isOwner: item.isOwner,
        };
      });
      setIsOwner(_isOwner);
      setRoomUsers(_users);
    });
    return () => {
      cleanSubs();
    };
  }, [userId]);

  /**
   * Create user list
   */
  useEffect(() => {
    const _users = roomUsers.map((item) => ({
      id: item.id,
      name: item.name,
      isOwner: item.isOwner,
      muted: muteds.indexOf(item.id) !== -1,
      adminMuted: adminMuteds.indexOf(item.id) !== -1,
    }));
    setUsers(_users);
  }, [muteds, adminMuteds, roomUsers]);

  /**
   * Listen user list
   */
  useEffect(() => {
    const cleanSubs = storeUserList.subscribe(() => {
      const {
        userList: { banneds: _banneds, muteds: _muteds, adminMuteds: _adminMuteds },
      } = storeUserList.getState();
      setBanneds(_banneds);
      setMuteds(_muteds);
      setAdminMuteds(_adminMuteds);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  return { users, isOwner, banneds, unBanWrapper };
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
  const settingsRef = useRef<HTMLDivElement>();
  const [settingStyle, setSettingStyle] = useState<string>();
  useEffect(() => {
    const { current } = settingsRef;
    if (current) {
      setSettingStyle(current.getAttribute('style'));
    }
  }, []);
  return { settingsRef, settingStyle };
};
