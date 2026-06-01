import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import AddTransactionSheet from '../../Components/AddTransactionSheet';
import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../Components/BottomSheet';
import {
  createPeriod,
  getDashboardSummary,
  getPeriods,
  getTransactions,
  type DashboardSummary,
  type PayrollPeriod,
} from '../../Services';
import { colors } from '../../Theme';
import { getAuthToken } from '../../Utils/authStorage';

import { DashboardHeader } from './Components/DashboardHeader';
import {
  DashboardHistory,
  mapTransactionToHistoryItem,
} from './Components/DashboardHistory';
import {
  DashboardSpendingLimit,
  LimitDetailBottomSheet,
} from './Components/DashboardSpendingLimit';
import { DashboardSummaryCards } from './Components/DashboardSummaryCards';
import { DashboardUsageChart } from './Components/DashboardUsageChart';
import { DashboardWalletAssets } from './Components/DashboardWalletAssets';
import { monthOptions } from './DashboardScreen.data';
import styles from './DashboardScreen.styles';
import type {
  DashboardContentProps,
  DashboardDataSetters,
  DashboardMainContentProps,
  DashboardPeriod,
  DashboardScreenProps,
  DashboardScreenShellProps,
  DashboardSheetsProps,
  DashboardSheetState,
  DashboardSuccessOverlaysProps,
  DashboardSuccessSheetsProps,
  HistoryFilter,
  HistoryItemData,
  PeriodState,
  UsagePeriodBottomSheetProps,
  UsagePeriodContentProps,
} from './DashboardScreen.types';

function SheetBackButton(props: { isVisible?: boolean; onPress?: () => void }) {
  if (!props.isVisible) {
    return null;
  }

  return (
    <Pressable onPress={props.onPress} style={styles.sheetBackButton}>
      <Text style={styles.sheetBackText}>‹</Text>
    </Pressable>
  );
}

function SheetHandle(props: { dragHandleProps: BottomSheetDragHandleProps }) {
  return (
    <View {...props.dragHandleProps}>
      <View style={styles.sheetHandle} />
    </View>
  );
}

function SheetCloseButton(props: { onClose: () => void }) {
  return (
    <Pressable onPress={props.onClose} style={styles.sheetCloseButton}>
      <Text style={styles.sheetCloseText}>×</Text>
    </Pressable>
  );
}

function SheetHeader(props: {
  action?: ReactNode;
  canGoBack?: boolean;
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onGoBack?: () => void;
  title: string;
}) {
  return (
    <View>
      <SheetHandle dragHandleProps={props.dragHandleProps} />
      <View style={styles.sheetHeader}>
        <SheetBackButton
          isVisible={props.canGoBack}
          onPress={props.onGoBack}
        />
        <View style={styles.sheetTitleArea} {...props.dragHandleProps}>
          <Text style={styles.sheetTitle}>{props.title}</Text>
        </View>
        {props.action}
        <SheetCloseButton onClose={props.onClose} />
      </View>
    </View>
  );
}
function PeriodOption(props: {
  isActive: boolean;
  label: string;
  meta?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.periodOption, props.isActive && styles.periodOptionActive]}
    >
      <PeriodOptionLabel isActive={props.isActive} label={props.label} />
      <PeriodOptionMeta isActive={props.isActive} meta={props.meta} />
    </Pressable>
  );
}

function PeriodOptionLabel(props: { isActive: boolean; label: string }) {
  return (
    <Text
      style={[
        styles.periodOptionText,
        props.isActive && styles.periodOptionTextActive,
      ]}
    >
      {props.label}
    </Text>
  );
}

function PeriodOptionMeta(props: { isActive: boolean; meta?: string }) {
  if (!props.meta) {
    return null;
  }

  return (
    <Text
      style={[
        styles.periodOptionMeta,
        props.isActive && styles.periodOptionMetaActive,
      ]}
    >
      {props.meta}
    </Text>
  );
}

