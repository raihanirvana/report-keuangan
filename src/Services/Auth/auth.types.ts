type AuthUser = {
  avatarUrl: null | string;
  email: string;
  id: string;
  name: string;
};

type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

export type {
  AuthTokenResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
};
