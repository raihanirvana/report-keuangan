import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  type Edge,
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { DashboardScreen, LoginScreen, SplashScreen } from '../../Screens';
import { clearAuthToken, getAuthToken } from '../../Utils/authStorage';

import styles from './App.styles';

function getSafeAreaStyle(isSplashVisible: boolean, isLoggedIn: boolean) {
  return isSplashVisible || isLoggedIn
    ? styles.lightContainer
    : styles.whiteContainer;
}

const safeAreaEdges: Edge[] = ['top', 'bottom'];

type AppContentProps = {
  isLoggedIn: boolean;
  isSplashVisible: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

function AppContent(props: AppContentProps) {
  if (props.isSplashVisible) {
    return <SplashScreen />;
  }

  if (!props.isLoggedIn) {
    return <LoginScreen onLogin={props.onLogin} />;
  }

  return <DashboardScreen onLogout={props.onLogout} />;
}

function updateAuthState(
  token: string | null,
  isMounted: boolean,
  setLoggedIn: (value: boolean) => void,
  setSplashVisible: (value: boolean) => void,
) {
  if (isMounted) {
    setLoggedIn(!!token);
    setSplashVisible(false);
  }
}

function useAuthBootstrap() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuthToken = async () => {
      const token = await getAuthToken();
      updateAuthState(token, isMounted, setLoggedIn, setSplashVisible);
    };
    const timer = setTimeout(checkAuthToken, 1800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  return {
    isLoggedIn,
    isSplashVisible,
    setLoggedIn,
  };
}

function App() {
  const auth = useAuthBootstrap();
  const safeAreaStyle = getSafeAreaStyle(
    auth.isSplashVisible,
    auth.isLoggedIn,
  );
  const handleLogout = async () => {
    await clearAuthToken();
    auth.setLoggedIn(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={safeAreaEdges} style={safeAreaStyle}>
        <AppContent
          isLoggedIn={auth.isLoggedIn}
          isSplashVisible={auth.isSplashVisible}
          onLogin={() => auth.setLoggedIn(true)}
          onLogout={handleLogout}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