function UsagePeriodContent(props: UsagePeriodContentProps) {
  const form = usePeriodCreateForm(props.onCreatePeriod);

  return (
    <View style={styles.periodContent}>
      <PeriodList
        isLoading={props.period.isLoading}
        onSelect={props.period.setSelectedPeriodId}
        periods={props.period.periods}
        selectedPeriodId={props.period.selectedPeriodId}
      />
      <PeriodCreateForm form={form} />
      <Pressable
        disabled={props.period.isLoading}
        onPress={props.onApply}
        style={[
          styles.confirmButton,
          props.period.isLoading && styles.confirmButtonDisabled,
        ]}
      >
        <Text style={styles.confirmButtonText}>Terapkan</Text>
      </Pressable>
    </View>
  );
}

function PeriodList(props: {
  isLoading: boolean;
  onSelect: (periodId: string) => void;
  periods: PayrollPeriod[];
  selectedPeriodId: string;
}) {
  if (props.isLoading && props.periods.length === 0) {
    return <Text style={styles.periodEmptyText}>Memuat periode...</Text>;
  }

  if (props.periods.length === 0) {
    return <Text style={styles.periodEmptyText}>Belum ada periode.</Text>;
  }

  return (
    <View>
      <Text style={styles.periodGroupTitle}>Periode Gajian</Text>
      <PeriodListItems {...props} />
    </View>
  );
}

function PeriodListItems(props: {
  onSelect: (periodId: string) => void;
  periods: PayrollPeriod[];
  selectedPeriodId: string;
}) {
  return (
    <View style={styles.periodList}>
      {props.periods.map(period => (
        <PeriodOption
          isActive={period.id === props.selectedPeriodId}
          key={period.id}
          label={period.name || period.label}
          meta={period.label}
          onPress={() => props.onSelect(period.id)}
        />
      ))}
    </View>
  );
}

function PeriodCreateForm(props: { form: ReturnType<typeof usePeriodCreateForm> }) {
  return (
    <View style={styles.periodCreateBox}>
      <Text style={styles.periodGroupTitle}>Buat Periode Baru</Text>
      <PeriodNameInput form={props.form} />
      <PeriodDateInputs form={props.form} />
      <PeriodFormMessage message={props.form.errorMessage} />
      <PeriodCreateButton form={props.form} />
    </View>
  );
}

function PeriodNameInput(props: { form: ReturnType<typeof usePeriodCreateForm> }) {
  return (
    <TextInput
      onChangeText={props.form.setName}
      placeholder="Nama periode, mis. Gajian Juni"
      placeholderTextColor={colors.slate400}
      style={styles.periodInput}
      value={props.form.name}
    />
  );
}

function PeriodDateInputs(props: { form: ReturnType<typeof usePeriodCreateForm> }) {
  return (
    <View style={styles.periodDateRow}>
      <TextInput
        onChangeText={props.form.setStartDate}
        placeholder="Mulai: YYYY-MM-DD"
        placeholderTextColor={colors.slate400}
        style={[styles.periodInput, styles.periodDateInput]}
        value={props.form.startDate}
      />
      <TextInput
        onChangeText={props.form.setEndDate}
        placeholder="Sampai: YYYY-MM-DD"
        placeholderTextColor={colors.slate400}
        style={[styles.periodInput, styles.periodDateInput]}
        value={props.form.endDate}
      />
    </View>
  );
}

function PeriodFormMessage(props: { message: string }) {
  if (!props.message) {
    return null;
  }

  return <Text style={styles.periodErrorText}>{props.message}</Text>;
}

function PeriodCreateButton(props: { form: ReturnType<typeof usePeriodCreateForm> }) {
  return (
    <Pressable
      disabled={props.form.isSaving}
      onPress={props.form.save}
      style={styles.periodCreateButton}
    >
      <Text style={styles.periodCreateButtonText}>
        {props.form.isSaving ? 'Menyimpan...' : 'Tambah Periode'}
      </Text>
    </Pressable>
  );
}

function UsagePeriodSheetBody(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  contentProps: ComponentProps<typeof UsagePeriodContent>;
}) {
  return (
    <>
      <SheetHeader
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        title="Pilih Periode 📅"
      />
      <UsagePeriodContent {...props.contentProps} />
    </>
  );
}

