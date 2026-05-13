import type { HistoryFilter } from '../../DashboardScreen.types';

type SummaryCardVariant = 'expense' | 'income';

type SummaryCardData = {
  filter: HistoryFilter;
  icon: string;
  label: string;
  value: string;
  variant: SummaryCardVariant;
};

type SummaryCardProps = SummaryCardData & {
  onOpenHistory: (filter: HistoryFilter) => void;
  periodLabel: string;
};

export type {
  SummaryCardData,
  SummaryCardProps,
  SummaryCardVariant,
};
