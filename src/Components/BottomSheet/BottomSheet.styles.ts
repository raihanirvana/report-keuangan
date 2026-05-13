import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  loadingSpinner: {
    color: '#EE2B6C',
  },
  loadingText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
  },
  scrim: {
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default styles;
