/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Users.tsx
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Nov 23 2022 15:23:26 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import React, { useMemo } from 'react';
import clsx from 'clsx';
import s from './Users.module.scss';
import g from '../Global.module.scss';
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
  useSettings,
  useVolume,
} from './Users.hooks';
import MicrophoneOffIcon from '../Icons/MicrophoneOffIcon';
import IconButton from './ui/IconButton';
import CloseIcon from '../Icons/Close';
import { isDev } from '../utils/lib';
import CrownIcon from '../Icons/Crown';
import MicrophoneIcon from '../Icons/MicrophoneIcon';
import HandUpIcon from '../Icons/HandUp';
import { useSpeaker } from '../utils/hooks';
import BullHornIcon from '../Icons/BullHorn';
import Checkbox from './ui/Checkbox';
import MessageOffIcon from '../Icons/MessageOff';
import Badge from './ui/Badge';
import AccountOutlineIcon from '../Icons/AccountOutline';
import { ROOM_LENGTH_TEST, USERS_ICON_WIDTH, USERS_ICON_WIDTH_BIG } from '../utils/constants';
import Dialog from './ui/Dialog';
import Volume from './ui/Volume';

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
  _users = useMemo(
    () =>
      ROOM_LENGTH_TEST
        ? new Array(ROOM_LENGTH_TEST)
            .fill(0)
            .map(() => _users[0])
            .filter((item) => item !== undefined)
        : _users,
    [_users]
  );
  const { muteAllHandler, changeMuteForAllHandler, muteForAll } = useMuteAll({
    users,
    adminMuteds,
  });

  const { dialogSettings, clickToBanWrapper, onContextMenuWrapper, clickToSetAdminWrapper } =
    useSettings({ isOwner });
  const { dialogVolume, changeVolumeWrapper, clickToVolume, volumes, volumeUserId } = useVolume({
    roomId,
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
      {_users.map((item) => (
        <div
          key={item.id}
          className={s.users__item}
          onContextMenu={
            item.id !== userId
              ? onContextMenuWrapper({
                  unitId: item.id.toString(),
                  isOwner: item.isOwner,
                })
              : undefined
          }
        >
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
                  <BullHornIcon
                    color={theme?.colors.green}
                    width={USERS_ICON_WIDTH}
                    height={USERS_ICON_WIDTH}
                  />
                </IconButton>
              )}
              {item.isOwner && (
                <IconButton
                  disabled
                  title={isOwner ? locale.youAreAdminOfRoom : locale.isAdminOfRoom}
                >
                  <CrownIcon
                    width={USERS_ICON_WIDTH}
                    height={USERS_ICON_WIDTH}
                    color={theme?.colors.yellow}
                  />
                </IconButton>
              )}
              {askeds.indexOf(item.id) !== -1 && (
                <IconButton disabled title={locale.requestedTheFloor}>
                  <HandUpIcon
                    width={USERS_ICON_WIDTH_BIG}
                    height={USERS_ICON_WIDTH_BIG}
                    color={theme?.colors.red}
                  />
                </IconButton>
              )}
              {item.adminMuted && !isOwner && (
                <IconButton disabled>
                  <MicrophoneOffIcon
                    width={USERS_ICON_WIDTH}
                    height={USERS_ICON_WIDTH}
                    color={theme?.colors.blue}
                  />
                </IconButton>
              )}
            </div>
          </div>
          <div className={s.actions}>
            <div className={s.button__procent}>
              {item.id !== userId && (
                <div className={s.text}>
                  {volumes[item.id] && volumes[item.id] !== 100 ? `${volumes[item.id]}%` : ''}
                </div>
              )}
              <IconButton
                disabled={item.id !== userId && item.muted}
                onClick={
                  item.id === userId
                    ? changeMutedWrapper(item)
                    : clickToVolume({ target: item.id, isOwner: item.isOwner })
                }
              >
                {item.muted ? (
                  <MicrophoneOffIcon
                    width={USERS_ICON_WIDTH}
                    height={USERS_ICON_WIDTH}
                    color={theme?.colors.text}
                  />
                ) : (
                  <MicrophoneIcon
                    width={USERS_ICON_WIDTH}
                    height={USERS_ICON_WIDTH}
                    color={theme?.colors.text}
                  />
                )}
              </IconButton>
            </div>
            {item.adminMuted && item.id === userId && !asked && !item.isOwner && (
              <IconButton onClick={askForTheFloorWrapper(item)} title={locale.askForTheFloor}>
                <HandUpIcon
                  width={USERS_ICON_WIDTH_BIG}
                  height={USERS_ICON_WIDTH_BIG}
                  color={theme?.colors.text}
                />
              </IconButton>
            )}
            {isOwner && chatBlockeds.indexOf(item.id) !== -1 && (
              <IconButton title={locale.unblockChat} onClick={unblockChatWrapper(item.id)}>
                <MessageOffIcon
                  width={USERS_ICON_WIDTH}
                  height={USERS_ICON_WIDTH}
                  color={theme?.colors.text}
                />
              </IconButton>
            )}
            {isOwner && (item.id !== userId || item.adminMuted) && (
              <IconButton
                onClick={changeAdminMutedWrapper(item)}
                title={item.adminMuted ? locale.unmute : locale.mute}
              >
                {item.adminMuted ? (
                  <MicrophoneOffIcon
                    width={USERS_ICON_WIDTH}
                    height={USERS_ICON_WIDTH}
                    color={theme?.colors.blue}
                  />
                ) : (
                  <MicrophoneIcon
                    width={USERS_ICON_WIDTH}
                    height={USERS_ICON_WIDTH}
                    color={theme?.colors.blue}
                  />
                )}
              </IconButton>
            )}
          </div>
        </div>
      ))}
      {isOwner && banneds.length !== 0 && (
        <div className={s.users}>
          <div className={s.title}>{locale.banneds}</div>
          {banneds.map((item) => (
            <div key={`${item.id}-ban`} className={s.users__item}>
              <div className={s.users__name}>{item.name}</div>
              <div className={s.users__actions}>
                {chatBlockeds.indexOf(item.id) !== -1 && (
                  <IconButton title={locale.unblockChat} onClick={unblockChatWrapper(item.id)}>
                    <MessageOffIcon
                      width={USERS_ICON_WIDTH}
                      height={USERS_ICON_WIDTH}
                      color={theme?.colors.text}
                    />
                  </IconButton>
                )}
                <IconButton onClick={unBanWrapper(item.id)}>
                  <CloseIcon
                    width={USERS_ICON_WIDTH}
                    height={USERS_ICON_WIDTH}
                    color={theme?.colors.red}
                  />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog {...dialogSettings} theme={theme}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          tabIndex={-1}
          role="button"
          onClick={clickToBanWrapper(dialogSettings.context)}
          className={g.dialog__item}
        >
          {locale.ban}
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
        <div
          tabIndex={-2}
          role="button"
          onClick={clickToSetAdminWrapper(dialogSettings.context)}
          className={g.dialog__item}
        >
          {dialogSettings.context.isOwner ? locale.deleteFromAdmins : locale.setAsAdmin}
        </div>
      </Dialog>
      <Dialog {...dialogVolume} theme={theme}>
        <Volume onChange={changeVolumeWrapper(volumeUserId)} value={volumes[volumeUserId] || 100} />
      </Dialog>
    </div>
  );
}

export default Users;
