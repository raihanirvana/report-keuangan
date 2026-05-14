import { StyleSheet } from 'react-native';

import { colors, typography } from '../../../../Theme';

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(238, 43, 108, 0.05)',
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    shadowColor: colors.slate900,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
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
  loadingSpinner: {
    color: colors.primary,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 236,
    width: '100%',
  },
  loadingText: {
    color: colors.slate400,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
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
  section: {
    marginTop: 28,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionLink: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionLinkDisabled: {
    color: colors.slate400,
  },
  sectionTitle: {
    color: colors.slate900,
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '800',
  },
});

export default styles;