function UsagePeriodBottomSheet(props: UsagePeriodBottomSheetProps) {
  return (
    <BottomSheet
      containerStyle={styles.periodSheetContainer}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <UsagePeriodSheetBody
          contentProps={props}
          dragHandleProps={dragHandleProps}
          onClose={props.onClose}
        />
      )}
    </BottomSheet>
  );
}

function FloatingAddButton(props: { onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.floatingAddButton}>
      <Text style={styles.floatingAddText}>+</Text>
    </Pressable>
  );
}

function AddSheetOverlay(props: DashboardSheetsProps) {
  return (
    <AddTransactionSheet
      onChanged={props.onDashboardChanged}
      onClose={props.onCloseAddSheet}
      visible={props.isAddSheetVisible}
    />
  );
}

function DashboardSheets(props: DashboardSheetsProps) {
  return (
    <>
      <LimitDetailBottomSheet
        month={props.apiMonth}
        onChanged={props.onDashboardChanged}
        onClose={props.onCloseLimitDetail}
        periodId={props.periodId}
        visible={props.isLimitDetailVisible}
      />
      <AddSheetOverlay {...props} />
    </>
  );
}

function DashboardContent(props: DashboardContentProps) {
  return (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={styles.pageContent}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={props.onRefresh}
          refreshing={props.isRefreshing}
          tintColor={colors.primary}
        />
      }
      style={styles.pageScroll}
    >
      <DashboardHeader
        onLogout={props.onLogout}
        onUpdateUser={props.onUpdateUser}
        user={props.user}
      />
      <DashboardBodySections {...props} />
    </ScrollView>
  );
}

function DashboardBodySections(props: DashboardContentProps) {
  return (
    <>
      <DashboardWalletAssets
        dashboardSummary={props.dashboardSummary}
        isLoading={props.isRefreshing}
        onChanged={props.onRefresh}
      />
      <DashboardMiddleSections {...props} />
      <DashboardFooterSections {...props} />
    </>
  );
}

function DashboardMiddleSections(props: DashboardContentProps) {
  return (
    <>
      <DashboardSummaryCards
        apiMonth={props.apiMonth}
        dashboardSummary={props.dashboardSummary}
        isLoading={props.isRefreshing}
        onOpenHistory={props.onOpenFullHistory}
        periodId={props.periodId}
        periodLabel={props.filterLabel}
      />
      <DashboardUsageChart
        apiMonth={props.apiMonth}
        chartAnimationKey={props.chartAnimationKey}
        dashboardSummary={props.dashboardSummary}
        filterLabel={props.filterLabel}
        isLoading={props.isRefreshing}
        onOpenUsagePeriod={props.onOpenUsagePeriod}
        periodId={props.periodId}
      />
    </>
  );
}

function DashboardFooterSections(props: DashboardContentProps) {
  return (
    <>
      <DashboardSpendingLimit
        budgetRefreshKey={props.budgetRefreshKey}
        dashboardSummary={props.dashboardSummary}
        isLoading={props.isRefreshing}
        month={props.apiMonth}
        onOpenLimitDetail={props.onOpenLimitDetail}
        periodId={props.periodId}
      />
      <DashboardHistorySection {...props} />
    </>
  );
}

function DashboardHistorySection(props: DashboardContentProps) {
  return (
    <DashboardHistory
      availablePeriod={props.availablePeriod}
      histories={props.historyItems}
      historyMonth={props.historyMonth}
      historyMonthLabel={props.historyMonthLabel}
      historyPeriod={props.historyPeriod}
      isFullHistoryVisible={props.isFullHistoryVisible}
      isLoading={props.isRefreshing}
      onChanged={props.onChanged}
      onCloseFullHistory={props.onCloseFullHistory}
      onOpenFullHistory={() => props.onOpenFullHistory()}
      onSelectHistoryFilter={props.onSelectHistoryFilter}
      periodId={props.historyPeriodId}
      selectedHistoryFilter={props.selectedHistoryFilter}
      selectedHistoryWalletId={props.selectedHistoryWalletId}
    />
  );
}

