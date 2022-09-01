import { useEffect, useState, useMemo } from 'react';
import { AlertProps } from './types';
import { ALERT_DEFAULT } from './utils/constants';
import { Colors, themes, Themes } from './Theme';
import { changeColors } from './Main.lib';
import storeTheme from './store/theme';
import storeLocale from './store/locale';
import { LocaleServer, MessageType } from './types/interfaces';
import { getLocalStorage, LocalStorageName, setLocalStorage } from './utils/localStorage';
import { CookieName, setCookie } from './utils/cookies';
import storeDialog from './store/alert';
import storeClickDocument, { changeClickDocument } from './store/clickDocument';
import WS from './core/ws';
import { log } from './utils/lib';

// eslint-disable-next-line import/prefer-default-export
export const useListeners = ({
  colors,
  port,
  server,
}: {
  port: number;
  server: string;
  colors?: Colors;
}) => {
  const ws = useMemo(() => new WS({ port, server }), [port, server]);
  const savedTheme = getLocalStorage(LocalStorageName.THEME);
  const [currentTheme, setCurrentTheme] = useState<keyof Themes>(savedTheme || 'light');
  const _themes = useMemo(() => changeColors({ colors, themes }), [colors]);
  const [theme, setTheme] = useState<Themes['dark' | 'light']>();
  const [alert, setAlert] = useState<AlertProps>(ALERT_DEFAULT);
  const [hallOpen, setHallOpen] = useState<boolean>(false);
  const [locale, setLocale] = useState<LocaleServer['client'] | null>(null);
  const openMenu = () => {
    setLocalStorage(LocalStorageName.HALL_OPEN, !hallOpen);
    setHallOpen(!hallOpen);
  };

  useEffect(() => {
    ws.onOpen = () => {
      ws.sendMessage({
        type: MessageType.GET_LOCALE,
        connId: '',
        id: 0,
        data: {
          locale: storeLocale.getState().locale,
        },
      });
    };
    ws.onMessage = (ev) => {
      const { data } = ev;
      const rawMessage = ws.parseMessage(data);
      if (!rawMessage) {
        return;
      }
      const { type } = rawMessage;
      switch (type) {
        case MessageType.SET_LOCALE:
          setLocale(ws.getMessage(MessageType.SET_LOCALE, rawMessage).data.locale);
          break;
        default:
      }
    };
    ws.onError = (e) => {
      log('error', 'Ws error on main', e);
    };
    ws.onClose = (e) => {
      log('warn', 'Ws close on main', e);
    };
    return () => {
      ws.onOpen = () => {
        /** */
      };
      ws.onMessage = () => {
        /** */
      };
      ws.onError = () => {
        /** */
      };
      ws.onClose = () => {
        /** */
      };
    };
  }, [ws]);

  /**
   * Set theme
   */
  useEffect(() => {
    setTheme(_themes[currentTheme]);
  }, [currentTheme, _themes]);

  /**
   * set hall open after page load
   */
  useEffect(() => {
    setHallOpen(getLocalStorage(LocalStorageName.HALL_OPEN) || false);
  }, []);

  /**
   * Change locale
   */
  useEffect(() => {
    const cleanSubs = storeLocale.subscribe(() => {
      const state = storeLocale.getState();
      setCookie(CookieName.lang, state.locale);
      ws.sendMessage({
        type: MessageType.GET_LOCALE,
        connId: '',
        id: 0,
        data: {
          locale: state.locale,
        },
      });
    });
    return () => {
      cleanSubs();
    };
  }, [ws]);

  /**
   * Alert listener
   */
  useEffect(() => {
    const cleanStore = storeDialog.subscribe(() => {
      const state = storeDialog.getState();
      setAlert(state.alert);
    });
    return () => {
      cleanStore();
    };
  }, []);

  /**
   * Click by document
   */
  useEffect(() => {
    const onClickDocument = (ev: MouseEvent) => {
      const { clientY, clientX } = ev;
      storeClickDocument.dispatch(
        changeClickDocument({
          clickDocument: {
            clientX,
            clientY,
          },
        })
      );
    };
    document.addEventListener('click', onClickDocument);
    return () => {
      document.removeEventListener('click', onClickDocument);
    };
  }, []);

  /**
   * Change theme
   */
  useEffect(() => {
    const cleanSubs = storeTheme.subscribe(() => {
      const { theme: _theme } = storeTheme.getState();
      setCurrentTheme(_theme);
    });
    return () => {
      cleanSubs();
    };
  }, []);

  return { locale, openMenu, theme, alert, hallOpen };
};
