import { Platform } from 'react-native';

const API_HOST = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

const API_BASE_URL = `${API_HOST}/v1`;

export {
  API_BASE_URL,
};
