import { Colors, Themes } from './Theme';

// eslint-disable-next-line import/prefer-default-export
export const changeColors = ({
  colors,
  themes,
}: {
  colors: Colors | undefined;
  themes: Themes;
}) => {
  const _themes = { ...themes };
  if (colors) {
    _themes.dark.colors = colors.dark;
    _themes.light.colors = colors.light;
  }
  return _themes;
};
