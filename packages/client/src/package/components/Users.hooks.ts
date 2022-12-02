/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Users.hooks.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import { useState, useEffect, useMemo } from 'react';
import { MessageType, RoomList, RoomUser, UserList } from '../types/interfaces';
import storeUserList from '../store/userList';
import storeMessage, { changeMessage } from '../store/message';
import storeMuted, { changeMuted } from '../store/muted';
import storeAdminMuted, { changeAdminMuted } from '../store/adminMuted';
import storeAsked, { changeAsked } from '../store/asked';
import storeSpeaker from '../store/speaker';
import {
  CHANGE_SPEAKER_SORT_TIMEOUT,
  CONTEXT_DEFAULT,
  DIALOG_DEFAULT,
  DIALOG_USER_DIMENSION,
  DIALOG_VOLUME_DIMENSION,
  VOLUME_MIN,
} from '../utils/constants';
import storeMuteForAll, { changeMuteForAll } from '../store/muteForAll';
import { useIsOwner } from '../utils/hooks';
import storeChatBlockeds from '../store/chatBlockeds';
import { DialogProps, DialogPropsUsersContext, Volumes } from '../types';
import { getDialogPosition, isClickByDialog } from '../utils/lib';
import storeClickDocument from '../store/clickDocument';
import storeBanned, { changeBanned } from '../store/banned';
import { getLocalStorage, LocalStorageName } from '../utils/localStorage';
import storeVolume, { changeVolume } from '../store/volume';
import storeAdmin, { changeAdmin } from '../store/admin';

