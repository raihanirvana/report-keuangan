import { apiRequest } from '../Api/apiClient';

import type {
  AuthTokenResponse,
  LoginPayload,
  RegisterPayload,
} from './auth.types';

function login(payload: LoginPayload) {
  return apiRequest<AuthTokenResponse>('/auth/login', {
    body: payload,
    method: 'POST',
  });
}

function register(payload: RegisterPayload) {
  return apiRequest<AuthTokenResponse>('/auth/register', {
    body: payload,
    method: 'POST',
  });
}

export {
  login,
  register,
};
