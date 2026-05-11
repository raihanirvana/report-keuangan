import { apiRequest } from '../Api/apiClient';

import type {
  CategoriesQuery,
  Category,
  CreateCategoryPayload,
} from './categories.types';

function getCategories(token: string, query: CategoriesQuery = {}) {
  const params = new URLSearchParams();

  if (query.type) {
    params.set('type', query.type);
  }

  const queryString = params.toString();

  return apiRequest<Category[]>(
    `/categories${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      token,
    },
  );
}

function createCategory(token: string, payload: CreateCategoryPayload) {
  return apiRequest<Category>('/categories', {
    body: payload,
    method: 'POST',
    token,
  });
}

export {
  createCategory,
  getCategories,
};
