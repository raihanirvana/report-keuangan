import colors from './colors';
import typography from './typography';

const theme = {
  colors,
  typography,
} as const;

export { colors, typography };
export default theme;
