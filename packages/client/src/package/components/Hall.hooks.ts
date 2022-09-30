import React, { useEffect, useState } from 'react';
import { MessageType, RoomUser, UserList } from '../types/interfaces';
import storeStreams from '../store/streams';
import storeUserList from '../store/userList';
import storeMessage, { changeMessage } from '../store/message';
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
