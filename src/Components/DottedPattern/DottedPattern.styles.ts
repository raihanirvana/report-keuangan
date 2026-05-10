import { StyleSheet } from 'react-native';

import { colors } from '../../Theme';

const styles = StyleSheet.create({
  dot: {
    backgroundColor: colors.accentPink,
    borderRadius: 3,
    opacity: 0.78,
    position: 'absolute',
  },
  pattern: {
    ...StyleSheet.absoluteFill,
  },
});

export default styles;
