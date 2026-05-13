import type { WalletType } from './DashboardScreen.types';

const walletTypes: WalletType[] = ['Bank', 'E-Wallet', 'Cash', 'Savings', 'Other'];

const categoryColorPresets = [
  '#EE2B6C',
  '#4EA8DE',
  '#A29BFE',
  '#FBCF33',
  '#22C55E',
  '#FB7185',
] as const;

const categoryIconPresets = [
  { icon: 'lunch_dining', label: 'Makan' },
  { icon: 'two_wheeler', label: 'Transport' },
  { icon: 'shopping_bag', label: 'Belanja' },
  { icon: 'wifi', label: 'Internet' },
  { icon: 'home', label: 'Rumah' },
  { icon: 'favorite', label: 'Hobi' },
] as const;

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
  categoryColorPresets,
  categoryIconPresets,
  monthOptions,
  walletTypes,
};
