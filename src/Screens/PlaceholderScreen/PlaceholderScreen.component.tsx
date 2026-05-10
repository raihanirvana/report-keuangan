import { Text, View } from 'react-native';

import styles from './PlaceholderScreen.styles';

type PlaceholderScreenProps = {
  title: string;
};

function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>✦</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>Halaman ini siap diisi berikutnya.</Text>
      </View>
    </View>
  );
}

export default PlaceholderScreen;
