import { StyleSheet } from 'react-native';

import { colors, typography } from '../../Theme';

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(238, 43, 108, 0.08)',
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 360,
    padding: 28,
    width: '100%',
  },
  container: {
    backgroundColor: colors.backgroundLight,
    flex: 1,
    padding: 24,
    paddingBottom: 110,
  },
  icon: {
    color: colors.primary,
    fontSize: 44,
    marginBottom: 16,
  },
  text: {
    color: colors.slate600,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    color: colors.slate900,
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
});

export default styles;
