import React from 'react';
import clsx from 'clsx';
import s from './Users.module.scss';
import { Theme } from '../Theme';
import { Locale } from '../types/interfaces';
import { GlobalProps } from '../types';
import { useUsers } from './Users.hooks';
import MicrophoneOffIcon from '../Icons/MicrophoneOffIcon';
import IconButton from './ui/IconButton';
import CloseIcon from '../Icons/Close';
import { checkIsRecord } from '../utils/lib';

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
  const { users, isOwner, banneds, unBanWrapper } = useUsers({ userId, roomId });

  return (
    <div
      className={clsx(s.users, openUserList ? s.open : '')}
      style={{ color: theme?.colors.text, backgroundColor: theme?.colors.paper }}
    >
      {backLinks && <div className={s.users}>{backLinks}</div>}
      <div className={s.title}>{locale.guests}</div>
      {users.map((item) =>
        checkIsRecord(item.id.toString()) ? (
          ''
        ) : (
          <div key={item.id} className={s.users__item}>
            <div className={s.user__name}>{item.name}</div>
            <div className={s.user__actions}>
              {(item.muted || item.adminMuted) && (
                <MicrophoneOffIcon
                  width={16}
                  height={16}
                  color={
                    !item.adminMuted
                      ? theme?.colors.text
                      : isOwner
                      ? theme?.colors.blue
                      : theme?.colors.text
                  }
                />
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
