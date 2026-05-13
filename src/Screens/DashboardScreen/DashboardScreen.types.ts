import type {
  Dispatch,
  SetStateAction,
} from 'react';

import type { BottomSheetDragHandleProps } from '../../Components/BottomSheet';
import type {
  AuthUser,
  BudgetPreviousMonth,
  Category,
  DashboardSummary,
  Transaction,
} from '../../Services';

type LimitTone = 'blue' | 'primary' | 'purple' | 'yellow';
type WalletTone = 'blue' | 'primary' | 'purple' | 'yellow';

type LimitDetail = {
  icon: string;
  id: string;
  label: string;
  limitAmount: number;
  progress: string;
  tone: LimitTone;
  width: `${number}%`;
};

type LimitDetailState = {
  items: LimitDetail[];
  previousMonth?: BudgetPreviousMonth;
};

type SetLimitState = Dispatch<SetStateAction<LimitDetailState>>;

type LimitDetailStateProps = {
  month: string;
  onChanged: () => void;
  visible: boolean;
};

type LimitSheetView = 'category' | 'create' | 'edit' | 'list';

type SaveLimitParams = {
  bumpCategoryRefreshKey: () => void;
  month: string;
  onChanged: () => void;
  setLimitState: SetLimitState;
  setSnackbarMessage: (message: string) => void;
  setView: (view: LimitSheetView) => void;
};

type LimitSheetState = {
  categoryRefreshKey: number;
  deleteCategory: (budgetId: string) => void;
  editCategory: (state: LimitEditFormState) => void;
  editingLimitDraft: EditingLimitDraft | null;
  hideSnackbar: () => void;
  isDeleteMode: boolean;
  isEditMode: boolean;
  limitItems: LimitDetail[];
  openEditCategory: (item: LimitDetail) => void;
  saveCategory: (state: LimitCategoryFormState) => void;
  saveCustomCategory: (state: CustomCategoryFormState) => void;
  setView: (view: LimitSheetView) => void;
  showSnackbar: (message: string) => void;
  snackbarMessage: string;
  toggleDeleteMode: () => void;
  toggleEditMode: () => void;
  usePreviousMonth: () => void;
  view: LimitSheetView;
};

type HistoryFilter = 'Pemasukan' | 'Pengeluaran' | 'Pindah Dana' | 'Semua';
type HistoryTone = 'expense' | 'income' | 'transfer';

type HistoryItemData = {
  amount: string;
  icon: string;
  id: string;
  meta: string;
  occurredAt: string;
  title: string;
  tone: HistoryTone;
  transaction: Transaction;
};

type FullHistoryGroupData = {
  id: string;
  title: string;
  transactions: HistoryItemData[];
};

type WalletType = 'Bank' | 'E-Wallet' | 'Cash' | 'Savings' | 'Other';

type WalletItem = {
  amount: string;
  balance: number;
  icon: string;
  id: string;
  name: string;
  selectedType: WalletType;
  tone: WalletTone;
};

type WalletActionMode = 'delete' | 'edit' | 'idle';
type WalletSheetView = 'create' | 'edit' | 'list';

type DashboardDataSetters = {
  setChartAnimationKey: Dispatch<SetStateAction<number>>;
  setDashboardSummary: Dispatch<SetStateAction<DashboardSummary | null>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  setHistoryItems: Dispatch<SetStateAction<HistoryItemData[]>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
};

type DashboardDataState = DashboardDataSetters & {
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  errorMessage: string;
  historyItems: HistoryItemData[];
  isRefreshing: boolean;
  refreshDashboard: () => Promise<void>;
};

type PeriodState = {
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth: Dispatch<SetStateAction<string>>;
  setSelectedYear: Dispatch<SetStateAction<string>>;
};

type DashboardPeriod = {
  apiMonth: string;
  label: string;
};

type DashboardScreenProps = {
  onLogout?: () => Promise<void> | void;
  onUpdateUser?: (user: AuthUser) => Promise<void> | void;
  user?: AuthUser | null;
};

type DashboardSheetState = {
  isAddSheetVisible: boolean;
  isFullHistoryVisible: boolean;
  isLimitDetailVisible: boolean;
  isUsagePeriodVisible: boolean;
  onCloseAddSheet: () => void;
  onCloseFullHistory: () => void;
  onCloseLimitDetail: () => void;
  onCloseUsagePeriod: () => void;
  onOpenAddSheet: () => void;
  onOpenFullHistory: (filter?: HistoryFilter) => void;
  onOpenLimitDetail: () => void;
  onOpenUsagePeriod: () => void;
  onSelectHistoryFilter: (filter: HistoryFilter) => void;
  selectedHistoryFilter: HistoryFilter;
  setAddSheetVisible: Dispatch<SetStateAction<boolean>>;
  setFullHistoryVisible: Dispatch<SetStateAction<boolean>>;
  setLimitDetailVisible: Dispatch<SetStateAction<boolean>>;
  setUsagePeriodVisible: Dispatch<SetStateAction<boolean>>;
};

type DashboardSheetsProps = DashboardSheetState & {
  apiMonth: string;
  onDashboardChanged: () => void;
};

type DashboardContentProps = {
  availablePeriod?: DashboardSummary['availablePeriod'];
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  filterLabel: string;
  historyMonth: string;
  historyMonthLabel: string;
  historyItems: HistoryItemData[];
  historyPeriod: PeriodState;
  isFullHistoryVisible: boolean;
  isRefreshing: boolean;
  onChanged: () => void;
  onCloseFullHistory: () => void;
  onOpenFullHistory: (filter?: HistoryFilter) => void;
  onOpenLimitDetail: () => void;
  onOpenUsagePeriod: () => void;
  onRefresh: () => void;
  onSelectHistoryFilter: (filter: HistoryFilter) => void;
  onLogout?: () => Promise<void> | void;
  onUpdateUser?: (user: AuthUser) => Promise<void> | void;
  selectedHistoryFilter: HistoryFilter;
  user?: AuthUser | null;
};

