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
  periodId?: string;
};

type BudgetsResponse = {
  documentId: string | null;
  items: BudgetItem[];
  month: string;
  period?: {
    endDate: string;
    id: string | null;
    label: string;
    startDate: string;
  };
  previousMonth?: BudgetPreviousMonth;
  summary: BudgetSummary;
};

type CopyPreviousBudgetPayload = {
  sourceMonth?: string;
  sourcePeriodId?: string;
  targetMonth?: string;
  targetPeriodId?: string;
};

type CreateBudgetPayload = {
  categoryId: string;
  limitAmount: number;
  month: string;
  periodId?: string;
};

type UpdateBudgetPayload = {
  limitAmount: number;
  month: string;
  periodId?: string;
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
