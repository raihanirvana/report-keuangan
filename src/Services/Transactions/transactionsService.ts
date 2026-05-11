import { apiRequest } from '../Api/apiClient';

import type { Transaction, TransactionsQuery } from './transactions.types';

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

export { getTransactions };
