import React, { useEffect, useState } from 'react';
import storeLocale, { changeLocale } from '../store/locale';
import { LocaleDefault, LocaleValue, RoomUser } from '../types/interfaces';
import { getCookie, CookieName, setCookie } from '../utils/cookies';
import storeStreams from '../store/streams';

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

export const useUsers = () => {
  const [users, setUsers] = useState<RoomUser[]>([]);

  /**
   * Listen change users
   */
  useEffect(() => {
    const cleanSubs = storeStreams.subscribe(() => {
      const state = storeStreams.getState();
      const _users = state.streams.map((item) => ({
        id: item.target,
        name: item.name,
        isOwner: item.isOwner,
      }));
      setUsers(_users);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  return { users };
};
