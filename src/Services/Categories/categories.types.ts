type CategoryType = 'EXPENSE' | 'INCOME';

type Category = {
  color: string;
  icon: string;
  id: string;
  isDefault: boolean;
  name: string;
  type: CategoryType;
};

type CategoriesQuery = {
  type?: CategoryType;
};

type CreateCategoryPayload = {
  color: string;
  icon: string;
  name: string;
  type: CategoryType;
};

export type {
  CategoriesQuery,
  Category,
  CreateCategoryPayload,
  CategoryType,
};
