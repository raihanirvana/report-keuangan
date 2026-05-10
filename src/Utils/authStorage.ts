import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'kawaii-wallet.auth-token';
const DUMMY_AUTH_TOKEN = 'dummy-auth-token';

async function getAuthToken() {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

async function setAuthToken(token = DUMMY_AUTH_TOKEN) {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

async function clearAuthToken() {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export {
  clearAuthToken,
  DUMMY_AUTH_TOKEN,
  getAuthToken,
  setAuthToken,
};
