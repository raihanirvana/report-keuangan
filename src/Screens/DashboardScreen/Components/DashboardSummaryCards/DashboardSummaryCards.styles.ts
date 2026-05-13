import { StyleSheet } from 'react-native';

import { colors, typography } from '../../../../Theme';

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderColor: 'rgba(238, 43, 108, 0.05)',
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    padding: 24,
    shadowColor: colors.slate900,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 28,
    paddingHorizontal: 24,
  },
  icon: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  label: {
    color: colors.slate600,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  period: {
    color: colors.slate400,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    marginTop: -8,
  },
  value: {
    color: colors.slate900,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default styles;
