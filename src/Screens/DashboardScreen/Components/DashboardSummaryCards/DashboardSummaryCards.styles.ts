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
  cardMain: {
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  dropdownArea: {
    width: '100%',
  },
  dropdownButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 245, 247, 0.78)',
    borderColor: 'rgba(255, 204, 213, 0.34)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownIcon: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  dropdownOption: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  dropdownOptionActive: {
    backgroundColor: 'rgba(238, 43, 108, 0.1)',
  },
  dropdownOptions: {
    backgroundColor: colors.white,
    borderColor: 'rgba(255, 204, 213, 0.34)',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 6,
    maxHeight: 176,
    padding: 6,
    width: '100%',
  },
  dropdownOptionsContent: {
    gap: 2,
  },
  dropdownOptionText: {
    color: colors.slate600,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  dropdownOptionTextActive: {
    color: colors.primary,
  },
  dropdownText: {
    color: colors.slate600,
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    gap: 18,
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
  loadingSpinner: {
    color: colors.primary,
  },
  loadingState: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 58,
  },
  loadingText: {
    color: colors.slate400,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
  },
  period: {
    color: colors.slate400,
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    marginTop: -8,
  },
  section: {
    gap: 14,
    marginTop: 28,
  },
  value: {
    color: colors.slate900,
    fontFamily: typography.fontFamily,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
});

export default styles;