function DashboardReloadState(props: {
  isRefreshing: boolean;
  message: string;
  onRefresh: () => void;
}) {
  return (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={styles.reloadState}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={props.onRefresh}
          refreshing={props.isRefreshing}
          tintColor={colors.primary}
        />
      }
    >
      <DashboardReloadContent {...props} />
    </ScrollView>
  );
}

function DashboardReloadContent(props: {
  isRefreshing: boolean;
  message: string;
  onRefresh: () => void;
}) {
  return (
    <Pressable onPress={props.onRefresh} style={styles.reloadTapArea}>
      <Text style={styles.reloadIcon}>↻</Text>
      <Text style={styles.reloadTitle}>Data belum bisa dimuat</Text>
      <Text style={styles.reloadText}>{props.message}</Text>
      <Text style={styles.reloadButton}>
        {props.isRefreshing ? 'Memuat ulang...' : 'Tap untuk refresh'}
      </Text>
    </Pressable>
  );
}

function useSheetVisibilityState() {
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [isFullHistoryVisible, setFullHistoryVisible] = useState(false);
  const [isLimitDetailVisible, setLimitDetailVisible] = useState(false);
  const [isUsagePeriodVisible, setUsagePeriodVisible] = useState(false);

  return {
    isAddSheetVisible,
    isFullHistoryVisible,
    isLimitDetailVisible,
    isUsagePeriodVisible,
    setAddSheetVisible,
    setFullHistoryVisible,
    setLimitDetailVisible,
    setUsagePeriodVisible,
  };
}

function useHistoryFilterState(setFullHistoryVisible: (value: boolean) => void) {
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState<HistoryFilter>(
    'Semua',
  );
  const [selectedHistoryWalletId, setSelectedHistoryWalletId] = useState('all');
  const openFullHistory = (filter: HistoryFilter = 'Semua', walletId = 'all') => {
    setSelectedHistoryFilter(filter);
    setSelectedHistoryWalletId(walletId);
    setFullHistoryVisible(true);
  };

  return {
    openFullHistory,
    selectedHistoryFilter,
    selectedHistoryWalletId,
    setSelectedHistoryFilter,
  };
}

function useDashboardSheetState() {
  const visibility = useSheetVisibilityState();
  const history = useHistoryFilterState(visibility.setFullHistoryVisible);

  return {
    ...visibility,
    selectedHistoryFilter: history.selectedHistoryFilter,
    selectedHistoryWalletId: history.selectedHistoryWalletId,
    ...useDashboardSheetActions({
      ...visibility,
      openFullHistory: history.openFullHistory,
      setSelectedHistoryFilter: history.setSelectedHistoryFilter,
    }),
  };
}

function useDashboardSheetActions(params: {
  openFullHistory: (filter?: HistoryFilter) => void;
  setAddSheetVisible: (value: boolean) => void;
  setFullHistoryVisible: (value: boolean) => void;
  setLimitDetailVisible: (value: boolean) => void;
  setSelectedHistoryFilter: (filter: HistoryFilter) => void;
  setUsagePeriodVisible: (value: boolean) => void;
}) {
  return {
    ...getDashboardSheetCloseActions(params),
    ...getDashboardSheetOpenActions(params),
    onSelectHistoryFilter: params.setSelectedHistoryFilter,
  };
}

function getDashboardSheetCloseActions(params: {
  setAddSheetVisible: (value: boolean) => void;
  setFullHistoryVisible: (value: boolean) => void;
  setLimitDetailVisible: (value: boolean) => void;
  setUsagePeriodVisible: (value: boolean) => void;
}) {
  return {
    onCloseAddSheet: () => params.setAddSheetVisible(false),
    onCloseFullHistory: () => params.setFullHistoryVisible(false),
    onCloseLimitDetail: () => params.setLimitDetailVisible(false),
    onCloseUsagePeriod: () => params.setUsagePeriodVisible(false),
  };
}

