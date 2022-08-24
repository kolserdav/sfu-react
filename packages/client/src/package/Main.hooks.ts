import { useEffect, useState, useMemo } from 'react';
import { AlertProps } from './types';
import { ALERT_DEFAULT } from './utils/constants';
import { Colors, themes, Themes } from './Theme';
import { changeColors } from './Main.lib';
import { getLocale } from './utils/lib';
import storeTheme from './store/theme';
import storeLocale from './store/locale';
import { LocaleClient } from './types/interfaces';
import { getLocalStorage, LocalStorageName, setLocalStorage } from './utils/localStorage';
import { CookieName, getCookie, setCookie } from './utils/cookies';
import storeDialog from './store/alert';
import storeClickDocument, { changeClickDocument } from './store/clickDocument';

// eslint-disable-next-line import/prefer-default-export
export const useListeners = ({ colors }: { colors?: Colors }) => {
  const savedTheme = getLocalStorage(LocalStorageName.THEME);
  const [currentTheme, setCurrentTheme] = useState<keyof Themes>(savedTheme || 'light');
  const _themes = useMemo(() => changeColors({ colors, themes }), [colors]);
  const [theme, setTheme] = useState<Themes['dark' | 'light']>(_themes[savedTheme || 'light']);
  const [alert, setAlert] = useState<AlertProps>(ALERT_DEFAULT);
  const [hallOpen, setHallOpen] = useState<boolean>(
    getLocalStorage(LocalStorageName.HALL_OPEN) || false
  );
  const [locale, setLocale] = useState<LocaleClient | null>(null);

  const openMenu = () => {
    setLocalStorage(LocalStorageName.HALL_OPEN, !hallOpen);
    setHallOpen(!hallOpen);
  };

  /**
   * Set theme
   */
  useEffect(() => {
    setTheme(_themes[currentTheme]);
  }, [currentTheme, _themes]);

  /**
   * Change locale
   */
  useEffect(() => {
    // TODO change to saved locale
    let _locale = getLocale(getCookie(CookieName.lang) || storeLocale.getState().locale);
    setLocale(_locale);
    storeLocale.subscribe(() => {
      const state = storeLocale.getState();
      _locale = getLocale(state.locale);
      setCookie(CookieName.lang, state.locale);
      setLocale(_locale);
    });
  }, []);

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
