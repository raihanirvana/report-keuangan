import { apiRequest } from '../Api/apiClient';

import type { DashboardSummary } from './dashboard.types';

function getDashboardSummary(token: string) {
  return apiRequest<DashboardSummary>('/dashboard/summary?walletId=all', {
    method: 'GET',
    token,
  });
}

export {
  getDashboardSummary,
};
