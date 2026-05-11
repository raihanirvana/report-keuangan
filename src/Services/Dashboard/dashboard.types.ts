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
  expense: MoneySummary;
  income: MoneySummary;
  selectedWallet: {
    id: string;
    name: string;
  };
};

export type {
  DashboardSummary,
};
