type BudgetSummary = {
  limitAmount: number;
  percentage: number;
  usedAmount: number;
};

type BudgetItem = {
  categoryId: string;
  color: string;
  documentId: string;
  icon: string;
  id: string;
  limitAmount: number;
  name: string;
  percentage: number;
  statusLabel: string;
  usedAmount: number;
};

type BudgetPreviousMonth = {
  available: boolean;
  month: string;
};

type BudgetsResponse = {
  documentId: string | null;
  items: BudgetItem[];
  month: string;
  previousMonth?: BudgetPreviousMonth;
  summary: BudgetSummary;
};

type CopyPreviousBudgetPayload = {
  sourceMonth: string;
  targetMonth: string;
};

type CreateBudgetPayload = {
  categoryId: string;
  limitAmount: number;
  month: string;
};

type UpdateBudgetPayload = {
  limitAmount: number;
  month: string;
};

export type {
  BudgetItem,
  BudgetPreviousMonth,
  BudgetSummary,
  BudgetsResponse,
  CopyPreviousBudgetPayload,
  CreateBudgetPayload,
  UpdateBudgetPayload,
};
