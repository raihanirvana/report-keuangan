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

export type {
  CategoriesQuery,
  Category,
  CategoryType,
};
