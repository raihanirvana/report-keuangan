import { apiRequest } from '../Api/apiClient';

import type {
  CreatePeriodPayload,
  PayrollPeriod,
  UpdatePeriodPayload,
} from './periods.types';

function getPeriods(token: string) {
  return apiRequest<PayrollPeriod[]>('/periods', {
    method: 'GET',
    token,
  });
}

function createPeriod(token: string, payload: CreatePeriodPayload) {
  return apiRequest<PayrollPeriod>('/periods', {
    body: payload,
    method: 'POST',
    token,
  });
}

function updatePeriod(
  token: string,
  periodId: string,
  payload: UpdatePeriodPayload,
) {
  return apiRequest<PayrollPeriod>(`/periods/${periodId}`, {
    body: payload,
    method: 'PATCH',
    token,
  });
}

function deletePeriod(token: string, periodId: string) {
  return apiRequest<void>(`/periods/${periodId}`, {
    method: 'DELETE',
    token,
  });
}

export {
  createPeriod,
  deletePeriod,
  getPeriods,
  updatePeriod,
};
