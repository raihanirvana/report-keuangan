import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'kawaii-wallet.auth-token';
const REFRESH_TOKEN_KEY = 'kawaii-wallet.refresh-token';

async function getAuthToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

async function setAuthToken(token: string) {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

async function setAuthTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

async function clearAuthToken() {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
  ]);
}

export {
  clearAuthToken,
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setAuthTokens,
};
