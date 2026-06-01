import { apiRequest } from '../Api/apiClient';

import type { DashboardSummary } from './dashboard.types';

function getDashboardSummary(
  token: string,
  month: string,
  walletId = 'all',
  periodId?: string | null,
) {
  const periodQuery = periodId ? `&periodId=${periodId}` : '';

  return apiRequest<DashboardSummary>(
    `/dashboard/summary?walletId=${walletId}&month=${month}${periodQuery}`,
    {
      method: 'GET',
      token,
    },
  );
}

export {
  getDashboardSummary,
};
