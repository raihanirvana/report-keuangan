type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

type TransactionWallet = {
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

type CreateTransactionPayload = {
  amount: number;
  categoryId?: string;
  fromWalletId?: string;
  note?: string;
  title: string;
  toWalletId?: string;
  type: TransactionType;
  walletId?: string;
};

type UpdateTransactionPayload = Partial<CreateTransactionPayload> & {
  occurredAt?: string;
};

export type {
  CreateTransactionPayload,
  Transaction,
  TransactionCategory,
  TransactionsQuery,
  TransactionType,
  TransactionWallet,
  UpdateTransactionPayload,
};
