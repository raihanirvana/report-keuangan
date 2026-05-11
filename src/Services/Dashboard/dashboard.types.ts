type MoneySummary = {
  amount: number;
  formatted: string;
};

type DashboardSummary = {
  balance: MoneySummary;
  selectedWallet: {
    id: string;
    name: string;
  };
};

export type {
  DashboardSummary,
};
