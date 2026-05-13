import type {
  Dispatch,
  SetStateAction,
} from 'react';

import type {
  Category,
  Transaction,
  Wallet,
} from '../../Services';

type TransactionTab = 'Pengeluaran' | 'Pemasukan' | 'Pindah Dana';
type SheetStep = 'confirm' | 'form';

type AddTransactionSheetProps = {
  onChanged?: () => void;
  onClose: () => void;
  transaction?: Transaction | null;
  visible: boolean;
};

type SheetState = {
  amount: string;
  categories: Category[];
  errorMessage: string;
  fromWalletId: string;
  note: string;
  selectedCategoryId: string;
  selectedWalletId: string;
  step: SheetStep;
  title: string;
  toWalletId: string;
  type: TransactionTab;
  wallets: Wallet[];
};

type SheetSetters = {
  setAmount: (value: string) => void;
  setErrorMessage: (value: string) => void;
  setFromWalletId: (value: string) => void;
  setNote: (value: string) => void;
  setSelectedCategoryId: (value: string) => void;
  setSelectedWalletId: (value: string) => void;
  setStep: (value: SheetStep) => void;
  setTitle: (value: string) => void;
  setToWalletId: (value: string) => void;
  setType: (value: TransactionTab) => void;
};

type SheetStateSetter = Dispatch<SetStateAction<SheetState>>;

export type {
  AddTransactionSheetProps,
  SheetSetters,
  SheetState,
  SheetStateSetter,
  SheetStep,
  TransactionTab,
};
