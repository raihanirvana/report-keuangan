import { StyleSheet } from 'react-native';

import { colors, typography } from '../../Theme';

const styles = StyleSheet.create({
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  colorSwatch: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: 'rgba(255, 204, 213, 0.5)',
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    width: 48,
  },
  colorSwatchActive: {
    borderColor: colors.primary,
    borderWidth: 4,
    shadowColor: colors.slate900,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    transform: [{ scale: 1.12 }],
  },
  colorSwatchCheck: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
  colorSwatchCheckBadge: {
    alignItems: 'center',
    backgroundColor: colors.slate900,
    borderColor: colors.white,
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: -4,
    top: -5,
    width: 18,
  },
  colorSwatchInner: {
    borderRadius: 17,
    height: 34,
    width: 34,
  },
  field: {
    gap: 12,
  },
  form: {
    gap: 24,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 213, 0.12)',
    borderColor: 'rgba(255, 204, 213, 0.28)',
    borderRadius: 18,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  iconOptionActive: {
    backgroundColor: 'rgba(238, 43, 108, 0.12)',
    borderColor: colors.primary,
  },
  iconSymbol: {
    color: colors.slate900,
    fontSize: 30,
    fontWeight: '800',
  },
  input: {
    borderColor: 'rgba(255, 204, 213, 0.34)',
    borderRadius: 16,
    borderWidth: 1,
    color: colors.slate900,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    color: colors.slate600,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.slate900,
    borderRadius: 24,
    marginTop: 4,
    paddingVertical: 18,
    shadowColor: colors.slate900,
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default styles;
