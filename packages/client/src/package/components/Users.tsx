import React from 'react';
import clsx from 'clsx';
import s from './Users.module.scss';
import { Theme } from '../Theme';
import { Locale } from '../types/interfaces';
import { GlobalProps } from '../types';
import {
  useActions,
  useMuteAll,
  useSortAdminMuted,
  useSortIsMe,
  useSortSpeaker,
  useUsers,
} from './Users.hooks';
import MicrophoneOffIcon from '../Icons/MicrophoneOffIcon';
import IconButton from './ui/IconButton';
import CloseIcon from '../Icons/Close';
import { checkIsRecord, isDev } from '../utils/lib';
import CrownIcon from '../Icons/Crown';
import MicrophoneIcon from '../Icons/MicrophoneIcon';
import HandUpIcon from '../Icons/HandUp';
import { useSpeaker } from '../utils/hooks';
import BullHornIcon from '../Icons/BullHorn';
import Checkbox from './ui/Checkbox';
import MessageOffIcon from '../Icons/MessageOff';
import Badge from './ui/Badge';
import AccountOutlineIcon from '../Icons/AccountOutline';

function Users({
  theme,
  locale,
  backLinks,
  userId,
  roomId,
  open,
}: {
  locale: Locale.Client;
  theme: Theme | undefined;
  userId: string | number;
  roomId: string | number;
  backLinks: GlobalProps['backLinks'];
  open: boolean;
}) {
  const {
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
  } = useUsers({
    userId,
    roomId,
  });
  const { changeMutedWrapper, changeAdminMutedWrapper, askForTheFloorWrapper } = useActions({
    userId,
  });

  const { speaker: _speaker } = useSpeaker({ muteds, adminMuteds, speaker });

  let _users = useSortAdminMuted({ users, adminMuteds });
  _users = useSortIsMe({ users: _users, userId });
  _users = useSortSpeaker({ users: _users, speaker: _speaker });
  const { muteAllHandler, changeMuteForAllHandler, muteForAll } = useMuteAll({
    users,
    adminMuteds,
  });
  return (
    <div
      className={clsx(s.wrapper, open ? s.open : '')}
      style={{ color: theme?.colors.text, backgroundColor: theme?.colors.paper }}
    >
      {backLinks && <div className={s.back__links}>{backLinks}</div>}
      <div className={s.title}>{locale.guests}</div>
      <div className={s.users__actions}>
        <div className={s.icons}>
          {theme && (
            <Badge title={locale.numberOfGuests} value={users.length} theme={theme}>
              <IconButton title={locale.numberOfGuests} disabled>
                <AccountOutlineIcon color={theme.colors.text} />
              </IconButton>
            </Badge>
          )}
        </div>
        <div className={s.buttons}>
          {isOwner && (
            <IconButton onClick={muteAllHandler} title={locale.muteAll}>
              <MicrophoneOffIcon color={theme?.colors.blue} width={24} height={24} />
            </IconButton>
          )}
          {isOwner && (
            <Checkbox checked={muteForAll} onChange={changeMuteForAllHandler}>
              {locale.muteForNew}
            </Checkbox>
          )}
        </div>
      </div>
      {_users.map((item) =>
        checkIsRecord(item.id.toString()) ? (
          ''
        ) : (
          <div key={item.id} className={s.users__item}>
            <div className={s.user}>
              <span
                className={s.name}
                style={userId === item.id ? { color: theme?.colors.cyan } : {}}
              >
                {isDev() ? `${item.name}-${item.id}` : item.name}
              </span>
              <div className={s.icons}>
                {_speaker === item.id && (
                  <IconButton disabled>
                    <BullHornIcon color={theme?.colors.green} width={16} height={16} />
                  </IconButton>
                )}
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
                    <HandUpIcon width={20} height={20} color={theme?.colors.red} />
                  </IconButton>
                )}
                {item.adminMuted && !isOwner && (
                  <IconButton disabled>
                    <MicrophoneOffIcon width={16} height={16} color={theme?.colors.blue} />
                  </IconButton>
                )}
              </div>
            </div>
            <div className={s.actions}>
              <IconButton disabled={item.id !== userId} onClick={changeMutedWrapper(item)}>
                {item.muted ? (
                  <MicrophoneOffIcon width={16} height={16} color={theme?.colors.text} />
                ) : (
                  <MicrophoneIcon width={16} height={16} color={theme?.colors.text} />
                )}
              </IconButton>
              {item.adminMuted && item.id === userId && !asked && (
                <IconButton onClick={askForTheFloorWrapper(item)} title={locale.askForTheFloor}>
                  <HandUpIcon width={20} height={20} color={theme?.colors.text} />
                </IconButton>
              )}
              {isOwner && chatBlockeds.indexOf(item.id) !== -1 && (
                <IconButton title={locale.unblockChat} onClick={unblockChatWrapper(item.id)}>
                  <MessageOffIcon width={16} height={16} color={theme?.colors.text} />
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
