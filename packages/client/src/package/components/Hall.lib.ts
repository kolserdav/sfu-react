import { formatDuration, intervalToDuration } from 'date-fns';
import storeTheme, { changeTheme } from '../store/theme';
import { setLocalStorage, LocalStorageName } from '../utils/localStorage';
import { RecordCommand, MessageType } from '../types/interfaces';
import storeMessage, { changeMessage } from '../store/message';

// eslint-disable-next-line import/prefer-default-export
export const changeThemeHandler = () => {
  const { theme } = storeTheme.getState();
  storeTheme.dispatch(changeTheme({ theme }));
  setLocalStorage(LocalStorageName.THEME, theme === 'dark' ? 'light' : 'dark');
};

export const getTime = (time: number) => {
  const end = new Date().getTime();
  const start = end - time * 10000;
  const duration = intervalToDuration({
    start,
    end,
  });

  const { seconds, minutes, hours } = duration;

  return `${hours?.toString().length === 1 ? `0${hours}` : hours}:${
    minutes?.toString().length === 1 ? `0${minutes}` : minutes
  }:${seconds?.toString().length === 1 ? `0${seconds}` : seconds}`;
};

export const videoRecordWrapper =
  ({
    command,
    roomId,
    userId,
  }: {
    command: keyof typeof RecordCommand;
    roomId: string | number;
    userId: string | number;
  }) =>
  (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    storeMessage.dispatch(
      changeMessage<MessageType.GET_RECORD>({
        message: {
          type: 'room',
          value: {
            type: MessageType.GET_RECORD,
            connId: '',
            id: roomId,
            data: {
              command,
              userId,
            },
          },
        },
      })
    );
  };
