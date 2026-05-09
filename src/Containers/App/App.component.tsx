import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreen } from '../../Screens';

import styles from './App.styles';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <SplashScreen />
      </View>
    </SafeAreaProvider>
  );
}

export default App;
