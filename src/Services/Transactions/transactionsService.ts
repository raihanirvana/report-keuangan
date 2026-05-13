import { apiRequest } from '../Api/apiClient';

import type {
  CreateTransactionPayload,
  Transaction,
  TransactionsQuery,
  UpdateTransactionPayload,
} from './transactions.types';

function getTransactions(token: string, query: TransactionsQuery = {}) {
  return apiRequest<Transaction[]>(getTransactionsPath(query), {
    method: 'GET',
    token,
  });
}

function getTransactionsPath(query: TransactionsQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `/transactions?${queryString}` : '/transactions';
}

function createTransaction(token: string, payload: CreateTransactionPayload) {
  return apiRequest<Transaction>('/transactions', {
    body: payload,
    method: 'POST',
    token,
  });
}

function updateTransaction(
  token: string,
  transactionId: string,
  payload: UpdateTransactionPayload,
) {
  return apiRequest<Transaction>(`/transactions/${transactionId}`, {
    body: payload,
    method: 'PATCH',
    token,
  });
}

function deleteTransaction(token: string, transactionId: string) {
  return apiRequest<void>(`/transactions/${transactionId}`, {
    method: 'DELETE',
    token,
  });
}

export {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
};
