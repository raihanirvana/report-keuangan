import { StyleSheet } from 'react-native';

import { colors, typography } from '../../Theme';

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.backgroundLight,
    borderRadius: 34,
    borderWidth: 4,
    height: 68,
    justifyContent: 'center',
    marginTop: -34,
    shadowColor: colors.primary,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.36,
    shadowRadius: 14,
    width: 68,
  },
  addIcon: {
    color: colors.white,
    fontSize: 38,
    lineHeight: 42,
  },
  icon: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
  },
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: 'rgba(238, 43, 108, 0.1)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    height: 86,
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    position: 'absolute',
  },
});

export default styles;
