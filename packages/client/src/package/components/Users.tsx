import React, { useMemo } from 'react';
import clsx from 'clsx';
import s from './Users.module.scss';
import { Theme } from '../Theme';
import { Locale } from '../types/interfaces';
import { GlobalProps } from '../types';
import { useActions, useUsers } from './Users.hooks';
import MicrophoneOffIcon from '../Icons/MicrophoneOffIcon';
import IconButton from './ui/IconButton';
import CloseIcon from '../Icons/Close';
import { checkIsRecord } from '../utils/lib';
import CrownIcon from '../Icons/Crown';
import MicrophoneIcon from '../Icons/MicrophoneIcon';
import HandUpIcon from '../Icons/HandUp';

function Users({
  theme,
  locale,
  backLinks,
  userId,
  roomId,
  openUserList,
}: {
  locale: Locale.Client;
  theme: Theme | undefined;
  userId: string | number;
  roomId: string | number;
  backLinks: GlobalProps['backLinks'];
  openUserList: boolean;
}) {
  const { users, isOwner, banneds, unBanWrapper, askeds } = useUsers({ userId, roomId });
  const { changeMutedWrapper, changeAdminMutedWrapper, askForTheFloorWrapper } = useActions({
    userId,
  });

  const asked = useMemo(() => askeds.indexOf(userId) !== -1, [askeds, userId]);

  return (
    <div
      className={clsx(s.wrapper, openUserList ? s.open : '')}
      style={{ color: theme?.colors.text, backgroundColor: theme?.colors.paper }}
    >
      {backLinks && <div className={s.users}>{backLinks}</div>}
      <div className={s.title}>{locale.guests}</div>
      {users.map((item) =>
        checkIsRecord(item.id.toString()) ? (
          ''
        ) : (
          <div key={item.id} className={s.users__item}>
            <div className={s.user}>
              <span className={s.name}>{item.name}</span>
              <div className={s.icons}>
                {item.isOwner && (
                  <IconButton
                    disabled
                    title={isOwner ? locale.youAreAdminOfRoom : locale.isAdminOfRoom}
                  >
                    <CrownIcon width={16} height={16} color={theme?.colors.yellow} />
                  </IconButton>
                )}
                {askeds.indexOf(item.id) !== -1 && (
                  <IconButton disabled title={locale.requestedTheFloor}>
                    <HandUpIcon width={16} height={16} color={theme?.colors.blue} />
                  </IconButton>
                )}
              </div>
            </div>
            <div className={s.actions}>
              <IconButton
                disabled={item.id === userId ? item.adminMuted : true}
                onClick={changeMutedWrapper(item)}
              >
                {item.muted || item.adminMuted ? (
                  <MicrophoneOffIcon
                    width={16}
                    height={16}
                    color={item.adminMuted ? theme?.colors.blue : theme?.colors.text}
                  />
                ) : (
                  <MicrophoneIcon width={16} height={16} color={theme?.colors.text} />
                )}
              </IconButton>
              {item.adminMuted && item.id === userId && !asked && (
                <IconButton onClick={askForTheFloorWrapper(item)} title={locale.askForTheFloor}>
                  <HandUpIcon width={20} height={20} color={theme?.colors.text} />
                </IconButton>
              )}
              {isOwner && item.id !== userId && (
                <IconButton
                  onClick={changeAdminMutedWrapper(item)}
                  title={item.adminMuted ? locale.unmute : locale.mute}
                >
                  {item.adminMuted ? (
                    <MicrophoneOffIcon width={16} height={16} color={theme?.colors.blue} />
                  ) : (
                    <MicrophoneIcon width={16} height={16} color={theme?.colors.blue} />
                  )}
                </IconButton>
              )}
            </div>
          </div>
        )
      )}
      {isOwner && banneds.length !== 0 && (
        <div className={s.users}>
          <div className={s.title}>{locale.banneds}</div>
          {banneds.map((item) => (
            <div key={`${item.id}-ban`} className={s.users__item}>
              <div className={s.users__name}>{item.name}</div>
              <div className={s.users__actions}>
                <IconButton onClick={unBanWrapper(item.id)}>
                  <CloseIcon width={16} height={16} color={theme?.colors.red} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;
