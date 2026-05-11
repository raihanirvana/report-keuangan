import { useEffect } from 'react';
import {
  Text,
  View,
} from 'react-native';

import styles from './Snackbar.styles';

const SNACKBAR_DURATION = 2600;

type SnackbarProps = {
  message: string;
  onHide: () => void;
};

function Snackbar({ message, onHide }: SnackbarProps) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = setTimeout(onHide, SNACKBAR_DURATION);

    return () => clearTimeout(timeoutId);
  }, [message, onHide]);

  if (!message) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export default Snackbar;
