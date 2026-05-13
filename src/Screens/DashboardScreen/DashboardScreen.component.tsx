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
  View,
} from 'react-native';

import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../Components/BottomSheet';
import AddTransactionSheet from '../../Navigation/AppTabs/AddTransactionSheet.component';
import {
  getDashboardSummary,
  getTransactions,
  type DashboardSummary,
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
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.periodOption,
        props.isActive && styles.periodOptionActive,
      ]}
    >
      <Text
        style={[
          styles.periodOptionText,
          props.isActive && styles.periodOptionTextActive,
        ]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

function PeriodOptionGrid(props: {
  options: readonly string[];
  selectedOption: string;
  onSelectOption: (option: string) => void;
}) {
  return (
    <View style={styles.periodOptionGrid}>
      {props.options.map(option => (
        <PeriodOption
          isActive={option === props.selectedOption}
          key={option}
          label={option}
          onPress={() => props.onSelectOption(option)}
        />
      ))}
    </View>
  );
}

function PeriodGroup(props: {
  onSelectOption: (option: string) => void;
  options: readonly string[];
  selectedOption: string;
  title: string;
}) {
  return (
    <>
      <Text style={styles.periodGroupTitle}>{props.title}</Text>
      <PeriodOptionGrid
        onSelectOption={props.onSelectOption}
        options={props.options}
        selectedOption={props.selectedOption}
      />
    </>
  );
}

function UsagePeriodContent(props: UsagePeriodContentProps) {
  return (
    <View style={styles.periodContent}>
      <PeriodGroup
        onSelectOption={props.setSelectedMonth}
        options={props.monthOptions}
        selectedOption={props.selectedMonth}
        title="Bulan"
      />
      <PeriodGroup
        onSelectOption={props.setSelectedYear}
        options={props.yearOptions}
        selectedOption={props.selectedYear}
        title="Tahun"
      />
      <Pressable onPress={props.onApply} style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Terapkan</Text>
      </Pressable>
    </View>
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
        dashboardSummary={props.dashboardSummary}
        onOpenHistory={props.onOpenFullHistory}
        periodLabel={props.filterLabel}
      />
      <DashboardUsageChart
        chartAnimationKey={props.chartAnimationKey}
        dashboardSummary={props.dashboardSummary}
        filterLabel={props.filterLabel}
        onOpenUsagePeriod={props.onOpenUsagePeriod}
      />
    </>
  );
}

function DashboardFooterSections(props: DashboardContentProps) {
  return (
    <>
      <DashboardSpendingLimit
        dashboardSummary={props.dashboardSummary}
        onOpenLimitDetail={props.onOpenLimitDetail}
      />
      <DashboardHistory
        availablePeriod={props.availablePeriod}
        histories={props.historyItems}
        historyMonth={props.historyMonth}
        historyMonthLabel={props.historyMonthLabel}
        historyPeriod={props.historyPeriod}
        isFullHistoryVisible={props.isFullHistoryVisible}
        onChanged={props.onChanged}
        onCloseFullHistory={props.onCloseFullHistory}
        onOpenFullHistory={() => props.onOpenFullHistory()}
        onSelectHistoryFilter={props.onSelectHistoryFilter}
        selectedHistoryFilter={props.selectedHistoryFilter}
      />
    </>
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
  const openFullHistory = (filter: HistoryFilter = 'Semua') => {
    setSelectedHistoryFilter(filter);
    setFullHistoryVisible(true);
  };

  return { openFullHistory, selectedHistoryFilter, setSelectedHistoryFilter };
}

function useDashboardSheetState() {
  const visibility = useSheetVisibilityState();
  const history = useHistoryFilterState(visibility.setFullHistoryVisible);

  return {
    ...visibility,
    selectedHistoryFilter: history.selectedHistoryFilter,
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
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getMonthLabel(initialApiMonth),
  );
  const [selectedYear, setSelectedYear] = useState(getYearLabel(initialApiMonth));

  return {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  };
}

function getDashboardPeriod(period: PeriodState) {
  const monthIndex = getMonthNumber(period.selectedMonth);

  return {
    apiMonth: `${period.selectedYear}-${String(monthIndex).padStart(2, '0')}`,
    label: `${period.selectedMonth} ${period.selectedYear}`,
  };
}

function UsagePeriodOverlay(props: {
  availablePeriod?: DashboardSummary['availablePeriod'];
  period: PeriodState;
  sheets: DashboardSheetState;
}) {
  const options = getPeriodOptions(
    props.availablePeriod,
    props.period.selectedYear,
  );
  const selectYear = getSelectPeriodYearHandler(props.period, options);

  return (
    <UsagePeriodBottomSheet
      monthOptions={options.monthOptions}
      onApply={props.sheets.onCloseUsagePeriod}
      onClose={props.sheets.onCloseUsagePeriod}
      selectedMonth={props.period.selectedMonth}
      selectedYear={props.period.selectedYear}
      setSelectedMonth={props.period.setSelectedMonth}
      setSelectedYear={selectYear}
      visible={props.sheets.isUsagePeriodVisible}
      yearOptions={options.yearOptions}
    />
  );
}

function getSelectPeriodYearHandler(
  period: PeriodState,
  options: ReturnType<typeof getPeriodOptions>,
) {
  return (year: string) => {
    const monthOptionsForYear = getAvailableMonthOptions(options.range, year);
    period.setSelectedYear(year);

    if (!monthOptionsForYear.some(month => month === period.selectedMonth)) {
      period.setSelectedMonth(monthOptionsForYear[0] ?? monthOptions[0]);
    }
  };
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

function getPeriodOptions(
  availablePeriod: DashboardSummary['availablePeriod'] | undefined,
  selectedYear: string,
) {
  const range = getAvailablePeriodRange(availablePeriod);

  return getPeriodOptionsFromRange(range, selectedYear);
}

function getPeriodOptionsFromRange(
  range: { maxMonth: string; minMonth: string },
  selectedYear: string,
) {

  return {
    monthOptions: getAvailableMonthOptions(range, selectedYear),
    range,
    yearOptions: getAvailableYearOptions(range),
  };
}

function getAvailablePeriodRange(
  availablePeriod: DashboardSummary['availablePeriod'] | undefined,
) {
  const fallback = getCurrentApiMonth();

  return {
    maxMonth: availablePeriod?.maxMonth ?? fallback,
    minMonth: availablePeriod?.minMonth ?? fallback,
  };
}

function getAvailableYearOptions(range: {
  maxMonth: string;
  minMonth: string;
}) {
  const minYear = Number(range.minMonth.slice(0, 4));
  const maxYear = Number(range.maxMonth.slice(0, 4));

  return Array.from(
    { length: Math.max(maxYear - minYear + 1, 1) },
    (_, index) => String(minYear + index),
  );
}

function getAvailableMonthOptions(
  range: { maxMonth: string; minMonth: string },
  selectedYear: string,
) {
  return monthOptions.filter((monthLabel, index) => {
    const apiMonth = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;

    return apiMonth >= range.minMonth && apiMonth <= range.maxMonth;
  });
}

async function fetchDashboardSummary(month: string) {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const response = await getDashboardSummary(token, month);

  return response.data;
}

async function fetchRecentHistoryItems(month: string) {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  const response = await getTransactions(token, { limit: 4, month, page: 1 });

  return response.data.map(mapTransactionToHistoryItem);
}

function useDashboardData(month: string) {
  const state = useDashboardLocalState();
  const refreshDashboard = () => (
    loadDashboardData(month, getDashboardDataSetters(state))
  );
  useInitialDashboardRefresh(refreshDashboard, month);

  return { ...state, refreshDashboard };
}

function useDashboardLocalState() {
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);
  const [chartAnimationKey, setChartAnimationKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);

  return {
    chartAnimationKey,
    dashboardSummary,
    errorMessage,
    historyItems,
    isRefreshing,
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
) {
  useEffect(() => {
    refreshDashboard().catch(() => undefined);
  }, [month]);
}

async function loadDashboardData(month: string, setters: DashboardDataSetters) {
  setters.setRefreshing(true);

  try {
    const [summary, historyItems] = await fetchDashboardHomeData(month);
    setters.setDashboardSummary(summary);
    setters.setHistoryItems(historyItems);
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

async function fetchDashboardHomeData(month: string) {
  const [summary, historyItems] = await Promise.all([
    fetchDashboardSummary(month),
    fetchRecentHistoryItems(month).catch(() => []),
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
    chartAnimationKey: props.dashboardData.chartAnimationKey,
    dashboardSummary: props.dashboardData.dashboardSummary,
    filterLabel: props.filterLabel,
    historyItems: props.dashboardData.historyItems,
    historyMonth: props.historyPeriodFilter.apiMonth,
    historyMonthLabel: props.historyPeriodFilter.label,
    historyPeriod: props.historyPeriod,
    isFullHistoryVisible: props.sheets.isFullHistoryVisible,
    isRefreshing: props.dashboardData.isRefreshing,
    selectedHistoryFilter: props.sheets.selectedHistoryFilter,
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
  const dashboardData = useDashboardData(dashboardPeriod.apiMonth);

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
      filterLabel={props.periodFilter.label}
      historyPeriod={props.historyPeriod}
      historyPeriodFilter={props.historyPeriodFilter}
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
    />
  );
}

export default DashboardScreen;
