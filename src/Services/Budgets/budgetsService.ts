import { apiRequest } from '../Api/apiClient';

import type {
  BudgetItem,
  BudgetsResponse,
  CopyPreviousBudgetPayload,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from './budgets.types';

function getBudgets(token: string, month: string, periodId?: string | null) {
  return apiRequest<BudgetsResponse>(getBudgetsPath(month, periodId), {
    method: 'GET',
    token,
  });
}

function getBudgetsPath(month: string, periodId?: string | null) {
  const params = new URLSearchParams({ month });

  if (periodId) {
    params.set('periodId', periodId);
  }

  return `/budgets?${params.toString()}`;
}

function copyPreviousBudgets(
  token: string,
  payload: CopyPreviousBudgetPayload,
) {
  return apiRequest<BudgetsResponse>('/budgets/copy-previous-month', {
    body: payload,
    method: 'POST',
    token,
  });
}

function createBudget(token: string, payload: CreateBudgetPayload) {
  return apiRequest<BudgetItem>('/budgets', {
    body: payload,
    method: 'POST',
    token,
  });
}

function deleteBudget(
  token: string,
  budgetId: string,
  month: string,
  periodId?: string | null,
) {
  return apiRequest<void>(getDeleteBudgetPath(budgetId, month, periodId), {
    method: 'DELETE',
    token,
  });
}

function getDeleteBudgetPath(
  budgetId: string,
  month: string,
  periodId?: string | null,
) {
  const params = new URLSearchParams({ month });

  if (periodId) {
    params.set('periodId', periodId);
  }

  return `/budgets/${budgetId}?${params.toString()}`;
}

function updateBudget(
  token: string,
  budgetId: string,
  payload: UpdateBudgetPayload,
) {
  return apiRequest<BudgetItem>(`/budgets/${budgetId}`, {
    body: payload,
    method: 'PATCH',
    token,
  });
}

export {
  copyPreviousBudgets,
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
};
