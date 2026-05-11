type WalletType = 'BANK' | 'CASH' | 'EWALLET' | 'OTHER' | 'SAVINGS';

type Wallet = {
  balance: number;
  color: string;
  formattedBalance: string;
  icon: string;
  id: string;
  name: string;
  type: WalletType;
};

type CreateWalletPayload = {
  color: string;
  icon: string;
  initialBalance?: number;
  name: string;
  type: WalletType;
};

export type {
  CreateWalletPayload,
  Wallet,
  WalletType,
};
