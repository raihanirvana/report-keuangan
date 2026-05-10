import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import {
  type Edge,
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { DashboardScreen, LoginScreen, SplashScreen } from '../../Screens';
import { getMe, type AuthUser } from '../../Services';
import {
  clearAuthToken,
  getAuthToken,
  getAuthUser,
} from '../../Utils/authStorage';

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
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  user: AuthUser | null;
};

type AuthSetters = {
  setLoggedIn: (value: boolean) => void;
  setSplashVisible: (value: boolean) => void;
  setUser: (value: AuthUser | null) => void;
};

function AppContent(props: AppContentProps) {
  if (props.isSplashVisible) {
    return <SplashScreen />;
  }

  if (!props.isLoggedIn) {
    return <LoginScreen onLogin={props.onLogin} />;
  }

  return <DashboardScreen onLogout={props.onLogout} user={props.user} />;
}

async function getBootstrapUser(token: string, storedUser: AuthUser | null) {
  if (storedUser) {
    return storedUser;
  }

  const response = await getMe(token);

  return response.data;
}

function applyLoggedOutState(setters: AuthSetters) {
  setters.setLoggedIn(false);
  setters.setSplashVisible(false);
  setters.setUser(null);
}

function applyLoggedInState(user: AuthUser, setters: AuthSetters) {
  setters.setUser(user);
  setters.setLoggedIn(true);
}

async function applyInvalidTokenState(setters: AuthSetters) {
  await clearAuthToken();
  applyLoggedOutState(setters);
}

async function updateAuthState(
  token: string | null,
  isMounted: boolean,
  storedUser: AuthUser | null,
  setters: AuthSetters,
) {
  if (!isMounted) {
    return;
  }

  if (!token) {
    applyLoggedOutState(setters);

    return;
  }

  try {
    const user = await getBootstrapUser(token, storedUser);
    applyLoggedInState(user, setters);
  } catch {
    await applyInvalidTokenState(setters);
  } finally {
    setters.setSplashVisible(false);
  }
}

function useAuthBootstrapEffect(setters: AuthSetters) {
  useEffect(() => {
    let isMounted = true;
    const checkAuthToken = async () => {
      const [token, storedUser] = await Promise.all([
        getAuthToken(),
        getAuthUser(),
      ]);
      await updateAuthState(
        token,
        isMounted,
        storedUser,
        setters,
      );
    };
    const timer = setTimeout(checkAuthToken, 1800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);
}

function useAuthBootstrap() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const setters = { setLoggedIn, setSplashVisible, setUser };

  useAuthBootstrapEffect(setters);

  return {
    isLoggedIn,
    isSplashVisible,
    setLoggedIn,
    setUser,
    user,
  };
}

type AuthBootstrap = ReturnType<typeof useAuthBootstrap>;

function createLogoutHandler(auth: AuthBootstrap) {
  return async () => {
    await clearAuthToken();
    auth.setLoggedIn(false);
    auth.setUser(null);
  };
}

function createLoginHandler(auth: AuthBootstrap) {
  return (user: AuthUser) => {
    auth.setUser(user);
    auth.setLoggedIn(true);
  };
}

function AppShell({ auth }: { auth: AuthBootstrap }) {
  const safeAreaStyle = getSafeAreaStyle(
    auth.isSplashVisible,
    auth.isLoggedIn,
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={safeAreaEdges} style={safeAreaStyle}>
        <AppContent
          isLoggedIn={auth.isLoggedIn}
          isSplashVisible={auth.isSplashVisible}
          onLogin={createLoginHandler(auth)}
          onLogout={createLogoutHandler(auth)}
          user={auth.user}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function App() {
  const auth = useAuthBootstrap();

  return <AppShell auth={auth} />;
}

export default App;
