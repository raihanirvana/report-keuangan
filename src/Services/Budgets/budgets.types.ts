type BudgetSummary = {
  limitAmount: number;
  percentage: number;
  usedAmount: number;
};

type BudgetItem = {
  categoryId: string;
  color: string;
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
  items: BudgetItem[];
  previousMonth?: BudgetPreviousMonth;
  summary: BudgetSummary;
};

type CopyPreviousBudgetPayload = {
  sourceMonth: string;
  targetMonth: string;
};

type CreateBudgetPayload = {
  category: {
    color: string;
    icon: string;
    name: string;
  };
  endsAt: string;
  limitAmount: number;
  period: 'MONTHLY';
  startsAt: string;
};

export type {
  BudgetItem,
  BudgetPreviousMonth,
  BudgetSummary,
  BudgetsResponse,
  CopyPreviousBudgetPayload,
  CreateBudgetPayload,
};
