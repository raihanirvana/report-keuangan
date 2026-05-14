import type { HistoryFilter } from '../../DashboardScreen.types';

type SummaryCardVariant = 'expense' | 'income';

type SummaryCardData = {
  filter: HistoryFilter;
  icon: string;
  label: string;
  variant: SummaryCardVariant;
};

type SummaryCardProps = SummaryCardData & {
  filterState: SummaryCardFilterState;
  isLoading: boolean;
  onOpenHistory: (filter: HistoryFilter, walletId?: string) => void;
  periodLabel: string;
  value: string;
};

type SummaryCardFilterState = {
  isDropdownOpen: boolean;
  selectedWalletId: string;
  selectedWalletName: string;
  selectWallet: (walletId: string) => void;
  toggleDropdown: () => void;
  wallets: Array<{ id: string; name: string }>;
};

export type {
  SummaryCardData,
  SummaryCardFilterState,
  SummaryCardProps,
  SummaryCardVariant,
};
