import { StyleSheet } from 'react-native';

import { colors, typography } from '../../Theme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    maxWidth: 448,
    paddingHorizontal: 24,
    position: 'absolute',
    top: '37%',
    width: '100%',
  },
  logo: {
    height: 178,
    resizeMode: 'contain',
    width: 178,
  },
  logoCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    height: 256,
    justifyContent: 'center',
    marginBottom: 28,
    opacity: 0.86,
    width: 256,
  },
  sparkle: {
    fontSize: 38,
    fontWeight: '700',
    opacity: 0.55,
    position: 'absolute',
  },
  sparkleHeart: {
    color: colors.accentPurple,
    left: '13%',
    top: '48%',
    transform: [{ rotate: '-8deg' }],
  },
  sparkleLayer: {
    ...StyleSheet.absoluteFill,
  },
  sparkleLine: {
    color: colors.accentPink,
    right: '25%',
    top: '47%',
    transform: [{ rotate: '-8deg' }],
  },
  sparkleStar: {
    color: colors.accentBlue,
    left: '24%',
    top: '44%',
    transform: [{ rotate: '-14deg' }],
  },
  subtitle: {
    color: colors.slate600,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
    maxWidth: 320,
    opacity: 0.8,
    textAlign: 'center',
  },
  title: {
    color: colors.slate900,
    fontFamily: typography.fontFamily,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 43,
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default styles;
