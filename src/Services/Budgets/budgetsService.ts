import { apiRequest } from '../Api/apiClient';

import type {
  BudgetsResponse,
  CopyPreviousBudgetPayload,
  CreateBudgetPayload,
} from './budgets.types';

function getBudgets(token: string, month: string) {
  return apiRequest<BudgetsResponse>(`/budgets?month=${month}`, {
    method: 'GET',
    token,
  });
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
  return apiRequest<unknown>('/budgets', {
    body: payload,
    method: 'POST',
    token,
  });
}

function deleteBudget(token: string, budgetId: string) {
  return apiRequest<void>(`/budgets/${budgetId}`, {
    method: 'DELETE',
    token,
  });
}

export {
  copyPreviousBudgets,
  createBudget,
  deleteBudget,
  getBudgets,
};
