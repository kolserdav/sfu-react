import { useState, useEffect, useMemo } from 'react';
import { MessageType, RoomList, RoomUser, UserList } from '../types/interfaces';
import storeUserList from '../store/userList';
import storeMessage, { changeMessage } from '../store/message';
import storeMuted, { changeMuted } from '../store/muted';
import storeAdminMuted, { changeAdminMuted } from '../store/adminMuted';
import storeAsked, { changeAsked } from '../store/asked';
import storeSpeaker from '../store/speaker';
import { CHANGE_SPEAKER_SORT_TIMEOUT } from '../utils/constants';
import storeMuteForAll, { changeMuteForAll } from '../store/muteForAll';
import { useIsOwner } from '../utils/hooks';

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

  const { roomUsers, isOwner } = useIsOwner({ userId });

  const unBanWrapper = (target: string | number) => () => {
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

  const asked = useMemo(() => askeds.indexOf(userId) !== -1, [askeds, userId]);

  return { users, isOwner, banneds, unBanWrapper, askeds, speaker, muteds, adminMuteds, asked };
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