type SummaryCardsProps = {
  dashboardSummary: DashboardSummary | null;
  onOpenHistory: (filter: HistoryFilter) => void;
  periodLabel: string;
};

type DashboardMainContentProps = {
  dashboardData: DashboardDataState;
  filterLabel: string;
  historyPeriod: PeriodState;
  historyPeriodFilter: DashboardPeriod;
  onLogout?: () => Promise<void> | void;
  onUpdateUser?: (user: AuthUser) => Promise<void> | void;
  sheets: DashboardSheetState;
  user?: AuthUser | null;
};

type DashboardScreenShellProps = {
  dashboardData: DashboardDataState;
  historyPeriod: PeriodState;
  onLogout?: () => Promise<void> | void;
  onUpdateUser?: (user: AuthUser) => Promise<void> | void;
  period: PeriodState;
  periodFilter: DashboardPeriod;
  sheets: DashboardSheetState;
  user?: AuthUser | null;
};

type DashboardSuccessOverlaysProps = {
  availablePeriod?: DashboardSummary['availablePeriod'];
  dashboardData: DashboardDataState;
  historyPeriodFilter: DashboardPeriod;
  historyPeriodState: PeriodState;
  period: PeriodState;
  periodFilter: DashboardPeriod;
  sheets: DashboardSheetState;
};

type DashboardSuccessSheetsProps = {
  availablePeriod?: DashboardSummary['availablePeriod'];
  dashboardData: DashboardDataState;
  historyPeriodFilter: DashboardPeriod;
  historyPeriodState: PeriodState;
  periodFilter: DashboardPeriod;
  sheets: DashboardSheetState;
};

type LimitDetailSheetContentProps = {
  dragHandleProps: BottomSheetDragHandleProps;
  month: string;
  onChanged: () => void;
  onClose: () => void;
  visible: boolean;
};

type LimitDetailListViewProps = {
  dragHandleProps: BottomSheetDragHandleProps;
  isDeleteMode: boolean;
  isEditMode: boolean;
  limitItems: LimitDetail[];
  onCreateCategory: () => void;
  onDeleteBudget: (budgetId: string) => void;
  onEditBudget: (item: LimitDetail) => void;
  onHideSnackbar: () => void;
  onToggleEdit: () => void;
  onToggleDelete: () => void;
  onUsePreviousMonth: () => void;
  snackbarMessage: string;
};

type UsagePeriodContentProps = {
  monthOptions: string[];
  onApply: () => void;
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: string) => void;
  yearOptions: string[];
};

type UsagePeriodBottomSheetProps = UsagePeriodContentProps & {
  onClose: () => void;
  visible: boolean;
};

type WalletFormState = {
  balance: string;
  errorMessage: string;
  focusBalance: () => void;
  name: string;
  selectedType: WalletType;
  setBalance: (value: string) => void;
  setErrorMessage: (message: string) => void;
  setName: (value: string) => void;
  setSelectedType: (type: WalletType) => void;
};

type WalletFormDefaults = {
  balance: string;
  name: string;
  selectedType: WalletType;
};

type LimitCategoryFormState = {
  categories: Category[];
  limitAmount: string;
  selectedCategoryId: string;
  setLimitAmount: (value: string) => void;
  setSelectedCategoryId: (value: string) => void;
};

type LimitEditFormState = {
  budgetId: string;
  label: string;
  limitAmount: string;
  setLimitAmount: (value: string) => void;
};

type CustomCategoryFormState = {
  color: string;
  icon: string;
  name: string;
  setColor: (value: string) => void;
  setIcon: (value: string) => void;
  setName: (value: string) => void;
};

type LimitCategoryCreateContentProps = {
  month: string;
  onCreateNewCategory: () => void;
  onHideInfoMessage: () => void;
  onInfoMessage: (message: string) => void;
  onSaveCategory: (state: LimitCategoryFormState) => void;
  refreshKey: number;
  snackbarMessage: string;
};

type EditingLimitDraft = {
  budgetId: string;
  label: string;
  limitAmount: string;
};

export type {
  CustomCategoryFormState,
  DashboardContentProps,
  DashboardDataSetters,
  DashboardDataState,
  DashboardMainContentProps,
  DashboardPeriod,
  DashboardScreenProps,
  DashboardScreenShellProps,
  DashboardSheetsProps,
  DashboardSheetState,
  DashboardSuccessOverlaysProps,
  DashboardSuccessSheetsProps,
  EditingLimitDraft,
  FullHistoryGroupData,
  HistoryFilter,
  HistoryItemData,
  HistoryTone,
  LimitCategoryCreateContentProps,
  LimitCategoryFormState,
  LimitDetail,
  LimitDetailListViewProps,
  LimitDetailSheetContentProps,
  LimitDetailState,
  LimitDetailStateProps,
  LimitEditFormState,
  LimitSheetView,
  LimitSheetState,
  LimitTone,
  PeriodState,
  SaveLimitParams,
  SetLimitState,
  SummaryCardsProps,
  UsagePeriodBottomSheetProps,
  UsagePeriodContentProps,
  WalletActionMode,
  WalletFormDefaults,
  WalletFormState,
  WalletItem,
  WalletSheetView,
  WalletTone,
  WalletType,
};