// eslint-disable-next-line import/prefer-default-export
export const useUsers = ({
  userId,
  roomId,
}: {
  userId: string | number;
  roomId: string | number;
}) => {
  const [users, setUsers] = useState<UserList[]>([]);
  const [banneds, setBanneds] = useState<RoomUser[]>([]);
  const [muteds, setMuteds] = useState<(string | number)[]>([]);
  const [askeds, setAskeds] = useState<(string | number)[]>([]);
  const [adminMuteds, setAdminMuteds] = useState<(string | number)[]>([]);
  const [speaker, setSpeaker] = useState<string | number>(0);
  const [chatBlockeds, setChatBlockeds] = useState<(string | number)[]>([]);

  const { roomUsers, isOwner } = useIsOwner({ userId });

  const unBanWrapper = useMemo(
    () => (target: string | number) => () => {
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
    },
    [roomId, userId]
  );

  const unblockChatWrapper = useMemo(
    () => (target: string | number) => () => {
      storeMessage.dispatch(
        changeMessage({
          message: {
            type: 'chat',
            value: {
              type: MessageType.GET_BLOCK_CHAT,
              id: roomId,
              connId: '',
              data: {
                command: 'delete',
                target,
              },
            },
          },
        })
      );
    },
    [roomId]
  );

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
        userList: {
          banneds: _banneds,
          muteds: _muteds,
          adminMuteds: _adminMuteds,
          askeds: _askeds,
        },
      } = storeUserList.getState();
      setBanneds(_banneds);
      setMuteds(_muteds);
      setAdminMuteds(_adminMuteds);
      setAskeds(_askeds);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  /**
   * Listen speaker
   */
  useEffect(() => {
    const cleanSubs = storeSpeaker.subscribe(() => {
      const { speaker: _speaker } = storeSpeaker.getState();
      setSpeaker(_speaker);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  /**
   * Listen chat blockeds
   */
  useEffect(() => {
    const cleanSubs = storeChatBlockeds.subscribe(() => {
      const { chatBlockeds: _chatBlockeds } = storeChatBlockeds.getState();
      setChatBlockeds(_chatBlockeds);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  const asked = useMemo(() => askeds.indexOf(userId) !== -1, [askeds, userId]);

  return {
    users,
    isOwner,
    banneds,
    unBanWrapper,
    unblockChatWrapper,
    askeds,
    speaker,
    muteds,
    adminMuteds,
    asked,
    chatBlockeds,
  };
};

export const useActions = ({ userId }: { userId: string | number }) => {
  const changeMutedWrapper = useMemo(
    () =>
      ({ muted, id }: UserList) =>
      () => {
        if (id === userId) {
          storeMuted.dispatch(changeMuted({ muted: !muted, id: userId }));
        }
      },
    [userId]
  );

  const changeAdminMutedWrapper = useMemo(
    () =>
      ({ adminMuted, id }: UserList) =>
      () => {
        storeAdminMuted.dispatch(changeAdminMuted({ adminMuted: !adminMuted, id }));
      },
    []
  );

  const askForTheFloorWrapper = useMemo(
    () =>
      ({ id }: UserList) =>
      () => {
        storeAsked.dispatch(changeAsked({ command: 'add', userId: id }));
      },
    []
  );

  return { changeMutedWrapper, changeAdminMutedWrapper, askForTheFloorWrapper };
};

export const useSortAdminMuted = ({
  users: _users,
  adminMuteds,
}: {
  users: UserList[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminMuteds: RoomList[any];
}) => {
  const users = useMemo(
    () =>
      _users.sort((a, b) => {
        if (adminMuteds.indexOf(a.id) !== -1 && adminMuteds.indexOf(b.id) === -1) {
          return 1;
        }
        return -1;
      }),
    [_users, adminMuteds]
  );
  return users;
};

export const useSortIsMe = ({
  users: _users,
  userId,
}: {
  users: UserList[];
  userId: string | number;
}) => {
  const users = useMemo(
    () =>
      _users.sort((a, b) => {
        if (a.id !== userId && b.id === userId) {
          return 1;
        }
        return -1;
      }),
    [_users, userId]
  );
  return users;
};

export const useSortSpeaker = ({
  users: _users,
  speaker,
}: {
  users: UserList[];
  speaker: string | number;
}) => {
  const [sortBy, setSortBy] = useState<string | number>(0);

  const users = useMemo(
    () =>
      sortBy
        ? _users.sort((a, b) => {
            if (a.id !== sortBy && b.id === sortBy) {
              return 1;
            }
            return -1;
          })
        : _users,
    [_users, sortBy]
  );

  /**
   * Listen timeout
   */
  useEffect(() => {
    let mounted = true;
    let timeout = setTimeout(() => {
      /** */
    }, 0);
    if (speaker !== sortBy) {
      timeout = setTimeout(() => {
        if (mounted) {
          setSortBy(speaker);
        }
      }, CHANGE_SPEAKER_SORT_TIMEOUT);
    }
    return () => {
      clearTimeout(timeout);
      mounted = false;
    };
  }, [speaker, sortBy]);

  return users;
};

export const useMuteAll = ({
  adminMuteds,
  users,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminMuteds: RoomList[any];
  users: UserList[];
}) => {
  const [muteForAll, setMuteForAll] = useState<boolean>(false);

  const muteAllHandler = useMemo(
    () => () => {
      users.forEach((user) => {
        if (adminMuteds.indexOf(user.id) === -1 && !user.isOwner) {
          storeAdminMuted.dispatch(changeAdminMuted({ adminMuted: true, id: user.id }));
        }
      });
    },
    [users, adminMuteds]
  );

  const changeMuteForAllHandler = useMemo(
    () => (e: React.ChangeEvent<HTMLInputElement>) => {
      const {
        target: { checked },
      } = e;
      storeMuteForAll.dispatch(
        changeMuteForAll({
          type: MessageType.GET_MUTE_FOR_ALL,
          muteForAll: checked,
        })
      );
    },
    []
  );

  /**
   * Listen mute for all
   */
  useEffect(() => {
    const cleanSubs = storeMuteForAll.subscribe(() => {
      const { type, muteForAll: _muteForAll } = storeMuteForAll.getState();
      if (type === MessageType.SET_MUTE_FOR_ALL) {
        setMuteForAll(_muteForAll);
      }
    });
    return () => {
      cleanSubs();
    };
  }, []);

  return { muteAllHandler, changeMuteForAllHandler, muteForAll };
};

export const useSettings = ({ isOwner }: { isOwner: boolean }) => {
  const [dialogSettings, setDialogSettings] =
    useState<Omit<DialogProps<DialogPropsUsersContext>, 'children'>>(DIALOG_DEFAULT);

  const clickToBanWrapper = useMemo(
    () =>
      ({ unitId }: Omit<DialogProps<DialogPropsUsersContext>, 'children'>['context']) =>
      () => {
        storeBanned.dispatch(
          changeBanned({
            id: unitId,
            banned: true,
          })
        );
      },
    []
  );

  const clickToSetAdminWrapper = useMemo(
    () =>
      ({
        unitId,
        isOwner: _isOwner,
      }: Omit<DialogProps<DialogPropsUsersContext>, 'children'>['context']) =>
      () => {
        storeAdmin.dispatch(
          changeAdmin({
            id: unitId,
            admin: !_isOwner,
          })
        );
      },
    []
  );

  const onContextMenuWrapper = useMemo(
    () =>
      (context: DialogProps<DialogPropsUsersContext>['context']) =>
      (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!isOwner) {
          return;
        }
        const { shiftKey } = ev;
        if (!shiftKey) {
          ev.preventDefault();
          const { clientX: _clientX, clientY: _clientY } = ev;
          const { width, height } = DIALOG_USER_DIMENSION;
          const { clientX, clientY } = getDialogPosition({ _clientX, _clientY, width, height });
          setDialogSettings({
            open: true,
            clientY,
            clientX,
            width,
            height,
            context,
          });
        }
      },
    [isOwner]
  );

  /**
   * Listen click document
   */
  useEffect(() => {
    const cleanStore = storeClickDocument.subscribe(() => {
      // TODO check area
      const {
        clickDocument: { clientX, clientY },
      } = storeClickDocument.getState();
      setDialogSettings({
        open: false,
        clientY: dialogSettings.clientY,
        clientX: dialogSettings.clientX,
        width: 0,
        height: 0,
        context: CONTEXT_DEFAULT,
        secure: false,
      });
    });
    return () => {
      cleanStore();
    };
  }, [dialogSettings]);

  return { dialogSettings, clickToBanWrapper, onContextMenuWrapper, clickToSetAdminWrapper };
};

export const useVolume = ({ roomId }: { roomId: string | number }) => {
  const [dialogVolume, setDialogVolume] =
    useState<Omit<DialogProps<DialogPropsUsersContext>, 'children'>>(DIALOG_DEFAULT);
  const savedVolumes = useMemo(() => {
    const ls = getLocalStorage(LocalStorageName.VOLUMES);
    if (!ls) {
      return null;
    }
    return ls[roomId] || null;
  }, [roomId]);
  const [volumes, setVolumes] = useState<Volumes>(savedVolumes || {});

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
        storeVolume.dispatch(
          changeVolume({
            id: targetId,
            volume: volumeNum,
          })
        );
      },
    [volumes]
  );

  const clickToVolume = useMemo(
    () =>
      ({ target, isOwner }: { target: string | number; isOwner: boolean }) =>
      (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const { clientX: _clientX, clientY: _clientY } = ev;
        const { width, height } = DIALOG_VOLUME_DIMENSION;
        const { clientX, clientY } = getDialogPosition({ _clientX, _clientY, width, height });
        setTimeout(() => {
          setDialogVolume({
            open: true,
            clientX,
            clientY,
            context: { unitId: target.toString(), isOwner },
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
      const isTarget = isClickByDialog({ clientX, clientY, dialog: dialogVolume });
      if (!isTarget) {
        setDialogVolume({
          open: false,
          clientY: dialogVolume.clientY,
          clientX: dialogVolume.clientX,
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
  }, [dialogVolume]);

  const volumeUserId = useMemo(() => dialogVolume.context.unitId, [dialogVolume.context]);

  return { dialogVolume, volumes, changeVolumeWrapper, clickToVolume, volumeUserId };
};
