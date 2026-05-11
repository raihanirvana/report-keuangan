type MoneySummary = {
  amount: number;
  formatted: string;
};

type DashboardSummary = {
  availablePeriod: {
    maxMonth: string;
    minMonth: string;
  };
  balance: MoneySummary;
  budgetLimit: {
    limitAmount: number;
    percentage: number;
    usedAmount: number;
  };
  chart: {
    categories: DashboardChartCategory[];
    expenseTotal: number;
  };
  expense: MoneySummary;
  income: MoneySummary;
  selectedWallet: {
    id: string;
    name: string;
  };
};

type DashboardChartCategory = {
  amount: number;
  categoryId: string;
  color: string;
  name: string;
  percentage: number;
};

export type {
  DashboardChartCategory,
  DashboardSummary,
};
