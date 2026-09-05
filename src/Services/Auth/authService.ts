import { apiRequest } from '../Api/apiClient';

import type {
  AuthTokenResponse,
  AuthUser,
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

function getMe(token: string) {
  return apiRequest<AuthUser>('/me', {
    method: 'GET',
    token,
  });
}

function updateName(token: string, name: string) {
  return apiRequest<AuthUser>('/me', {
    body: { name },
    method: 'PATCH',
    token,
  });
}

function logout(refreshToken: string) {
  return apiRequest<void>('/auth/logout', {
    body: { refreshToken },
    method: 'POST',
  });
}

export {
  getMe,
  login,
  logout,
  register,
  updateName,
};
