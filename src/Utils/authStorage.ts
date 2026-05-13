import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthUser } from '../Services';

const AUTH_TOKEN_KEY = 'kawaii-wallet.auth-token';
const REFRESH_TOKEN_KEY = 'kawaii-wallet.refresh-token';
const AUTH_USER_KEY = 'kawaii-wallet.auth-user';

async function getAuthToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

async function getAuthUser() {
  const user = await AsyncStorage.getItem(AUTH_USER_KEY);

  return user ? (JSON.parse(user) as AuthUser) : null;
}

async function setAuthToken(token: string) {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

async function setAuthUser(user: AuthUser) {
  await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

async function setAuthTokens(
  accessToken: string,
  refreshToken: string,
  user: AuthUser,
) {
  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
  ]);
}

async function clearAuthToken() {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(AUTH_USER_KEY),
  ]);
}

export {
  clearAuthToken,
  getAuthToken,
  getAuthUser,
  getRefreshToken,
  setAuthToken,
  setAuthTokens,
  setAuthUser,
};
