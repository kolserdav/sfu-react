/******************************************************************************************
 * Repository: https://github.com/kolserdav/werift-sfu-react.git
 * File name: Room.lib.ts
 * Author: Sergey Kolmiller
 * Email: <uyem.ru@gmail.com>
 * License: MIT
 * License text: See in LICENSE file
 * Copyright: kolserdav, All rights reserved (c)
 * Create Date: Wed Aug 24 2022 14:14:09 GMT+0700 (Krasnoyarsk Standard Time)
 ******************************************************************************************/
import storeAlert, { changeAlert } from '../store/alert';
import storeMuteForAll, { changeMuteForAll } from '../store/muteForAll';
import storeUserList, { changeUserList } from '../store/userList';
import { MessageType, SendMessageArgs } from '../types/interfaces';
import s from './Room.module.scss';
import c from './ui/CloseButton.module.scss';

export const getRoomLink = (roomId: number | string | null): string | null => {
  let res = null;
  const devUserId = `?uid=${new Date().getTime()}`;
  if (typeof window !== 'undefined' && roomId) {
    res = `${window.location.href.replace(/\?.*/, '')}${
      process.env.NODE_ENV !== 'production' ? devUserId : ''
    }`;
  }
  return res;
};

export const getWidthOfItem = ({
  lenght,
  container,
  coeff,
}: {
  lenght: number;
  container: HTMLDivElement;
  coeff: number;
}) => {
  let a = 0;
  let dims = {
    cols: 1,
    rows: 1,
  };

  const { offsetWidth: width, offsetHeight: height } = container;
  if (lenght) {
    const horizontal = width > height;
    switch (lenght) {
      case 2:
        dims = horizontal ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 };
        break;
      case 3:
        dims = horizontal ? { cols: 3, rows: 1 } : { cols: 1, rows: 3 };
        break;
      case 4:
        dims = { cols: 2, rows: 2 };
        break;
      case 5:
      case 6:
        dims = horizontal ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 };
        break;
      case 7:
      case 8:
      case 9:
        dims = horizontal ? { cols: 3, rows: 3 } : { cols: 2, rows: 4 };
        break;
      case 10:
        dims = horizontal ? { cols: 5, rows: 2 } : { cols: 2, rows: 5 };
        break;
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
        dims = horizontal ? { cols: 5, rows: 3 } : { cols: 3, rows: 5 };
        break;
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
        dims = horizontal ? { cols: 5, rows: 4 } : { cols: 4, rows: 5 };
        break;
      case 21:
      case 22:
      case 23:
      case 24:
        dims = horizontal ? { cols: 6, rows: 4 } : { cols: 4, rows: 6 };
        break;
      case 25:
      case 26:
      case 27:
      case 28:
        dims = horizontal ? { cols: 7, rows: 4 } : { cols: 4, rows: 7 };
        break;
      case 29:
      case 30:
      case 31:
      case 32:
        dims = horizontal ? { cols: 8, rows: 4 } : { cols: 4, rows: 8 };
        break;
      case 33:
      case 34:
      case 35:
      case 36:
        dims = horizontal ? { cols: 6, rows: 6 } : { cols: 4, rows: 9 };
        break;
      case 37:
      case 38:
      case 39:
      case 40:
        dims = horizontal ? { cols: 8, rows: 5 } : { cols: 4, rows: 10 };
        break;
      case 41:
      case 42:
      case 43:
      case 44:
      case 45:
        dims = horizontal ? { cols: 9, rows: 5 } : { cols: 5, rows: 9 };
        break;
      case 46:
      case 47:
      case 48:
      case 49:
      case 50:
        dims = horizontal ? { cols: 10, rows: 5 } : { cols: 5, rows: 10 };
        break;
      default:
      // TODO other counts
    }
    const w = width / dims.cols;
    const h = height / dims.rows;
    a = coeff < 1 ? h : w;
    a = a > width ? width : a;
    a = a > height ? height : a;
    a = a * dims.rows > height ? height / dims.rows : a;
    a = a * dims.cols > width ? width / dims.cols : a;
  }

  return {
    width: Math.floor(a),
    cols: dims.cols,
    rows: dims.rows,
  };
};

export const onClickVideo = (e: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { target }: { target: HTMLVideoElement } = e as any;
  const { videoWidth, videoHeight } = target;
  const { outerWidth } = window;
  const coeff = videoWidth / videoHeight;
  const height = outerWidth / coeff;
  target.parentElement?.classList.add(s.video__fixed);
  target.parentElement?.firstElementChild?.classList.add(c.open);
  target.setAttribute('data', 'full');
  target.setAttribute('width', outerWidth.toString());
  target.setAttribute('height', height.toString());
};

export const copyLink = (link: string, children: string) => {
  navigator.clipboard.writeText(link);
  storeAlert.dispatch(
    changeAlert({
      alert: {
        type: 'info',
        children,
        open: true,
      },
    })
  );
};

export const supportDisplayMedia = () =>
  typeof navigator.mediaDevices.getDisplayMedia !== 'undefined';

export const changeMuteList = ({
  data: { muteds: _muteds, adminMuteds: _adminMuteds, askeds },
}: SendMessageArgs<MessageType.SET_MUTE_LIST>) => {
  const {
    userList: { banneds },
  } = storeUserList.getState();
  storeUserList.dispatch(
    changeUserList({
      userList: {
        banneds,
        muteds: _muteds,
        adminMuteds: _adminMuteds,
        askeds,
      },
    })
  );
};

export const changeBanList = ({ data: { banneds } }: SendMessageArgs<MessageType.SET_BAN_LIST>) => {
  const {
    userList: { muteds: _muteds, adminMuteds: _adminMuteds, askeds },
  } = storeUserList.getState();
  storeUserList.dispatch(
    changeUserList({
      userList: {
        banneds,
        muteds: _muteds,
        adminMuteds: _adminMuteds,
        askeds,
      },
    })
  );
};

export const setMuteForAllHandler = ({
  data: { value },
}: SendMessageArgs<MessageType.SET_MUTE_FOR_ALL>) => {
  storeMuteForAll.dispatch(
    changeMuteForAll({
      type: MessageType.SET_MUTE_FOR_ALL,
      muteForAll: value,
    })
  );
};