function getDashboardSheetOpenActions(params: {
  openFullHistory: (filter?: HistoryFilter) => void;
  setAddSheetVisible: (value: boolean) => void;
  setLimitDetailVisible: (value: boolean) => void;
  setUsagePeriodVisible: (value: boolean) => void;
}) {
  return {
    onOpenAddSheet: () => params.setAddSheetVisible(true),
    onOpenFullHistory: params.openFullHistory,
    onOpenLimitDetail: () => params.setLimitDetailVisible(true),
    onOpenUsagePeriod: () => params.setUsagePeriodVisible(true),
  };
}

function usePeriodState(initialApiMonth = getCurrentApiMonth()) {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getMonthLabel(initialApiMonth),
  );
  const [selectedYear, setSelectedYear] = useState(getYearLabel(initialApiMonth));
  const [isLoading, setLoading] = useState(false);

  usePeriodOptionsLoader(setPeriods, setSelectedPeriodId, setLoading);

  return {
    isLoading,
    periods,
    selectedPeriodId,
    selectedMonth,
    selectedYear,
    setLoading,
    setPeriods,
    setSelectedPeriodId,
    setSelectedMonth,
    setSelectedYear,
  };
}

function usePeriodCreateForm(
  onCreatePeriod: UsagePeriodContentProps['onCreatePeriod'],
) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(getTodayInputDate());
  const [endDate, setEndDate] = useState(getNextMonthInputDate());
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setSaving] = useState(false);

  return getPeriodCreateFormState({
    endDate,
    errorMessage,
    isSaving,
    name,
    onCreatePeriod,
    setEndDate,
    setErrorMessage,
    setName,
    setSaving,
    setStartDate,
    startDate,
  });
}

function getPeriodCreateFormState(params: {
  endDate: string;
  errorMessage: string;
  isSaving: boolean;
  name: string;
  onCreatePeriod: UsagePeriodContentProps['onCreatePeriod'];
  setEndDate: (value: string) => void;
  setErrorMessage: (value: string) => void;
  setName: (value: string) => void;
  setSaving: (value: boolean) => void;
  setStartDate: (value: string) => void;
  startDate: string;
}) {
  return {
    endDate: params.endDate,
    errorMessage: params.errorMessage,
    isSaving: params.isSaving,
    name: params.name,
    save: () => savePeriodForm(params),
    setEndDate: params.setEndDate,
    setName: params.setName,
    setStartDate: params.setStartDate,
    startDate: params.startDate,
  };
}

async function savePeriodForm(params: {
  endDate: string;
  name: string;
  onCreatePeriod: UsagePeriodContentProps['onCreatePeriod'];
  setEndDate: (value: string) => void;
  setErrorMessage: (value: string) => void;
  setName: (value: string) => void;
  setSaving: (value: boolean) => void;
  setStartDate: (value: string) => void;
  startDate: string;
}) {
  if (!validatePeriodForm(params)) {
    return;
  }

  params.setSaving(true);
  params.setErrorMessage('');
  await submitPeriodForm(params);
}

async function submitPeriodForm(params: Parameters<typeof savePeriodForm>[0]) {
  try {
    await runPeriodSave(params);
    resetPeriodForm(params);
  } catch {
    params.setErrorMessage('Periode belum bisa dibuat. Coba lagi sebentar ya.');
  } finally {
    params.setSaving(false);
  }
}

function validatePeriodForm(params: {
  endDate: string;
  setErrorMessage: (value: string) => void;
  startDate: string;
}) {
  if (isValidPeriodInput(params.startDate, params.endDate)) {
    return true;
  }

  params.setErrorMessage(
    'Isi tanggal mulai dan selesai dengan format YYYY-MM-DD.',
  );

  return false;
}

async function runPeriodSave(params: {
  endDate: string;
  name: string;
  onCreatePeriod: UsagePeriodContentProps['onCreatePeriod'];
  startDate: string;
}) {
  await params.onCreatePeriod({
    endDate: params.endDate,
    name: params.name.trim() || undefined,
    startDate: params.startDate,
  });
}

