import { API_BASE_URL } from '../../Constants';

import type { ApiEnvelope, ApiErrorBody } from './api.types';

let sessionExpiredHandler: (() => void) | null = null;

type RequestOptions = {
  body?: object;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token?: string;
};

function getHeaders(token?: string) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
}

function getErrorMessage(body: ApiErrorBody) {
  if (body.error?.message) {
    return body.error.message;
  }

  if (Array.isArray(body.message)) {
    return body.message[0] ?? 'Request gagal.';
  }

  return body.message ?? 'Request gagal.';
}

async function parseError(response: Response) {
  try {
    return getErrorMessage((await response.json()) as ApiErrorBody);
  } catch {
    return 'Server belum bisa dihubungi.';
  }
}

function emitSessionExpired(response: Response, options: RequestOptions) {
  if (response.status === 401 && options.token) {
    sessionExpiredHandler?.();
  }
}

async function apiRequest<TData>(path: string, options: RequestOptions) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: getHeaders(options.token),
    method: options.method,
  });

  if (!response.ok) {
    emitSessionExpired(response, options);
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return {
      data: undefined as TData,
      error: null,
      meta: {},
    };
  }

  return (await response.json()) as ApiEnvelope<TData>;
}

function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

export {
  apiRequest,
  setSessionExpiredHandler,
};
