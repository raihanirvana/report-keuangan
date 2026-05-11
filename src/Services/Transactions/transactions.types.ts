type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

type TransactionWallet = {
  id: string;
  name: string;
};

type TransactionCategory = {
  color: string;
  icon: string;
  id: string;
  name: string;
};

type Transaction = {
  amount: number;
  category: TransactionCategory | null;
  formattedAmount: string;
  fromWallet: TransactionWallet | null;
  id: string;
  note: string | null;
  occurredAt: string;
  title: string;
  toWallet: TransactionWallet | null;
  type: TransactionType;
  wallet: TransactionWallet | null;
};

type TransactionsQuery = {
  limit?: number;
  month?: string;
  page?: number;
  type?: TransactionType;
  walletId?: string;
};

export type {
  Transaction,
  TransactionCategory,
  TransactionsQuery,
  TransactionType,
  TransactionWallet,
};