function resetPeriodForm(params: {
  setEndDate: (value: string) => void;
  setName: (value: string) => void;
  setStartDate: (value: string) => void;
}) {
  params.setName('');
  params.setStartDate(getTodayInputDate());
  params.setEndDate(getNextMonthInputDate());
}

function isValidPeriodInput(startDate: string, endDate: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
    || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return false;
  }

  return new Date(startDate).getTime() <= new Date(endDate).getTime();
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function getNextMonthInputDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);

  return date.toISOString().slice(0, 10);
}

function getDashboardPeriod(period: PeriodState) {
  const selectedPeriod = period.periods.find(
    item => item.id === period.selectedPeriodId,
  );
  const monthIndex = getMonthNumber(period.selectedMonth);

  return {
    apiMonth: `${period.selectedYear}-${String(monthIndex).padStart(2, '0')}`,
    label: selectedPeriod?.label ?? `${period.selectedMonth} ${period.selectedYear}`,
    periodId: selectedPeriod?.id,
  };
}

function usePeriodOptionsLoader(
  setPeriods: (periods: PayrollPeriod[]) => void,
  setSelectedPeriodId: (periodId: string) => void,
  setLoading: (value: boolean) => void,
) {
  useEffect(() => {
    loadPeriodOptions(setPeriods, setSelectedPeriodId, setLoading)
      .catch(() => undefined);
  }, [setLoading, setPeriods, setSelectedPeriodId]);
}

async function loadPeriodOptions(
  setPeriods: (periods: PayrollPeriod[]) => void,
  setSelectedPeriodId: (periodId: string) => void,
  setLoading: (value: boolean) => void,
) {
  const token = await getAuthToken();

  if (!token) {
    return;
  }

  setLoading(true);
  try {
    const response = await getPeriods(token);
    const periods = response.data;
    const currentPeriod = periods.find(period => period.isCurrent) ?? periods[0];

    setPeriods(periods);
    setSelectedPeriodId(currentPeriod?.id ?? '');
  } finally {
    setLoading(false);
  }
}

function UsagePeriodOverlay(props: {
  availablePeriod?: DashboardSummary['availablePeriod'];
  period: PeriodState;
  sheets: DashboardSheetState;
}) {
  return (
    <UsagePeriodBottomSheet
      onApply={props.sheets.onCloseUsagePeriod}
      onCreatePeriod={payload => createAndSelectPeriod(props.period, payload)}
      onClose={props.sheets.onCloseUsagePeriod}
      period={props.period}
      visible={props.sheets.isUsagePeriodVisible}
    />
  );
}

async function createAndSelectPeriod(
  period: PeriodState,
  payload: Parameters<UsagePeriodContentProps['onCreatePeriod']>[0],
) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Missing token');
  }

  period.setLoading(true);
  try {
    const created = await createPeriod(token, payload);
    const response = await getPeriods(token);
    period.setPeriods(response.data);
    period.setSelectedPeriodId(created.data.id);
  } finally {
    period.setLoading(false);
  }
}

function getCurrentApiMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getMonthLabel(apiMonth: string) {
  const monthIndex = Number(apiMonth.slice(5, 7)) - 1;

  return monthOptions[monthIndex] ?? monthOptions[0];
}

function getYearLabel(apiMonth: string) {
  return apiMonth.slice(0, 4);
}

function getMonthNumber(monthLabel: string) {
  return monthOptions.indexOf(
    monthLabel as (typeof monthOptions)[number],
  ) + 1;
}

async function fetchDashboardSummary(month: string, periodId?: string) {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const response = await getDashboardSummary(token, month, 'all', periodId);

  return response.data;
}

async function fetchRecentHistoryItems(month: string, periodId?: string) {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  const response = await getTransactions(token, {
    limit: 4,
    month,
    page: 1,
    periodId,
  });

  return response.data.map(mapTransactionToHistoryItem);
}

function useDashboardData(month: string, periodId?: string) {
  const state = useDashboardLocalState();
  const refreshDashboard = () => (
    loadDashboardData(month, periodId, getDashboardDataSetters(state))
  );
  useInitialDashboardRefresh(refreshDashboard, month, periodId);

  return { ...state, refreshDashboard };
}

