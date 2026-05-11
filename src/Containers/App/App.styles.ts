import { StyleSheet } from 'react-native';

import { colors, typography } from '../../Theme';

const styles = StyleSheet.create({
  lightContainer: {
    backgroundColor: colors.backgroundLight,
    flex: 1,
  },
  whiteContainer: {
    backgroundColor: colors.white,
    flex: 1,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalButtonText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderColor: 'rgba(255, 204, 213, 0.55)',
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    width: '100%',
  },
  modalText: {
    color: colors.slate600,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTitle: {
    color: colors.slate900,
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default styles;
