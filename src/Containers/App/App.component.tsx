import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  type Edge,
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { DashboardScreen, LoginScreen, SplashScreen } from '../../Screens';

import styles from './App.styles';

function getSafeAreaStyle(isSplashVisible: boolean, isLoggedIn: boolean) {
  return isSplashVisible || isLoggedIn
    ? styles.lightContainer
    : styles.whiteContainer;
}

const safeAreaEdges: Edge[] = ['top', 'bottom'];

function AppContent(props: {
  isLoggedIn: boolean;
  isSplashVisible: boolean;
  onLogin: () => void;
}) {
  if (props.isSplashVisible) {
    return <SplashScreen />;
  }

  if (!props.isLoggedIn) {
    return <LoginScreen onLogin={props.onLogin} />;
  }

  return <DashboardScreen />;
}

function App() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const safeAreaStyle = getSafeAreaStyle(isSplashVisible, isLoggedIn);

  useEffect(() => {
    const timer = setTimeout(() => setSplashVisible(false), 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={safeAreaEdges} style={safeAreaStyle}>
        <AppContent
          isLoggedIn={isLoggedIn}
          isSplashVisible={isSplashVisible}
          onLogin={() => setLoggedIn(true)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