function useDashboardLocalState() {
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);
  const [chartAnimationKey, setChartAnimationKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);

  return {
    budgetRefreshKey,
    chartAnimationKey,
    dashboardSummary,
    errorMessage,
    historyItems,
    isRefreshing,
    setBudgetRefreshKey,
    setChartAnimationKey,
    setDashboardSummary,
    setErrorMessage,
    setHistoryItems,
    setRefreshing,
  };
}

function getDashboardDataSetters(
  state: ReturnType<typeof useDashboardLocalState>,
) {
  return {
    setBudgetRefreshKey: state.setBudgetRefreshKey,
    setChartAnimationKey: state.setChartAnimationKey,
    setDashboardSummary: state.setDashboardSummary,
    setErrorMessage: state.setErrorMessage,
    setHistoryItems: state.setHistoryItems,
    setRefreshing: state.setRefreshing,
  };
}

function useInitialDashboardRefresh(
  refreshDashboard: () => Promise<void>,
  month: string,
  periodId?: string,
) {
  useEffect(() => {
    refreshDashboard().catch(() => undefined);
  }, [month, periodId]);
}

async function loadDashboardData(
  month: string,
  periodId: string | undefined,
  setters: DashboardDataSetters,
) {
  setters.setRefreshing(true);

  try {
    const [summary, historyItems] = await fetchDashboardHomeData(month, periodId);
    setters.setDashboardSummary(summary);
    setters.setHistoryItems(historyItems);
    setters.setBudgetRefreshKey(key => key + 1);
    setters.setChartAnimationKey(key => key + 1);
    setters.setErrorMessage('');
  } catch (error) {
    if (isSessionExpiredError(error)) {
      return;
    }

    setters.setDashboardSummary(null);
    setters.setErrorMessage(getDashboardErrorMessage(error));
  } finally {
    setters.setRefreshing(false);
  }
}

async function fetchDashboardHomeData(month: string, periodId?: string) {
  const [summary, historyItems] = await Promise.all([
    fetchDashboardSummary(month, periodId),
    fetchRecentHistoryItems(month, periodId).catch(() => []),
  ]);

  return [summary, historyItems] as const;
}

function isSessionExpiredError(error: unknown) {
  return error instanceof Error && (
    error.message === 'Sesi sudah habis' || error.message === 'Unauthorized'
  );
}

function getDashboardErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Koneksi ke server sedang bermasalah.';
}

function DashboardMainContent(props: DashboardMainContentProps) {
  return (
    <View style={styles.mainContent}>
      <DashboardContent {...getDashboardContentProps(props)} />
      <FloatingAddButton onPress={props.sheets.onOpenAddSheet} />
    </View>
  );
}

function getDashboardContentProps(
  props: DashboardMainContentProps,
): DashboardContentProps {
  return {
    ...getDashboardContentDataProps(props),
    ...getDashboardContentActionProps(props),
    onLogout: props.onLogout,
    onUpdateUser: props.onUpdateUser,
    user: props.user,
  };
}

function getDashboardContentDataProps(props: DashboardMainContentProps) {
  return {
    availablePeriod: props.dashboardData.dashboardSummary?.availablePeriod,
    apiMonth: props.apiMonth,
    budgetRefreshKey: props.dashboardData.budgetRefreshKey,
    chartAnimationKey: props.dashboardData.chartAnimationKey,
    dashboardSummary: props.dashboardData.dashboardSummary,
    filterLabel: props.filterLabel,
    historyItems: props.dashboardData.historyItems,
    historyMonth: props.historyPeriodFilter.apiMonth,
    historyMonthLabel: props.historyPeriodFilter.label,
    historyPeriodId: props.historyPeriodFilter.periodId,
    historyPeriod: props.historyPeriod,
    isFullHistoryVisible: props.sheets.isFullHistoryVisible,
    isRefreshing: props.dashboardData.isRefreshing,
    periodId: props.periodId,
    selectedHistoryFilter: props.sheets.selectedHistoryFilter,
    selectedHistoryWalletId: props.sheets.selectedHistoryWalletId,
  };
}

