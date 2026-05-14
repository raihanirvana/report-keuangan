import { apiRequest } from '../Api/apiClient';

import type { DashboardSummary } from './dashboard.types';

function getDashboardSummary(token: string, month: string, walletId = 'all') {
  return apiRequest<DashboardSummary>(
    `/dashboard/summary?walletId=${walletId}&month=${month}`,
    {
      method: 'GET',
      token,
    },
  );
}

export {
  getDashboardSummary,
};
