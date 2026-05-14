import type { BottomSheetDragHandleProps } from '../../../../Components/BottomSheet';
import type {
  DashboardSummary,
  Transaction,
} from '../../../../Services';
import type {
  HistoryFilter,
  HistoryItemData,
  PeriodState,
} from '../../DashboardScreen.types';

type DashboardHistoryProps = {
  availablePeriod?: DashboardSummary['availablePeriod'];
  histories: HistoryItemData[];
  historyMonth: string;
  historyMonthLabel: string;
  historyPeriod: PeriodState;
  isFullHistoryVisible: boolean;
  isLoading: boolean;
  onChanged: () => void;
  onCloseFullHistory: () => void;
  onOpenFullHistory: () => void;
  onSelectHistoryFilter: (filter: HistoryFilter) => void;
  selectedHistoryFilter: HistoryFilter;
  selectedHistoryWalletId: string;
};

type FullHistoryBottomSheetProps = Omit<
  DashboardHistoryProps,
  'histories' | 'onOpenFullHistory'
> & {
  onEditTransaction: (transaction: Transaction) => void;
  refreshKey: number;
};

type FullHistoryPeriodContentProps = {
  dragHandleProps: BottomSheetDragHandleProps;
  onApply: () => void;
  onClose: () => void;
  onGoBack: () => void;
  period: PeriodState;
  range: { maxMonth: string; minMonth: string };
};

export type {
  DashboardHistoryProps,
  FullHistoryBottomSheetProps,
  FullHistoryPeriodContentProps,
};
