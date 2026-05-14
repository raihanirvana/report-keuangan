import { StyleSheet } from 'react-native';

import { colors, typography } from '../../Theme';

const styles = StyleSheet.create({
  categoryDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  categoryItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  categoryLabel: {
    color: colors.slate600,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  center: {
    alignItems: 'center',
    height: 116,
    justifyContent: 'center',
    position: 'absolute',
    width: 116,
  },
  centerLabel: {
    color: colors.slate400,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  centerValue: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.slate400,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  ring: {
    alignItems: 'center',
    borderRadius: 86,
    height: 172,
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    width: 172,
  },
});

export default styles;
