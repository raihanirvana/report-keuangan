import type { WalletType } from './DashboardScreen.types';

const walletTypes: WalletType[] = ['Bank', 'E-Wallet', 'Cash', 'Savings', 'Other'];

const monthOptions = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
] as const;

export {
  monthOptions,
  walletTypes,
};
