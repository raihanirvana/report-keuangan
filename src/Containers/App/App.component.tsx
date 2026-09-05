import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {
  type Edge,
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { DashboardScreen, LoginScreen, SplashScreen } from '../../Screens';
import {
  getMe,
  logout,
  setSessionExpiredHandler,
  updateName,
  type AuthUser,
} from '../../Services';
import {
  clearAuthToken,
  getAuthToken,
  getAuthUser,
  getRefreshToken,
  setAuthUser,
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
  onLogout: () => Promise<void>;
  onUpdateName: (name: string) => Promise<void>;
  user: AuthUser | null;
};

type SessionExpiredModalProps = {
  onConfirm: () => void;
  visible: boolean;
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

  return (
    <DashboardScreen
      onLogout={props.onLogout}
      onUpdateName={props.onUpdateName}
      user={props.user}
    />
  );
}

function SessionExpiredModal(props: SessionExpiredModalProps) {
  return (
    <Modal transparent visible={props.visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Sesi sudah habis</Text>
          <Text style={styles.modalText}>
            Silakan masuk lagi supaya data keuanganmu tetap aman.
          </Text>
          <Pressable onPress={props.onConfirm} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Login Ulang</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
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

function useSessionExpiredHandler(auth: AuthBootstrap) {
  const [isSessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setSessionExpiredHandler(() => setSessionExpired(true));

    return () => setSessionExpiredHandler(null);
  }, []);

  return {
    isSessionExpired,
    onConfirmSessionExpired: createSessionExpiredConfirm(auth, setSessionExpired),
  };
}

function createSessionExpiredConfirm(
  auth: AuthBootstrap,
  setSessionExpired: (value: boolean) => void,
) {
  return async () => {
    await clearAuthToken();
    setSessionExpired(false);
    auth.setLoggedIn(false);
    auth.setUser(null);
  };
}

function createLogoutHandler(auth: AuthBootstrap) {
  return async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await logout(refreshToken);
    }
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

function createUpdateNameHandler(auth: AuthBootstrap) {
  return async (name: string) => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Sesi sudah habis. Silakan login ulang.');
    }
    const response = await updateName(token, name);
    await setAuthUser(response.data);
    auth.setUser(response.data);
  };
}

function AppSafeContent(props: {
  auth: AuthBootstrap;
  safeAreaStyle: ReturnType<typeof getSafeAreaStyle>;
}) {
  return (
    <SafeAreaView edges={safeAreaEdges} style={props.safeAreaStyle}>
      <AppContent
        isLoggedIn={props.auth.isLoggedIn}
        isSplashVisible={props.auth.isSplashVisible}
        onLogin={createLoginHandler(props.auth)}
        onLogout={createLogoutHandler(props.auth)}
        onUpdateName={createUpdateNameHandler(props.auth)}
        user={props.auth.user}
      />
    </SafeAreaView>
  );
}

function AppShell({ auth }: { auth: AuthBootstrap }) {
  const session = useSessionExpiredHandler(auth);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppSafeContent
        auth={auth}
        safeAreaStyle={getSafeAreaStyle(auth.isSplashVisible, auth.isLoggedIn)}
      />
      <SessionExpiredModal
        onConfirm={session.onConfirmSessionExpired}
        visible={session.isSessionExpired}
      />
    </SafeAreaProvider>
  );
}

function App() {
  const auth = useAuthBootstrap();

  return <AppShell auth={auth} />;
}

export default App;
