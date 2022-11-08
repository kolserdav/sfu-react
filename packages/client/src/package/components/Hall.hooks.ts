import React, { useEffect, useState } from 'react';
import { LocalStorageName, setLocalStorage } from '../utils/localStorage';
import { getDocumentWidth } from '../utils/lib';
import { MOBILE_WIDTH } from '../utils/constants';

export const useSettings = ({ open }: { open: boolean }) => {
  const [openSettings, setOpenSettings] = useState<boolean>(
    localStorage.getItem(LocalStorageName.SETTINGS_OPEN) === 'true' &&
      getDocumentWidth() <= MOBILE_WIDTH
  );
  const openSettingsDialog = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setLocalStorage(LocalStorageName.SETTINGS_OPEN, !openSettings);
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

export const useUserList = ({ open }: { open: boolean }) => {
  const [openUserList, setOpenUserList] = useState<boolean>(false);
  const openUserListHandler = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setOpenUserList(!openUserList);
  };

  /**
   * Listen close
   */
  useEffect(() => {
    if (openUserList && !open) {
      setOpenUserList(false);
    }
  }, [open, openUserList]);

  return { openUserList, openUserListHandler };
};