function getDashboardContentActionProps(props: DashboardMainContentProps) {
  return {
    onChanged: props.dashboardData.refreshDashboard,
    onCloseFullHistory: props.sheets.onCloseFullHistory,
    onOpenFullHistory: props.sheets.onOpenFullHistory,
    onOpenLimitDetail: props.sheets.onOpenLimitDetail,
    onOpenUsagePeriod: props.sheets.onOpenUsagePeriod,
    onRefresh: props.dashboardData.refreshDashboard,
    onSelectHistoryFilter: props.sheets.onSelectHistoryFilter,
  };
}

function DashboardScreen({ onLogout, onUpdateUser, user }: DashboardScreenProps) {
  const sheets = useDashboardSheetState();
  const period = usePeriodState();
  const historyPeriod = usePeriodState();
  const dashboardPeriod = getDashboardPeriod(period);
  const dashboardData = useDashboardData(
    dashboardPeriod.apiMonth,
    dashboardPeriod.periodId,
  );

  return (
    <DashboardScreenShell
      dashboardData={dashboardData}
      historyPeriod={historyPeriod}
      periodFilter={dashboardPeriod}
      onLogout={onLogout}
      onUpdateUser={onUpdateUser}
      period={period}
      sheets={sheets}
      user={user}
    />
  );
}

function DashboardScreenShell(props: DashboardScreenShellProps) {
  if (props.dashboardData.errorMessage) {
    return (
      <DashboardReloadState
        isRefreshing={props.dashboardData.isRefreshing}
        message={props.dashboardData.errorMessage}
        onRefresh={props.dashboardData.refreshDashboard}
      />
    );
  }

  return <DashboardSuccessShell {...props} />;
}

function DashboardSuccessShell(props: DashboardScreenShellProps) {
  const historyPeriod = getDashboardPeriod(props.historyPeriod);

  return (
    <View style={styles.container}>
      <DashboardSuccessMainContent {...props} historyPeriodFilter={historyPeriod} />
      <DashboardSuccessOverlays
        availablePeriod={props.dashboardData.dashboardSummary?.availablePeriod}
        dashboardData={props.dashboardData}
        historyPeriodFilter={historyPeriod}
        historyPeriodState={props.historyPeriod}
        period={props.period}
        periodFilter={props.periodFilter}
        sheets={props.sheets}
      />
    </View>
  );
}

function DashboardSuccessMainContent(
  props: DashboardScreenShellProps & { historyPeriodFilter: DashboardPeriod },
) {
  return (
    <DashboardMainContent
      dashboardData={props.dashboardData}
      apiMonth={props.periodFilter.apiMonth}
      filterLabel={props.periodFilter.label}
      historyPeriod={props.historyPeriod}
      historyPeriodFilter={props.historyPeriodFilter}
      periodId={props.periodFilter.periodId}
      onLogout={props.onLogout}
      onUpdateUser={props.onUpdateUser}
      sheets={props.sheets}
      user={props.user}
    />
  );
}

function DashboardSuccessOverlays(props: DashboardSuccessOverlaysProps) {
  return (
    <>
      <DashboardSuccessSheets
        availablePeriod={props.availablePeriod}
        dashboardData={props.dashboardData}
        historyPeriodFilter={props.historyPeriodFilter}
        historyPeriodState={props.historyPeriodState}
        periodFilter={props.periodFilter}
        sheets={props.sheets}
      />
      <UsagePeriodOverlay
        availablePeriod={props.availablePeriod}
        period={props.period}
        sheets={props.sheets}
      />
    </>
  );
}

function DashboardSuccessSheets(props: DashboardSuccessSheetsProps) {
  return (
    <DashboardSheets
      {...props.sheets}
      apiMonth={props.periodFilter.apiMonth}
      onDashboardChanged={props.dashboardData.refreshDashboard}
      periodId={props.periodFilter.periodId}
    />
  );
}

export default DashboardScreen;
