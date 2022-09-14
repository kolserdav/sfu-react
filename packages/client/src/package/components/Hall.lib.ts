import storeTheme, { changeTheme } from '../store/theme';
import { setLocalStorage, LocalStorageName } from '../utils/localStorage';

// eslint-disable-next-line import/prefer-default-export
export const changeThemeHandler = () => {
  const { theme } = storeTheme.getState();
  storeTheme.dispatch(changeTheme({ theme }));
  setLocalStorage(LocalStorageName.THEME, theme === 'dark' ? 'light' : 'dark');
};
