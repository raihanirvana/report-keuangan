import { apiRequest } from '../Api/apiClient';

import type { DashboardSummary } from './dashboard.types';

function getDashboardSummary(token: string, month: string) {
  return apiRequest<DashboardSummary>(
    `/dashboard/summary?walletId=all&month=${month}`,
    {
    method: 'GET',
    token,
    },
  );
}

export {
  getDashboardSummary,
};
