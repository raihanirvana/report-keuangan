import { API_BASE_URL } from '../../Constants';

import type { ApiEnvelope, ApiErrorBody } from './api.types';

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

async function apiRequest<TData>(path: string, options: RequestOptions) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: getHeaders(options.token),
    method: options.method,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ApiEnvelope<TData>;
}

export {
  apiRequest,
};
