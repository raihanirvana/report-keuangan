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
  hideButton: {
    backgroundColor: 'rgba(255, 204, 213, 0.34)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hideButtonText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '800',
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
