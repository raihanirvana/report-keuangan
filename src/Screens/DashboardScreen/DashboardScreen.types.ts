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
  PayrollPeriod,
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
  periodId?: string;
  visible: boolean;
};

type LimitSheetView = 'category' | 'create' | 'edit' | 'list';

type SaveLimitParams = {
  bumpCategoryRefreshKey: () => void;
  month: string;
  onChanged: () => void;
  periodId?: string;
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
  isBusy: boolean;
  isDeleteMode: boolean;
  isEditMode: boolean;
  isFetching: boolean;
  limitItems: LimitDetail[];
  loadingLabel: string;
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
  setBudgetRefreshKey: Dispatch<SetStateAction<number>>;
  setChartAnimationKey: Dispatch<SetStateAction<number>>;
  setDashboardSummary: Dispatch<SetStateAction<DashboardSummary | null>>;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  setHistoryItems: Dispatch<SetStateAction<HistoryItemData[]>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
};

type DashboardDataState = DashboardDataSetters & {
  budgetRefreshKey: number;
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  errorMessage: string;
  historyItems: HistoryItemData[];
  isRefreshing: boolean;
  refreshDashboard: () => Promise<void>;
};

type PeriodState = {
  isLoading: boolean;
  periods: PayrollPeriod[];
  selectedPeriodId: string;
  selectedMonth: string;
  selectedYear: string;
  setPeriods: Dispatch<SetStateAction<PayrollPeriod[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setSelectedPeriodId: Dispatch<SetStateAction<string>>;
  setSelectedMonth: Dispatch<SetStateAction<string>>;
  setSelectedYear: Dispatch<SetStateAction<string>>;
};

type PeriodDateField = 'end' | 'start';
type PeriodFormMode = 'create' | 'edit';

type PeriodFormParams = {
  actions: UsagePeriodContentProps;
  activeDateField: PeriodDateField | null;
  endDate: string;
  endTime: string;
  editingPeriodId: string;
  errorMessage: string;
  isSaving: boolean;
  mode: PeriodFormMode;
  monthDate: Date;
  name: string;
  setActiveDateField: (value: PeriodDateField | null) => void;
  setEndDate: (value: string) => void;
  setEndTime: (value: string) => void;
  setEditingPeriodId: (value: string) => void;
  setErrorMessage: (value: string) => void;
  setMode: (value: PeriodFormMode) => void;
  setMonthDate: (value: Date) => void;
  setName: (value: string) => void;
  setSaving: (value: boolean) => void;
  setStartDate: (value: string) => void;
  setStartTime: (value: string) => void;
  startDate: string;
  startTime: string;
};

type DashboardPeriod = {
  apiMonth: string;
  label: string;
  periodId?: string;
};

type DashboardScreenProps = {
  onLogout: () => Promise<void>;
  onUpdateName: (name: string) => Promise<void>;
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
  onOpenFullHistory: (filter?: HistoryFilter, walletId?: string) => void;
  onOpenLimitDetail: () => void;
  onOpenUsagePeriod: () => void;
  onSelectHistoryFilter: (filter: HistoryFilter) => void;
  selectedHistoryFilter: HistoryFilter;
  selectedHistoryWalletId: string;
  setAddSheetVisible: Dispatch<SetStateAction<boolean>>;
  setFullHistoryVisible: Dispatch<SetStateAction<boolean>>;
  setLimitDetailVisible: Dispatch<SetStateAction<boolean>>;
  setUsagePeriodVisible: Dispatch<SetStateAction<boolean>>;
};

type DashboardSheetsProps = DashboardSheetState & {
  apiMonth: string;
  onDashboardChanged: () => void;
  periodId?: string;
};

type DashboardContentProps = {
  apiMonth: string;
  availablePeriod?: DashboardSummary['availablePeriod'];
  budgetRefreshKey: number;
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  filterLabel: string;
  historyMonth: string;
  historyMonthLabel: string;
  historyPeriodId?: string;
  historyItems: HistoryItemData[];
  historyPeriod: PeriodState;
  isFullHistoryVisible: boolean;
  isRefreshing: boolean;
  periodId?: string;
  onChanged: () => void;
  onCloseFullHistory: () => void;
  onOpenFullHistory: (filter?: HistoryFilter, walletId?: string) => void;
  onOpenLimitDetail: () => void;
  onOpenUsagePeriod: () => void;
  onRefresh: () => void;
  onSelectHistoryFilter: (filter: HistoryFilter) => void;
  onLogout: () => Promise<void>;
  onUpdateName: (name: string) => Promise<void>;
  selectedHistoryFilter: HistoryFilter;
  selectedHistoryWalletId: string;
  user?: AuthUser | null;
};

type SummaryCardsProps = {
  apiMonth: string;
  dashboardSummary: DashboardSummary | null;
  isLoading: boolean;
  onOpenHistory: (filter: HistoryFilter, walletId?: string) => void;
  periodId?: string;
  periodLabel: string;
};

type DashboardMainContentProps = {
  apiMonth: string;
  dashboardData: DashboardDataState;
  filterLabel: string;
  historyPeriod: PeriodState;
  historyPeriodFilter: DashboardPeriod;
  periodId?: string;
  onLogout: () => Promise<void>;
  onUpdateName: (name: string) => Promise<void>;
  sheets: DashboardSheetState;
  user?: AuthUser | null;
};

type DashboardScreenShellProps = {
  dashboardData: DashboardDataState;
  historyPeriod: PeriodState;
  onLogout: () => Promise<void>;
  onUpdateName: (name: string) => Promise<void>;
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
  periodId?: string;
  visible: boolean;
};

type LimitDetailListViewProps = {
  dragHandleProps: BottomSheetDragHandleProps;
  isBusy: boolean;
  isDeleteMode: boolean;
  isEditMode: boolean;
  isFetching: boolean;
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
  onApply: () => void;
  onCreatePeriod: (payload: {
    endDate: string;
    name?: string;
    startDate: string;
  }) => Promise<void>;
  onDeletePeriod: (periodId: string) => Promise<void>;
  onUpdatePeriod: (
    periodId: string,
    payload: {
      endDate?: string;
      name?: string;
      startDate?: string;
    },
  ) => Promise<void>;
  period: PeriodState;
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
  isLoading: boolean;
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
  isBusy: boolean;
  month: string;
  onCreateNewCategory: () => void;
  onHideInfoMessage: () => void;
  onInfoMessage: (message: string) => void;
  onSaveCategory: (state: LimitCategoryFormState) => void;
  periodId?: string;
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
  PeriodDateField,
  PeriodFormMode,
  PeriodFormParams,
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
