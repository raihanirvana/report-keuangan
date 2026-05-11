import { StyleSheet } from 'react-native';

import { colors, typography } from '../../Theme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: 'rgba(238, 43, 108, 0.2)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    left: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    right: 24,
    shadowColor: colors.primary,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    top: -70,
    zIndex: 20,
  },
  icon: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  text: {
    color: colors.slate900,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
});

export default styles;
