import React, { useEffect, useState } from 'react';
import storeLocale, { changeLocale } from '../store/locale';
import {
  LocaleDefault,
  LocaleValue,
  MessageType,
  RecordCommand,
  RoomUser,
  UserList,
} from '../types/interfaces';
import { getCookie, CookieName, setCookie } from '../utils/cookies';
import storeStreams from '../store/streams';
import storeUserList from '../store/userList';
import storeMessage, { changeMessage } from '../store/message';
import storeTimeRecord, { RootState } from '../store/timeRecord';
import { getTime } from './Hall.lib';

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
  const [openSettings, setOpenSettings] = useState<boolean>(false);
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

export const useVideoRecord = ({
  roomId,
  userId,
}: {
  roomId: string | number;
  userId: string | number;
}) => {
  const videoRecordWrapper =
    ({ command }: { command: keyof typeof RecordCommand }) =>
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      storeMessage.dispatch(
        changeMessage<MessageType.GET_RECORD>({
          message: {
            type: 'room',
            value: {
              type: MessageType.GET_RECORD,
              connId: '',
              id: roomId,
              data: {
                command,
                userId,
              },
            },
          },
        })
      );
    };

  return { videoRecordWrapper };
};

export const useTimeRecord = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const { subscribe }: any = storeTimeRecord;
    const cleanSubs = subscribe(() => {
      const {
        message: {
          value: {
            data: { time: _time },
          },
        },
      }: RootState<MessageType.SET_RECORDING> = storeTimeRecord.getState() as any;
      setTime(getTime(_time));
    });
    return () => {
      cleanSubs();
    };
  }, []);

  return { time };
};
