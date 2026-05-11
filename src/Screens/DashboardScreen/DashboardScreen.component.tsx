import {
  type ComponentProps,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../Components/BottomSheet';
import { Snackbar } from '../../Components/Snackbar';
import AddTransactionSheet from '../../Navigation/AppTabs/AddTransactionSheet.component';
import {
  copyPreviousBudgets,
  createBudget,
  createCategory,
  createWallet,
  deleteBudget,
  deleteWallet,
  getBudgets,
  getCategories,
  getDashboardSummary,
  getTransactions,
  getWallets,
  updateBudget,
  updateWallet,
  type AuthUser,
  type BudgetItem,
  type BudgetPreviousMonth,
  type BudgetsResponse,
  type Category,
  type CreateCategoryPayload,
  type CreateBudgetPayload,
  type CreateWalletPayload,
  type DashboardChartCategory,
  type DashboardSummary,
  type Transaction,
  type TransactionType,
  type UpdateWalletPayload,
  type Wallet,
  } from '../../Services';
import { colors } from '../../Theme';
import { getAuthToken } from '../../Utils/authStorage';

import styles from './DashboardScreen.styles';

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
type SaveLimitParams = {
  bumpCategoryRefreshKey: () => void;
  month: string;
  onChanged: () => void;
  setLimitState: SetLimitState;
  setSnackbarMessage: (message: string) => void;
  setView: (view: LimitSheetView) => void;
};

type DashboardSheetsProps = {
  availablePeriod?: DashboardSummary['availablePeriod'];
  apiMonth: string;
  historyPeriod: ReturnType<typeof usePeriodState>;
  historyMonth: string;
  historyMonthLabel: string;
  isFullHistoryVisible: boolean;
  isAddSheetVisible: boolean;
  isLimitDetailVisible: boolean;
  isWalletSheetVisible: boolean;
  onDashboardChanged: () => void;
  onCloseAddSheet: () => void;
  onCloseFullHistory: () => void;
  onCloseLimitDetail: () => void;
  onCloseWalletSheet: () => void;
  onSelectHistoryFilter: (filter: HistoryFilter) => void;
  selectedHistoryFilter: HistoryFilter;
  totalWalletAmount: string;
  usagePeriodLabel: string;
};
type DashboardContentProps = {
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  filterLabel: string;
  historyItems: HistoryItemData[];
  isRefreshing: boolean;
  onOpenFullHistory: (filter?: HistoryFilter) => void;
  onOpenLimitDetail: () => void;
  onOpenUsagePeriod: () => void;
  onOpenWalletSheet: () => void;
  onRefresh: () => void;
  onLogout?: () => void;
  user?: AuthUser | null;
};
type SummaryCardsProps = {
  dashboardSummary: DashboardSummary | null;
  onOpenHistory: (filter: HistoryFilter) => void;
  periodLabel: string;
};
type DashboardMainContentProps = {
  dashboardData: ReturnType<typeof useDashboardData>;
  filterLabel: string;
  onLogout?: () => void;
  sheets: ReturnType<typeof useDashboardSheetState>;
  user?: AuthUser | null;
};
type DashboardScreenProps = {
  onLogout?: () => void;
  user?: AuthUser | null;
};
type DashboardScreenShellProps = {
  dashboardData: ReturnType<typeof useDashboardData>;
  historyPeriod: ReturnType<typeof usePeriodState>;
  onLogout?: () => void;
  period: ReturnType<typeof usePeriodState>;
  periodFilter: DashboardPeriod;
  sheets: ReturnType<typeof useDashboardSheetState>;
  user?: AuthUser | null;
};
type DashboardSuccessOverlaysProps = {
  availablePeriod?: DashboardSummary['availablePeriod'];
  dashboardData: ReturnType<typeof useDashboardData>;
  historyPeriodFilter: DashboardPeriod;
  historyPeriodState: ReturnType<typeof usePeriodState>;
  period: ReturnType<typeof usePeriodState>;
  periodFilter: DashboardPeriod;
  sheets: ReturnType<typeof useDashboardSheetState>;
};
type DashboardSuccessSheetsProps = {
  availablePeriod?: DashboardSummary['availablePeriod'];
  dashboardData: ReturnType<typeof useDashboardData>;
  historyPeriodFilter: DashboardPeriod;
  historyPeriodState: ReturnType<typeof usePeriodState>;
  periodFilter: DashboardPeriod;
  sheets: ReturnType<typeof useDashboardSheetState>;
};
type LimitSheetView = 'category' | 'create' | 'edit' | 'list';
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
};
type FullHistoryGroupData = {
  id: string;
  title: string;
  transactions: HistoryItemData[];
};
type WalletType = (typeof walletTypes)[number];
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
  setChartAnimationKey: (setter: (key: number) => number) => void;
  setDashboardSummary: (summary: DashboardSummary | null) => void;
  setErrorMessage: (message: string) => void;
  setHistoryItems: (items: HistoryItemData[]) => void;
  setRefreshing: (value: boolean) => void;
};
type DashboardPeriod = {
  apiMonth: string;
  label: string;
};
type LimitDetailSheetContentProps = {
  dragHandleProps: BottomSheetDragHandleProps;
  month: string;
  onChanged: () => void;
  onClose: () => void;
  visible: boolean;
};
type FullHistoryBottomSheetProps = {
  availablePeriod?: DashboardSummary['availablePeriod'];
  month: string;
  monthLabel: string;
  onClose: () => void;
  onSelectFilter: (filter: HistoryFilter) => void;
  period: ReturnType<typeof usePeriodState>;
  selectedFilter: HistoryFilter;
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
type LimitSheetState = ReturnType<typeof useLimitDetailState>;
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
type WalletSheetContentProps = {
  dragHandleProps: BottomSheetDragHandleProps;
  onChanged: () => void;
  onClose: () => void;
  onDeleteWallet: (walletId: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
};
type WalletBottomSheetProps = {
  onChanged: () => void;
  onClose: () => void;
  totalAmount: string;
  visible: boolean;
};
const walletTypes = ['Bank', 'E-Wallet', 'Cash', 'Savings', 'Other'];
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
function Header({ onLogout, user }: DashboardScreenProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerIntro}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>▯</Text>
        </View>
        <View>
          <Text style={styles.hello}>HALO, KAK!</Text>
          <Text style={styles.name}>{user?.name ?? 'Sahabat Cuan'} ✨</Text>
        </View>
      </View>
      <Pressable
        accessibilityLabel="Logout"
        onPress={onLogout}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutIcon}>↪</Text>
        <Text style={styles.logoutText}>Keluar</Text>
      </Pressable>
    </View>
  );
}

function BalanceCard(props: {
  balanceFormatted: string;
  onOpenWalletSheet: () => void;
  selectedWalletName: string;
}) {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balancePattern}>· · ·</Text>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>SISA UANG JAJAN KAMU</Text>
        <Pressable onPress={props.onOpenWalletSheet} style={styles.balanceBadge}>
          <Text style={styles.balanceBadgeText}>{props.selectedWalletName}</Text>
        </Pressable>
      </View>
      <Text style={styles.balanceValue}>{props.balanceFormatted}</Text>
      <Text style={styles.balanceNote}>Semangat menabung! ✨</Text>
    </View>
  );
}

function SummaryCards(props: SummaryCardsProps) {
  return (
    <View style={styles.summaryGrid}>
      <SummaryCard
        icon="↙"
        label="Uang Masuk"
        onPress={() => props.onOpenHistory('Pemasukan')}
        periodLabel={props.periodLabel}
        value={props.dashboardSummary?.income.formatted ?? 'Rp 0'}
        variant="income"
      />
      <SummaryCard
        icon="↗"
        label="Uang Keluar"
        onPress={() => props.onOpenHistory('Pengeluaran')}
        periodLabel={props.periodLabel}
        value={props.dashboardSummary?.expense.formatted ?? 'Rp 0'}
        variant="expense"
      />
    </View>
  );
}

function SummaryIconBox(props: { icon: string; variant: 'income' | 'expense' }) {
  const isIncome = props.variant === 'income';

  return (
    <View
      style={[
        styles.summaryIconBox,
        { backgroundColor: isIncome ? colors.secondary : colors.primary },
      ]}
    >
      <Text style={styles.summaryIcon}>{props.icon}</Text>
    </View>
  );
}

function SummaryCard(props: {
  icon: string;
  label: string;
  onPress: () => void;
  periodLabel: string;
  value: string;
  variant: 'income' | 'expense';
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.chartCard, styles.summaryCard]}
    >
      <SummaryIconBox icon={props.icon} variant={props.variant} />
      <Text style={styles.summaryLabel}>{props.label}</Text>
      <Text style={styles.summaryPeriod}>{props.periodLabel}</Text>
      <Text style={styles.summaryValue}>{props.value}</Text>
    </Pressable>
  );
}

function DonutChart(props: {
  animationKey: number;
  chart?: DashboardSummary['chart'];
}) {
  const progress = useChartAnimationProgress(props.chart, props.animationKey);
  const categories = getNormalizedChartCategories(getChartCategories(props.chart));

  return (
    <View style={styles.chartRing}>
      <ChartSlices progress={progress} slices={categories} />
      <View style={styles.chartCenter}>
        <Text style={styles.chartCenterLabel}>KELUAR</Text>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.72}
          numberOfLines={1}
          style={styles.chartCenterValue}
        >
          {formatCompactRupiah(getChartExpenseTotal(props.chart))}
        </Text>
      </View>
    </View>
  );
}

function ChartSlices(props: {
  progress: number;
  slices: DashboardChartCategory[];
}) {
  const chartGeometry = getChartGeometry();
  const arcSlices = getChartArcSlices(props.slices);

  return (
    <Svg height={chartGeometry.size} width={chartGeometry.size}>
      <ChartSlicesGroup
        arcSlices={arcSlices}
        chartGeometry={chartGeometry}
        progress={props.progress}
      />
    </Svg>
  );
}

function ChartSlicesGroup(props: {
  arcSlices: ReturnType<typeof getChartArcSlices>;
  chartGeometry: ReturnType<typeof getChartGeometry>;
  progress: number;
}) {
  return (
    <>
      <ChartTrack chartGeometry={props.chartGeometry} />
      {props.arcSlices.map(slice => (
        <ChartSliceArc
          chartGeometry={props.chartGeometry}
          color={slice.color}
          key={slice.categoryId}
          progress={props.progress}
          sliceFraction={slice.sliceFraction}
          startFraction={slice.startFraction}
        />
      ))}
    </>
  );
}

function ChartTrack(props: { chartGeometry: ReturnType<typeof getChartGeometry> }) {
  return (
    <Circle
      cx={props.chartGeometry.center}
      cy={props.chartGeometry.center}
      fill="none"
      r={props.chartGeometry.radius}
      stroke="#E8EEF7"
      strokeWidth={props.chartGeometry.strokeWidth}
    />
  );
}

function getChartGeometry() {
  const size = 172;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;

  return {
    center: size / 2,
    circumference: 2 * Math.PI * radius,
    radius,
    size,
    strokeWidth,
  };
}

function getChartArcSlices(categories: DashboardChartCategory[]) {
  return categories.reduce<Array<DashboardChartCategory & {
    sliceFraction: number;
    startFraction: number;
  }>>((accumulator, category) => {
    const startFraction = accumulator.length
      ? accumulator[accumulator.length - 1].startFraction +
        accumulator[accumulator.length - 1].sliceFraction
      : 0;

    accumulator.push({
      ...category,
      sliceFraction: clampPercentage(category.percentage) / 100,
      startFraction,
    });

    return accumulator;
  }, []);
}

function ChartSliceArc(props: {
  chartGeometry: ReturnType<typeof getChartGeometry>;
  color: string;
  progress: number;
  sliceFraction: number;
  startFraction: number;
}) {
  const visibleFraction = getVisibleChartFraction(
    props.progress,
    props.startFraction,
    props.sliceFraction,
  );

  if (visibleFraction <= 0) {
    return null;
  }

  return <Circle {...getChartSliceCircleProps(props, visibleFraction)} />;
}

function CategoryBreakdown(props: { categories: DashboardChartCategory[] }) {
  if (!props.categories.length) {
    return <Text style={styles.chartEmptyText}>Belum ada pengeluaran.</Text>;
  }

  return (
    <View style={styles.categoryList}>
      {props.categories.map(category => (
        <View key={category.categoryId} style={styles.categoryItem}>
          <View
            style={[styles.categoryDot, { backgroundColor: category.color }]}
          />
          <Text style={styles.categoryLabel}>
            {category.name} {formatLimitPercentage(category.percentage)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function useChartAnimationProgress(
  chart: DashboardSummary['chart'] | undefined,
  animationKey: number,
) {
  const animatedProgress = useAnimatedProgressValue();
  const progress = useAnimatedProgressListener(animatedProgress);
  const chartSignature = JSON.stringify(chart?.categories ?? []);

  useChartAnimationRunner(
    animatedProgress,
    animationKey,
    chart?.expenseTotal,
    chartSignature,
  );

  return progress;
}

function useAnimatedProgressValue() {
  const [animatedProgress] = useState(() => new Animated.Value(0));

  return animatedProgress;
}

function useAnimatedProgressListener(animatedProgress: Animated.Value) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const listenerId = animatedProgress.addListener(({ value }) => setProgress(value));

    return () => animatedProgress.removeListener(listenerId);
  }, [animatedProgress]);

  return progress;
}

function useChartAnimationRunner(
  animatedProgress: Animated.Value,
  animationKey: number,
  expenseTotal: number | undefined,
  chartSignature: string,
) {
  useEffect(() => {
    animatedProgress.stopAnimation();
    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, getChartAnimationConfig()).start();
  }, [animatedProgress, animationKey, chartSignature, expenseTotal]);
}

function getChartAnimationConfig() {
  return {
    duration: 1400,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    toValue: 1,
    useNativeDriver: false,
  };
}

function getVisibleChartFraction(
  progress: number,
  startFraction: number,
  sliceFraction: number,
) {
  return Math.max(0, Math.min(progress - startFraction, sliceFraction));
}

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

function getChartStrokeDasharray(circumference: number, sliceFraction: number) {
  const visibleLength = circumference * sliceFraction;
  const hiddenLength = Math.max(circumference - visibleLength, 0);

  return `${visibleLength} ${hiddenLength}`;
}

function getChartStrokeDashOffset(circumference: number, startFraction: number) {
  return circumference * (1 - startFraction);
}

function getChartSliceCircleProps(
  props: Omit<ComponentProps<typeof Circle>, 'cx' | 'cy' | 'r'> & {
    chartGeometry: ReturnType<typeof getChartGeometry>;
    color: string;
    startFraction: number;
  },
  visibleFraction: number,
) {
  const geometry = props.chartGeometry;
  const dashProps = getChartSliceDashProps(
    geometry.circumference,
    props.startFraction,
    visibleFraction,
  );

  return {
    ...getChartSliceCircleShape(geometry),
    fill: 'none' as const,
    rotation: -90,
    stroke: props.color,
    ...dashProps,
    strokeLinecap: 'butt' as const,
    strokeWidth: geometry.strokeWidth,
  };
}

function getChartSliceCircleShape(geometry: ReturnType<typeof getChartGeometry>) {
  return {
    cx: geometry.center,
    cy: geometry.center,
    originX: geometry.center,
    originY: geometry.center,
    r: geometry.radius,
  };
}

function getChartSliceDashProps(
  circumference: number,
  startFraction: number,
  visibleFraction: number,
) {
  return {
    strokeDasharray: getChartStrokeDasharray(circumference, visibleFraction),
    strokeDashoffset: getChartStrokeDashOffset(circumference, startFraction),
  };
}

function getNormalizedChartCategories(categories: DashboardChartCategory[]) {
  const totalAmount = categories.reduce(
    (sum, category) => sum + Math.max(category.amount, 0),
    0,
  );

  if (totalAmount > 0) {
    return normalizeCategoriesByAmount(categories, totalAmount);
  }

  const totalPercentage = categories.reduce(
    (sum, category) => sum + clampPercentage(category.percentage),
    0,
  );

  if (totalPercentage <= 0) {
    return categories;
  }

  return normalizeCategoriesByPercentage(categories, totalPercentage);
}

function normalizeCategoriesByAmount(
  categories: DashboardChartCategory[],
  totalAmount: number,
) {
  return categories.map(category => ({
    ...category,
    percentage: (Math.max(category.amount, 0) / totalAmount) * 100,
  }));
}

function normalizeCategoriesByPercentage(
  categories: DashboardChartCategory[],
  totalPercentage: number,
) {
  return categories.map(category => ({
    ...category,
    percentage: (clampPercentage(category.percentage) / totalPercentage) * 100,
  }));
}

function getChartCategories(chart?: DashboardSummary['chart']) {
  return chart?.categories ?? [];
}

function getChartExpenseTotal(chart?: DashboardSummary['chart']) {
  return chart?.expenseTotal ?? 0;
}

function UsageSectionHeader(props: {
  filterLabel: string;
  onOpenUsagePeriod: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Penggunaan Dompet Ini</Text>
      <Pressable onPress={props.onOpenUsagePeriod}>
        <Text style={styles.sectionLink}>{props.filterLabel}⌄</Text>
      </Pressable>
    </View>
  );
}

function UsageSection(props: {
  chartAnimationKey: number;
  dashboardSummary: DashboardSummary | null;
  filterLabel: string;
  onOpenUsagePeriod: () => void;
}) {
  const chart = props.dashboardSummary?.chart;
  const categories = getChartCategories(chart);

  return (
    <View style={styles.section}>
      <UsageSectionHeader {...props} />
      <View style={styles.chartCard}>
        <DonutChart animationKey={props.chartAnimationKey} chart={chart} />
        <CategoryBreakdown categories={categories} />
      </View>
    </View>
  );
}

function SpendingLimitSection(props: {
  dashboardSummary: DashboardSummary | null;
  onOpenLimitDetail: () => void;
}) {
  const budgetLimit = props.dashboardSummary?.budgetLimit;

  return (
    <View style={styles.limitSection}>
      <Pressable onPress={props.onOpenLimitDetail} style={styles.limitCard}>
        <SpendingLimitHeader percentage={budgetLimit?.percentage ?? 0} />
        <SpendingLimitProgress percentage={budgetLimit?.percentage ?? 0} />
        <SpendingLimitAmount
          limitAmount={budgetLimit?.limitAmount ?? 0}
          usedAmount={budgetLimit?.usedAmount ?? 0}
        />
      </Pressable>
    </View>
  );
}

function SpendingLimitHeader(props: { percentage: number }) {
  return (
    <View style={styles.limitHeader}>
      <View style={styles.limitTitleRow}>
        <Text style={styles.limitIcon}>◎</Text>
        <Text numberOfLines={1} style={styles.limitTitle}>
          Limit Pengeluaran
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.limitBadge}>
        {formatLimitPercentage(props.percentage)}
      </Text>
    </View>
  );
}

function SpendingLimitProgress(props: { percentage: number }) {
  return (
    <View style={styles.limitTrack}>
      <View
        style={[
          styles.limitProgress,
          { width: getLimitWidth(props.percentage) },
        ]}
      />
    </View>
  );
}

function SpendingLimitAmount(props: { limitAmount: number; usedAmount: number }) {
  return (
    <Text style={styles.limitAmount}>
      <Text style={styles.limitAmountUsed}>{formatRupiah(props.usedAmount)}</Text>
      <Text> / {formatRupiah(props.limitAmount)}</Text>
    </Text>
  );
}

function getLimitWidth(percentage: number): `${number}%` {
  return `${Math.min(Math.max(percentage, 0), 100)}%` as `${number}%`;
}

function formatLimitPercentage(value: number) {
  return `${Math.round(value)}%`;
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatCompactRupiah(value: number) {
  if (value >= 1000) {
    return `Rp ${Number(value / 1000).toLocaleString('id-ID')}k`;
  }

  return formatRupiah(value);
}

function HistorySection(props: {
  histories: HistoryItemData[];
  onOpenFullHistory: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Histori Lucu 🐾</Text>
        <Pressable onPress={() => props.onOpenFullHistory()}>
          <Text style={styles.sectionLink}>Lihat Semua</Text>
        </Pressable>
      </View>
      <HistoryList histories={props.histories} />
    </View>
  );
}

function HistoryList(props: { histories: HistoryItemData[] }) {
  if (!props.histories.length) {
    return <HistoryEmptyState />;
  }

  return (
    <View style={styles.historyList}>
      {props.histories.map(history => (
        <HistoryItem history={history} key={history.id} />
      ))}
    </View>
  );
}

function HistoryEmptyState() {
  return (
    <View style={styles.historyEmptyState}>
      <Text style={styles.historyEmptyTitle}>Belum ada histori</Text>
      <Text style={styles.historyEmptyText}>
        Transaksi yang kamu catat nanti muncul di sini.
      </Text>
    </View>
  );
}

function FullHistoryTitleRow(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  monthLabel: string;
  onPressMonth: () => void;
}) {
  return (
    <View style={styles.fullHistoryTitleRow}>
      <View style={styles.fullHistoryTitleLeft} {...props.dragHandleProps}>
        <View style={styles.fullHistoryIconBox}>
          <Text style={styles.fullHistoryIcon}>↺</Text>
        </View>
        <Text style={styles.fullHistoryTitle}>Histori Lengkap</Text>
      </View>
      <Pressable onPress={props.onPressMonth}>
        <Text style={styles.fullHistoryMonth}>{props.monthLabel}⌄</Text>
      </Pressable>
    </View>
  );
}

function FullHistoryHandle(props: {
  dragHandleProps: BottomSheetDragHandleProps;
}) {
  return (
    <View {...props.dragHandleProps}>
      <View style={styles.fullHistoryHandle} />
    </View>
  );
}

function FullHistoryHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  monthLabel: string;
  onPressMonth: () => void;
  onSelectFilter: (filter: HistoryFilter) => void;
  selectedFilter: HistoryFilter;
}) {
  return (
    <View style={styles.fullHistoryHeader}>
      <FullHistoryHandle dragHandleProps={props.dragHandleProps} />
      <FullHistoryTitleRow
        dragHandleProps={props.dragHandleProps}
        monthLabel={props.monthLabel}
        onPressMonth={props.onPressMonth}
      />
      <HistoryFilterChips
        onSelectFilter={props.onSelectFilter}
        selectedFilter={props.selectedFilter}
      />
    </View>
  );
}

function HistoryFilterChips(props: {
  onSelectFilter: (filter: HistoryFilter) => void;
  selectedFilter: HistoryFilter;
}) {
  const chips: HistoryFilter[] = ['Semua', 'Pengeluaran', 'Pemasukan', 'Pindah Dana'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.fullHistoryChipRow}>
        {chips.map(chip => (
          <HistoryFilterChip
            isActive={chip === props.selectedFilter}
            key={chip}
            label={chip}
            onPress={() => props.onSelectFilter(chip)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function HistoryFilterChip(props: {
  isActive: boolean;
  label: HistoryFilter;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.fullHistoryChip,
        props.isActive && styles.fullHistoryChipActive,
      ]}
    >
      <Text
        style={[
          styles.fullHistoryChipText,
          props.isActive && styles.fullHistoryChipTextActive,
        ]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

function HistoryItem({ history }: { history: HistoryItemData }) {
  const amountStyle = getHistoryAmountStyle(history.tone);

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyLeft}>
        <View style={styles.historyIconBox}>
          <Text style={styles.historyIcon}>{history.icon}</Text>
        </View>
        <View>
          <Text style={styles.historyTitle}>{history.title}</Text>
          <Text style={styles.historyMeta}>{history.meta}</Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, amountStyle]}>{history.amount}</Text>
    </View>
  );
}

function getHistoryAmountStyle(tone: HistoryTone) {
  if (tone === 'income') {
    return styles.historyAmountIncome;
  }

  return tone === 'transfer'
    ? styles.historyAmountTransfer
    : styles.historyAmountExpense;
}

function getFullHistoryAmountStyle(tone: HistoryTone) {
  if (tone === 'income') {
    return styles.fullHistoryAmountIncome;
  }

  return tone === 'transfer'
    ? styles.fullHistoryAmountTransfer
    : styles.fullHistoryAmountExpense;
}

function FullHistoryTransaction(props: { transaction: HistoryItemData }) {
  const amountStyle = getFullHistoryAmountStyle(props.transaction.tone);

  return (
    <View style={styles.fullHistoryItem}>
      <View style={styles.fullHistoryItemLeft}>
        <View style={styles.fullHistoryItemIconBox}>
          <Text style={styles.fullHistoryItemIcon}>{props.transaction.icon}</Text>
        </View>
        <FullHistoryTransactionCopy transaction={props.transaction} />
      </View>
      <Text style={[styles.fullHistoryAmount, amountStyle]}>
        {props.transaction.amount}
      </Text>
    </View>
  );
}

function FullHistoryTransactionCopy(props: { transaction: HistoryItemData }) {
  return (
    <View style={styles.fullHistoryItemCopy}>
      <Text numberOfLines={1} style={styles.fullHistoryItemTitle}>
        {props.transaction.title}
      </Text>
      <Text style={styles.fullHistoryItemMeta}>{props.transaction.meta}</Text>
    </View>
  );
}

function getFilteredTransactions(
  group: FullHistoryGroupData,
  selectedFilter: HistoryFilter,
) {
  return group.transactions.filter(transaction => {
    if (selectedFilter === 'Semua') {
      return true;
    }

    if (selectedFilter === 'Pemasukan') {
      return transaction.tone === 'income';
    }

    if (selectedFilter === 'Pindah Dana') {
      return transaction.tone === 'transfer';
    }

    return selectedFilter === 'Pengeluaran' && transaction.tone === 'expense';
  });
}

function FullHistoryGroup(props: {
  group: FullHistoryGroupData;
  selectedFilter: HistoryFilter;
}) {
  const transactions = getFilteredTransactions(props.group, props.selectedFilter);

  if (!transactions.length) {
    return null;
  }

  return (
    <View style={styles.fullHistoryGroup}>
      <Text style={styles.fullHistoryGroupTitle}>{props.group.title}</Text>
      <View style={styles.fullHistoryList}>
        {transactions.map(transaction => (
          <FullHistoryTransaction
            key={transaction.id}
            transaction={transaction}
          />
        ))}
      </View>
    </View>
  );
}

function hasVisibleHistory(
  groups: FullHistoryGroupData[],
  selectedFilter: HistoryFilter,
) {
  return groups.some(group => (
    getFilteredTransactions(group, selectedFilter).length > 0
  ));
}

function FullHistoryEmptyState() {
  return (
    <View style={styles.fullHistoryEmptyState}>
      <Text style={styles.fullHistoryEmptyTitle}>Belum ada transaksi</Text>
      <Text style={styles.fullHistoryEmptyText}>
        Data untuk filter ini belum tersedia.
      </Text>
    </View>
  );
}

function FullHistoryContent(props: {
  groups: FullHistoryGroupData[];
  selectedFilter: HistoryFilter;
}) {
  const hasData = hasVisibleHistory(props.groups, props.selectedFilter);

  return (
    <ScrollView contentContainerStyle={styles.fullHistoryContent}>
      {hasData ? props.groups.map(group => (
        <FullHistoryGroup
          group={group}
          key={group.id}
          selectedFilter={props.selectedFilter}
        />
      )) : <FullHistoryEmptyState />}
    </ScrollView>
  );
}

function FullHistoryBottomSheet(props: FullHistoryBottomSheetProps) {
  const groups = useFullHistoryGroups(props);
  const {
    closeSheet,
    renderSheetView,
  } = useFullHistorySheetRenderer(props, groups);

  return (
    <BottomSheet
      containerStyle={styles.fullHistoryContainer}
      onClose={closeSheet}
      visible={props.visible}
    >
      {renderSheetView}
    </BottomSheet>
  );
}

function useFullHistorySheetRenderer(
  props: FullHistoryBottomSheetProps,
  groups: FullHistoryGroupData[],
) {
  const {
    closeSheet,
    openPeriod,
    showList,
    view,
  } = useFullHistorySheetViewState(props);
  const rendererProps = getFullHistorySheetRendererProps(
    props,
    groups,
    closeSheet,
    openPeriod,
    showList,
    view,
  );

  return {
    closeSheet,
    renderSheetView: getRenderFullHistorySheetView(rendererProps),
  };
}

function getFullHistorySheetRendererProps(
  props: FullHistoryBottomSheetProps,
  groups: FullHistoryGroupData[],
  closeSheet: () => void,
  openPeriod: () => void,
  showList: () => void,
  view: 'list' | 'period',
) {
  return {
    groups,
    monthLabel: props.monthLabel,
    onClose: closeSheet,
    onOpenPeriod: openPeriod,
    onSelectFilter: props.onSelectFilter,
    onShowList: showList,
    period: props.period,
    range: getAvailablePeriodRange(props.availablePeriod),
    selectedFilter: props.selectedFilter,
    view,
  };
}

function useFullHistorySheetViewState(props: FullHistoryBottomSheetProps) {
  const [view, setView] = useState<'list' | 'period'>('list');

  return {
    closeSheet: () => {
      setView('list');
      props.onClose();
    },
    openPeriod: () => setView('period'),
    showList: () => setView('list'),
    view,
  };
}

function getRenderFullHistorySheetView(props: {
  groups: FullHistoryGroupData[];
  monthLabel: string;
  onClose: () => void;
  onOpenPeriod: () => void;
  onSelectFilter: (filter: HistoryFilter) => void;
  onShowList: () => void;
  period: ReturnType<typeof usePeriodState>;
  range: { maxMonth: string; minMonth: string };
  selectedFilter: HistoryFilter;
  view: 'list' | 'period';
}) {
  return ({ dragHandleProps }: { dragHandleProps: BottomSheetDragHandleProps }) => (
    props.view === 'period'
      ? renderFullHistoryPeriodView(props, dragHandleProps)
      : renderFullHistoryListView(props, dragHandleProps)
  );
}

function renderFullHistoryPeriodView(
  props: {
    onClose: () => void;
    onShowList: () => void;
    period: ReturnType<typeof usePeriodState>;
    range: { maxMonth: string; minMonth: string };
  },
  dragHandleProps: BottomSheetDragHandleProps,
) {
  return (
    <FullHistoryPeriodContent
      dragHandleProps={dragHandleProps}
      onApply={props.onShowList}
      onClose={props.onClose}
      onGoBack={props.onShowList}
      period={props.period}
      range={props.range}
    />
  );
}

function renderFullHistoryListView(
  props: {
    groups: FullHistoryGroupData[];
    monthLabel: string;
    onOpenPeriod: () => void;
    onSelectFilter: (filter: HistoryFilter) => void;
    selectedFilter: HistoryFilter;
  },
  dragHandleProps: BottomSheetDragHandleProps,
) {
  return (
    <FullHistorySheetContent
      dragHandleProps={dragHandleProps}
      groups={props.groups}
      monthLabel={props.monthLabel}
      onPressMonth={props.onOpenPeriod}
      onSelectFilter={props.onSelectFilter}
      selectedFilter={props.selectedFilter}
    />
  );
}

function FullHistoryPeriodContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onApply: () => void;
  onClose: () => void;
  onGoBack: () => void;
  period: ReturnType<typeof usePeriodState>;
  range: { maxMonth: string; minMonth: string };
}) {
  const contentProps = getHistoryPeriodContentProps(props);

  return (
    <>
      <SheetHeader
        canGoBack
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={props.onGoBack}
        title="Pilih Periode 📅"
      />
      <UsagePeriodContent {...contentProps} />
    </>
  );
}

function getHistoryPeriodContentProps(props: {
  onApply: () => void;
  period: ReturnType<typeof usePeriodState>;
  range: { maxMonth: string; minMonth: string };
}) {
  const options = getPeriodOptionsFromRange(props.range, props.period.selectedYear);
  const selectYear = getSelectPeriodYearHandler(props.period, options);

  return {
    monthOptions: options.monthOptions,
    onApply: props.onApply,
    selectedMonth: props.period.selectedMonth,
    selectedYear: props.period.selectedYear,
    setSelectedMonth: props.period.setSelectedMonth,
    setSelectedYear: selectYear,
    yearOptions: options.yearOptions,
  };
}

function FullHistorySheetContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  groups: FullHistoryGroupData[];
  monthLabel: string;
  onPressMonth: () => void;
  onSelectFilter: (filter: HistoryFilter) => void;
  selectedFilter: HistoryFilter;
}) {
  return (
    <>
      <FullHistoryHeader
        dragHandleProps={props.dragHandleProps}
        monthLabel={props.monthLabel}
        onPressMonth={props.onPressMonth}
        onSelectFilter={props.onSelectFilter}
        selectedFilter={props.selectedFilter}
      />
      <FullHistoryContent
        groups={props.groups}
        selectedFilter={props.selectedFilter}
      />
    </>
  );
}

function useFullHistoryGroups(props: {
  month: string;
  selectedFilter: HistoryFilter;
  visible: boolean;
}) {
  const [groups, setGroups] = useState<FullHistoryGroupData[]>([]);

  useEffect(() => {
    if (props.visible) {
      fetchFullHistoryGroups(props.month, props.selectedFilter)
        .then(setGroups)
        .catch(() => setGroups([]));
    }
  }, [props.month, props.selectedFilter, props.visible]);

  return groups;
}

function TotalWalletOption(props: { amount: string }) {
  return (
    <Pressable style={styles.totalWalletOption}>
      <View style={styles.totalWalletIcon}>
        <Text style={styles.sheetIconText}>▣</Text>
      </View>
      <View style={styles.totalWalletCopy}>
        <Text style={styles.totalWalletTitle}>Semua Dompet</Text>
        <Text style={styles.totalWalletSubtitle}>Lihat total keseluruhan</Text>
      </View>
      <Text style={styles.totalWalletAmount}>{props.amount}</Text>
    </Pressable>
  );
}

function WalletDeleteButton(props: { isVisible: boolean; onPress: () => void }) {
  if (!props.isVisible) {
    return null;
  }

  return (
    <Pressable onPress={props.onPress} style={styles.walletDeleteButton}>
      <Text style={styles.walletDeleteText}>×</Text>
    </Pressable>
  );
}

function WalletEditButton(props: { isVisible: boolean; onPress: () => void }) {
  if (!props.isVisible) {
    return null;
  }

  return (
    <Pressable onPress={props.onPress} style={styles.walletEditButton}>
      <Text style={styles.walletEditText}>✎</Text>
    </Pressable>
  );
}

function WalletOptionCopy(props: { wallet: WalletItem }) {
  const amountStyle = styles[`${props.wallet.tone}WalletAmount`];

  return (
    <>
      <Text style={styles.walletOptionName}>{props.wallet.name}</Text>
      <Text style={[styles.walletOptionAmount, amountStyle]}>
        {props.wallet.amount}
      </Text>
    </>
  );
}

function WalletOptionOverlay(props: {
  actionMode: WalletActionMode;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <WalletDeleteButton
        isVisible={props.actionMode === 'delete'}
        onPress={props.onDelete}
      />
      <WalletEditButton
        isVisible={props.actionMode === 'edit'}
        onPress={props.onEdit}
      />
    </>
  );
}

function WalletOptionIconBox(props: { wallet: WalletItem }) {
  const iconStyle = styles[`${props.wallet.tone}WalletIcon`];

  return (
    <View style={[styles.walletOptionIcon, iconStyle]}>
      <Text style={styles.sheetIconText}>{props.wallet.icon}</Text>
    </View>
  );
}

function WalletOption(props: {
  actionMode: WalletActionMode;
  onDelete: () => void;
  onEdit: () => void;
  wallet: WalletItem;
}) {
  const optionStyle = styles[`${props.wallet.tone}WalletOption`];

  return (
    <Pressable style={[styles.walletOption, optionStyle]}>
      <WalletOptionOverlay
        actionMode={props.actionMode}
        onDelete={props.onDelete}
        onEdit={props.onEdit}
      />
      <WalletOptionIconBox wallet={props.wallet} />
      <WalletOptionCopy wallet={props.wallet} />
    </Pressable>
  );
}

function WalletEmptyState() {
  return (
    <View style={styles.walletEmptyState}>
      <Text style={styles.walletEmptyTitle}>Belum ada dompet</Text>
      <Text style={styles.walletEmptyText}>
        Tambahkan dompet atau ATM pertamamu dulu.
      </Text>
    </View>
  );
}

function WalletGrid(props: {
  actionMode: WalletActionMode;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  walletItems: WalletItem[];
}) {
  if (!props.walletItems.length) {
    return <WalletEmptyState />;
  }

  return (
    <View style={styles.walletGrid}>
      {props.walletItems.map(wallet => (
        <WalletOption
          actionMode={props.actionMode}
          key={wallet.id}
          onDelete={() => props.onDeleteWallet(wallet.id)}
          onEdit={() => props.onEditWallet(wallet)}
          wallet={wallet}
        />
      ))}
    </View>
  );
}

function AddWalletButton(props: { onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.addWalletButton}>
      <Text style={styles.addWalletIcon}>⊕</Text>
      <Text style={styles.addWalletText}>Tambah Dompet / ATM</Text>
    </Pressable>
  );
}

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

function WalletTrashButton(props: {
  isActive: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={props.isDisabled}
      onPress={props.onPress}
      style={[
        styles.walletTrashButton,
        props.isActive && styles.walletTrashButtonActive,
        props.isDisabled && styles.walletTrashButtonDisabled,
      ]}
    >
      <Text style={styles.walletTrashText}>🗑</Text>
    </Pressable>
  );
}

function WalletEditModeButton(props: {
  isActive: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={props.isDisabled}
      onPress={props.onPress}
      style={[
        styles.walletTrashButton,
        props.isActive && styles.walletTrashButtonActive,
        props.isDisabled && styles.walletTrashButtonDisabled,
      ]}
    >
      <Text style={styles.walletTrashText}>✎</Text>
    </Pressable>
  );
}

function WalletListContent(props: {
  actionMode: WalletActionMode;
  onCreateWallet: () => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  return (
    <>
      {!!props.walletItems.length && (
        <TotalWalletOption amount={props.totalAmount} />
      )}
      <WalletGrid
        actionMode={props.actionMode}
        onDeleteWallet={props.onDeleteWallet}
        onEditWallet={props.onEditWallet}
        walletItems={props.walletItems}
      />
      <AddWalletButton onPress={props.onCreateWallet} />
    </>
  );
}

function WalletTypeChip(props: {
  isActive: boolean;
  onPress: () => void;
  type: WalletType;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.walletTypeChip,
        props.isActive && styles.walletTypeChipActive,
      ]}
    >
      <Text
        style={[
          styles.walletTypeText,
          props.isActive && styles.walletTypeTextActive,
        ]}
      >
        {props.type}
      </Text>
    </Pressable>
  );
}

function WalletTypeOptions(props: {
  onSelectType: (type: WalletType) => void;
  selectedType: WalletType;
}) {
  return (
    <View style={styles.walletTypeRow}>
      {walletTypes.map(type => (
        <WalletTypeChip
          isActive={type === props.selectedType}
          key={type}
          onPress={() => props.onSelectType(type)}
          type={type}
        />
      ))}
    </View>
  );
}

function WalletFormField(props: {
  editable?: boolean;
  keyboardType?: 'default' | 'number-pad';
  label: string;
  onChangeText?: (value: string) => void;
  onFocus?: () => void;
  placeholder: string;
  value?: string;
}) {
  return (
    <View style={styles.walletFormField}>
      <Text style={styles.walletFormLabel}>{props.label}</Text>
      <TextInput
        editable={props.editable}
        keyboardType={props.keyboardType}
        onChangeText={props.onChangeText}
        onFocus={props.onFocus}
        placeholder={props.placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.walletFormInput}
        value={props.value}
      />
    </View>
  );
}

function getWalletTypePayload(type: WalletType): Pick<CreateWalletPayload, 'color' | 'icon' | 'type'> {
  if (type === 'E-Wallet') {
    return { color: '#EE2B6C', icon: 'qr_code_2', type: 'EWALLET' };
  }

  if (type === 'Cash') {
    return { color: '#FBCF33', icon: 'payments', type: 'CASH' };
  }

  if (type === 'Savings') {
    return { color: '#A29BFE', icon: 'savings', type: 'SAVINGS' };
  }

  if (type === 'Other') {
    return { color: '#4EA8DE', icon: 'account_balance_wallet', type: 'OTHER' };
  }

  return { color: '#4EA8DE', icon: 'account_balance', type: 'BANK' };
}

function getWalletBalanceDigits(value: string) {
  return value.replace(/\D/g, '');
}

function parseWalletBalance(value: string) {
  const amount = Number(getWalletBalanceDigits(value));

  return Number.isFinite(amount) ? amount : 0;
}

function formatMoneyInput(value: string) {
  const digits = getWalletBalanceDigits(value);

  if (!digits) {
    return '';
  }

  return `Rp ${Number(digits).toLocaleString('id-ID')}`;
}

function getWalletSubmitPayload(params: {
  balance: string;
  name: string;
  selectedType: WalletType;
}): CreateWalletPayload {
  return {
    ...getWalletTypePayload(params.selectedType),
    initialBalance: parseWalletBalance(params.balance),
    name: params.name.trim(),
  };
}

function getWalletUpdatePayload(params: {
  balance: string;
  name: string;
  selectedType: WalletType;
}): UpdateWalletPayload {
  return {
    ...getWalletTypePayload(params.selectedType),
    balance: parseWalletBalance(params.balance),
    name: params.name.trim(),
  };
}

function isWalletFormValid(params: {
  name: string;
  setErrorMessage: (message: string) => void;
  token: string | null;
}) {
  const isValid = !!params.token && params.name.trim().length >= 2;

  if (!isValid) {
    params.setErrorMessage('Nama dompet minimal 2 karakter.');
  }

  return isValid;
}

async function submitWalletForm(params: {
  balance: string;
  name: string;
  onChanged: () => void;
  onSuccess: () => void;
  selectedType: WalletType;
  setErrorMessage: (message: string) => void;
}) {
  const token = await getAuthToken();

  if (!isWalletFormValid({ ...params, token }) || !token) {
    return;
  }

  try {
    await createWallet(token, getWalletSubmitPayload(params));
    params.onChanged();
    params.onSuccess();
  } catch (error) {
    params.setErrorMessage(
      error instanceof Error ? error.message : 'Gagal menyimpan dompet.',
    );
  }
}

async function submitWalletEditForm(params: {
  balance: string;
  name: string;
  onChanged: () => void;
  onSuccess: () => void;
  selectedType: WalletType;
  setErrorMessage: (message: string) => void;
  walletId: string;
}) {
  const token = await getAuthToken();

  if (!isWalletFormValid({ ...params, token }) || !token) {
    return;
  }

  try {
    await persistWalletUpdate(params, token);
    params.onChanged();
    params.onSuccess();
  } catch (error) {
    params.setErrorMessage(
      error instanceof Error ? error.message : 'Gagal memperbarui dompet.',
    );
  }
}

function persistWalletUpdate(
  params: {
    balance: string;
    name: string;
    selectedType: WalletType;
    walletId: string;
  },
  token: string,
) {
  return updateWallet(token, params.walletId, getWalletUpdatePayload(params));
}

async function handleDeleteWallet(walletId: string) {
  const token = await getAuthToken();

  if (!token) {
    return;
  }

  await deleteWallet(token, walletId);
}

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

function WalletFormFields(props: {
  amountLabel?: string;
  state: WalletFormState;
}) {
  return (
    <>
      <WalletFormField
        label="Nama Dompet"
        onChangeText={props.state.setName}
        placeholder="BCA Saya"
        value={props.state.name}
      />
      <WalletTypeField state={props.state} />
      <WalletFormField
        keyboardType="number-pad"
        label={props.amountLabel ?? 'Saldo Awal'}
        onChangeText={props.state.setBalance}
        onFocus={props.state.focusBalance}
        placeholder="Rp 0"
        value={props.state.balance}
      />
    </>
  );
}

function WalletTypeField({ state }: { state: WalletFormState }) {
  return (
    <View style={styles.walletFormField}>
      <Text style={styles.walletFormLabel}>Tipe Dompet</Text>
      <WalletTypeOptions
        onSelectType={state.setSelectedType}
        selectedType={state.selectedType}
      />
    </View>
  );
}

function WalletSaveButton(props: {
  buttonLabel?: string;
  onPress: () => Promise<void>;
  state: WalletFormState;
}) {
  return (
    <>
      {!!props.state.errorMessage && (
        <Text style={styles.walletFormError}>{props.state.errorMessage}</Text>
      )}
      <Pressable onPress={props.onPress} style={styles.saveWalletButton}>
        <Text style={styles.saveWalletButtonText}>
          {props.buttonLabel ?? 'Simpan Dompet'}
        </Text>
      </Pressable>
    </>
  );
}

function getWalletCreateSubmitParams(props: {
  onChanged: () => void;
  onSuccess: () => void;
  state: WalletFormState;
}) {
  return {
    balance: props.state.balance,
    name: props.state.name,
    onChanged: props.onChanged,
    onSuccess: props.onSuccess,
    selectedType: props.state.selectedType,
    setErrorMessage: props.state.setErrorMessage,
  };
}

function getWalletEditSubmitParams(props: {
  onChanged: () => void;
  onSuccess: () => void;
  state: WalletFormState;
  walletId: string;
}) {
  return {
    ...getWalletCreateSubmitParams(props),
    walletId: props.walletId,
  };
}

function useWalletFormState(defaults?: WalletFormDefaults): WalletFormState {
  const initialValues = getWalletFormDefaults(defaults);
  const [balance, setBalance] = useState(initialValues.balance);
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState(initialValues.name);
  const [selectedType, setSelectedType] = useState<WalletType>(initialValues.selectedType);
  const setFormattedBalance = (value: string) => {
    setBalance(formatMoneyInput(value));
  };

  return {
    balance,
    errorMessage,
    focusBalance: () => setBalance(value => value || 'Rp '),
    name,
    selectedType,
    setBalance: setFormattedBalance,
    setErrorMessage,
    setName,
    setSelectedType,
  };
}

function getWalletFormDefaults(defaults?: WalletFormDefaults) {
  return {
    balance: defaults?.balance ?? '',
    name: defaults?.name ?? '',
    selectedType: defaults?.selectedType ?? 'Bank',
  };
}

function WalletCreateContent(props: {
  onChanged: () => void;
  onSuccess: () => void;
}) {
  const state = useWalletFormState();

  return (
    <View style={styles.walletForm}>
      <WalletFormFields state={state} />
      <WalletSaveButton
        onPress={async () => {
          await submitWalletForm(getWalletCreateSubmitParams({
            ...props,
            state,
          }));
        }}
        state={state}
      />
    </View>
  );
}

function WalletEditContent(props: {
  onChanged: () => void;
  onSuccess: () => void;
  wallet: WalletItem;
}) {
  const state = useWalletFormState(getWalletEditDefaults(props.wallet));

  return (
    <View style={styles.walletForm}>
      <WalletFormFields amountLabel="Saldo Sekarang" state={state} />
      <WalletSaveButton
        buttonLabel="Simpan Perubahan"
        onPress={async () => submitWalletEditState(props, state)}
        state={state}
      />
    </View>
  );
}

function getWalletEditDefaults(wallet: WalletItem): WalletFormDefaults {
  return {
    balance: formatMoneyInput(String(wallet.balance)),
    name: wallet.name,
    selectedType: wallet.selectedType,
  };
}

function submitWalletEditState(
  props: {
    onChanged: () => void;
    onSuccess: () => void;
    wallet: WalletItem;
  },
  state: WalletFormState,
) {
  return submitWalletEditForm(getWalletEditSubmitParams({
    ...props,
    state,
    walletId: props.wallet.id,
  }));
}

function useWalletSheetState() {
  const [actionMode, setActionMode] = useState<WalletActionMode>('idle');
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [view, setView] = useState<WalletSheetView>('list');

  return {
    actionMode,
    selectedWallet,
    setActionMode,
    setSelectedWallet,
    setView,
    view,
  };
}

function WalletHeaderAction(props: {
  isListView: boolean;
  mode: WalletActionMode;
  onToggleDelete: () => void;
  onToggleEdit: () => void;
  walletItems: WalletItem[];
}) {
  if (!props.isListView || !props.walletItems.length) {
    return null;
  }

  return (
    <WalletHeaderButtons
      mode={props.mode}
      onToggleDelete={props.onToggleDelete}
      onToggleEdit={props.onToggleEdit}
    />
  );
}

function WalletHeaderButtons(props: {
  mode: WalletActionMode;
  onToggleDelete: () => void;
  onToggleEdit: () => void;
}) {
  return (
    <View style={styles.walletHeaderActions}>
      <WalletEditModeButton
        isActive={props.mode === 'edit'}
        isDisabled={false}
        onPress={props.onToggleEdit}
      />
      <WalletTrashButton
        isActive={props.mode === 'delete'}
        isDisabled={false}
        onPress={props.onToggleDelete}
      />
    </View>
  );
}

function WalletSheetBody(props: {
  actionMode: WalletActionMode;
  onCreateWallet: () => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  return (
    <WalletListContent
      actionMode={props.actionMode}
      onCreateWallet={props.onCreateWallet}
      onDeleteWallet={props.onDeleteWallet}
      onEditWallet={props.onEditWallet}
      totalAmount={props.totalAmount}
      walletItems={props.walletItems}
    />
  );
}

function WalletSheetHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onBack: () => void;
  onClose: () => void;
  walletSheet: ReturnType<typeof useWalletSheetState>;
  walletItems: WalletItem[];
}) {
  return (
    <SheetHeader
      action={getWalletHeaderAction(props.walletItems, props.walletSheet)}
      canGoBack={props.walletSheet.view !== 'list'}
      dragHandleProps={props.dragHandleProps}
      onClose={props.onClose}
      onGoBack={props.onBack}
      title={getWalletSheetTitle(props.walletSheet.view)}
    />
  );
}

function getWalletHeaderAction(
  walletItems: WalletItem[],
  walletSheet: ReturnType<typeof useWalletSheetState>,
) {
  return (
    <WalletHeaderAction
      isListView={walletSheet.view === 'list'}
      mode={walletSheet.actionMode}
      onToggleDelete={() => {
        walletSheet.setActionMode(value => (
          value === 'delete' ? 'idle' : 'delete'
        ));
      }}
      onToggleEdit={() => {
        walletSheet.setActionMode(value => (
          value === 'edit' ? 'idle' : 'edit'
        ));
      }}
      walletItems={walletItems}
    />
  );
}

function WalletSheetCurrentContent(props: {
  onChanged: () => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  totalAmount: string;
  walletItems: WalletItem[];
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  if (props.walletSheet.view === 'create') {
    return <WalletSheetCreateContent {...props} />;
  }

  if (props.walletSheet.view === 'edit') {
    return <WalletSheetEditContent {...props} />;
  }

  return <WalletSheetListContent {...props} />;
}

function WalletSheetCreateContent(props: {
  onChanged: () => void;
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  return (
    <WalletCreateContent
      onChanged={props.onChanged}
      onSuccess={() => resetWalletSheetToList(props.walletSheet)}
    />
  );
}

function WalletSheetEditContent(props: {
  onChanged: () => void;
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  if (!props.walletSheet.selectedWallet) {
    return null;
  }

  return (
    <WalletEditContent
      key={props.walletSheet.selectedWallet.id}
      onChanged={props.onChanged}
      onSuccess={() => {
        props.walletSheet.setActionMode('idle');
        props.walletSheet.setSelectedWallet(null);
        props.walletSheet.setView('list');
      }}
      wallet={props.walletSheet.selectedWallet}
    />
  );
}

function WalletSheetListContent(props: {
  onChanged: () => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  totalAmount: string;
  walletItems: WalletItem[];
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  return (
    <WalletSheetBody
      actionMode={props.walletSheet.actionMode}
      onCreateWallet={() => {
        props.walletSheet.setActionMode('idle');
        props.walletSheet.setSelectedWallet(null);
        props.walletSheet.setView('create');
      }}
      onDeleteWallet={props.onDeleteWallet}
      onEditWallet={props.onEditWallet}
      totalAmount={props.totalAmount}
      walletItems={props.walletItems}
    />
  );
}

function WalletSheetHeaderContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  walletItems: WalletItem[];
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  return (
    <WalletSheetHeader
      dragHandleProps={props.dragHandleProps}
      onBack={() => resetWalletSheetToList(props.walletSheet)}
      onClose={props.onClose}
      walletItems={props.walletItems}
      walletSheet={props.walletSheet}
    />
  );
}

function SheetContent(props: WalletSheetContentProps) {
  const walletSheet = useWalletSheetState();

  return (
    <>
      <WalletSheetHeaderContent
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        walletItems={props.walletItems}
        walletSheet={walletSheet}
      />
      <WalletSheetCurrentContent
        onChanged={props.onChanged}
        onDeleteWallet={props.onDeleteWallet}
        onEditWallet={wallet => openWalletEditView(walletSheet, wallet)}
        totalAmount={props.totalAmount}
        walletItems={props.walletItems}
        walletSheet={walletSheet}
      />
    </>
  );
}

function openWalletEditView(
  walletSheet: ReturnType<typeof useWalletSheetState>,
  wallet: WalletItem,
) {
  walletSheet.setActionMode('idle');
  walletSheet.setSelectedWallet(wallet);
  walletSheet.setView('edit');
}

function WalletBottomSheet(props: WalletBottomSheetProps) {
  const renderContent = useWalletBottomSheetContent(props);

  return (
    <BottomSheet
      containerStyle={styles.sheetContainer}
      onClose={props.onClose}
      visible={props.visible}
    >
      {renderContent}
    </BottomSheet>
  );
}

function useWalletBottomSheetContent(props: WalletBottomSheetProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const walletItems = useWalletItems(props.visible, refreshKey);
  const handleChanged = getWalletChangedHandler(setRefreshKey, props.onChanged);
  const handleDelete = getWalletDeleteHandler(walletItems.remove, handleChanged);

  return getWalletContentRenderer(
    props,
    walletItems.items,
    handleChanged,
    handleDelete,
  );
}

function getWalletContentRenderer(
  props: { onClose: () => void; totalAmount: string },
  walletItems: WalletItem[],
  onChanged: () => void,
  onDeleteWallet: (walletId: string) => void,
) {
  return ({ dragHandleProps }: { dragHandleProps: BottomSheetDragHandleProps }) => (
    <SheetContent
      dragHandleProps={dragHandleProps}
      onChanged={onChanged}
      onClose={props.onClose}
      onDeleteWallet={onDeleteWallet}
      totalAmount={props.totalAmount}
      walletItems={walletItems}
    />
  );
}

function getWalletDeleteHandler(
  removeWallet: (walletId: string) => void,
  onChanged: () => void,
) {
  return (walletId: string) => {
    removeWallet(walletId);
    handleDeleteWallet(walletId)
      .then(onChanged)
      .catch(onChanged);
  };
}

function getWalletChangedHandler(
  setRefreshKey: (setter: (value: number) => number) => void,
  onChanged: () => void,
) {
  return () => {
    setRefreshKey(value => value + 1);
    onChanged();
  };
}

function getWalletSheetTitle(view: WalletSheetView) {
  if (view === 'create') {
    return 'Tambah Dompet 💳';
  }

  if (view === 'edit') {
    return 'Edit Dompet ✏️';
  }

  return 'Pilih Dompet 👛';
}

function resetWalletSheetToList(
  walletSheet: ReturnType<typeof useWalletSheetState>,
) {
  walletSheet.setActionMode('idle');
  walletSheet.setSelectedWallet(null);
  walletSheet.setView('list');
}

function getLimitDetailStyles(tone: LimitTone) {
  return {
    progress: styles[`${tone}LimitProgress`],
    text: styles[`${tone}LimitText`],
  };
}

function getBudgetTone(color: string): LimitTone {
  const normalizedColor = color.toUpperCase();

  if (normalizedColor === '#4EA8DE') {
    return 'blue';
  }

  if (normalizedColor === '#A29BFE') {
    return 'purple';
  }

  return normalizedColor === '#FBCF33' ? 'yellow' : 'primary';
}

function mapBudgetToLimitDetail(item: BudgetItem): LimitDetail {
  return {
    icon: getBudgetDisplayIcon(item.icon),
    id: item.id,
    label: item.name,
    limitAmount: item.limitAmount,
    progress: item.statusLabel || formatLimitPercentage(item.percentage),
    tone: getBudgetTone(item.color),
    width: getLimitWidth(item.percentage),
  };
}

function getBudgetDisplayIcon(icon: string) {
  const iconMap: Record<string, string> = {
    favorite: '♥',
    home: '⌂',
    lunch_dining: '☰',
    shopping_bag: '▣',
    savings: '◎',
    two_wheeler: '↗',
    wifi: '≋',
  };

  return iconMap[icon] ?? '◎';
}

function mapBudgetsResponse(response: BudgetsResponse): LimitDetailState {
  return {
    items: response.items.map(mapBudgetToLimitDetail),
    previousMonth: response.previousMonth,
  };
}

async function fetchLimitDetails(month: string) {
  const token = await getAuthToken();

  if (!token) {
    return { items: [] };
  }

  const response = await getBudgets(token, month);

  return mapBudgetsResponse(response.data);
}

function LimitDetailHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isDeleteMode: boolean;
  isEditMode: boolean;
  limitItems: LimitDetail[];
  onToggleEdit: () => void;
  onToggleDelete: () => void;
}) {
  return (
    <View style={styles.limitDetailHeader} {...props.dragHandleProps}>
      <View style={styles.limitDetailHandle} />
      <Text style={styles.limitDetailTitle}>Detail Limit 📊</Text>
      <Text style={styles.limitDetailSubtitle}>SEMANGAT HEMAT YA, KAK! ✨</Text>
      <LimitDetailHeaderActions {...props} />
    </View>
  );
}

function LimitDetailHeaderActions(props: {
  isDeleteMode: boolean;
  isEditMode: boolean;
  limitItems: LimitDetail[];
  onToggleEdit: () => void;
  onToggleDelete: () => void;
}) {
  return (
    <View style={styles.limitHeaderAction}>
      <WalletEditModeButton
        isActive={props.isEditMode}
        isDisabled={!props.limitItems.length}
        onPress={props.onToggleEdit}
      />
      <WalletTrashButton
        isActive={props.isDeleteMode}
        isDisabled={!props.limitItems.length}
        onPress={props.onToggleDelete}
      />
    </View>
  );
}

function LimitDetailItemHeader(props: { item: LimitDetail }) {
  const toneStyles = getLimitDetailStyles(props.item.tone);

  return (
    <View style={styles.limitDetailItemHeader}>
      <View style={styles.limitDetailItemLeft}>
        <Text style={[styles.limitDetailIcon, toneStyles.text]}>
          {props.item.icon}
        </Text>
        <Text style={styles.limitDetailLabel}>{props.item.label}</Text>
      </View>
      <View style={styles.limitDetailItemRight}>
        <Text style={[styles.limitDetailPercent, toneStyles.text]}>
          {props.item.progress}
        </Text>
      </View>
    </View>
  );
}

function LimitDetailProgress({ item }: { item: LimitDetail }) {
  const toneStyles = getLimitDetailStyles(item.tone);

  return (
    <View style={styles.limitDetailTrack}>
      <View
        style={[
          styles.limitDetailProgress,
          toneStyles.progress,
          { width: item.width },
        ]}
      />
    </View>
  );
}

function LimitDetailItem(props: {
  isDeleteMode: boolean;
  isEditMode: boolean;
  item: LimitDetail;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <View style={styles.limitDetailItem}>
      <WalletDeleteButton
        isVisible={props.isDeleteMode}
        onPress={props.onDelete}
      />
      <WalletEditButton
        isVisible={props.isEditMode}
        onPress={props.onEdit}
      />
      <LimitDetailItemHeader item={props.item} />
      <LimitDetailProgress item={props.item} />
    </View>
  );
}

function LimitEmptyState(props: {
  onCreateCategory: () => void;
  onUsePreviousMonth: () => void;
}) {
  return (
    <View style={styles.limitEmptyState}>
      <Text style={styles.limitEmptyTitle}>Belum ada batas pengeluaran</Text>
      <Text style={styles.limitEmptyText}>
        Atur batas belanja per kategori, atau pakai aturan bulan kemarin.
      </Text>
      <Pressable
        onPress={props.onCreateCategory}
        style={styles.addLimitCategoryButton}
      >
        <Text style={styles.addLimitCategoryText}>Tambah Batas Kategori</Text>
      </Pressable>
      <Pressable
        onPress={props.onUsePreviousMonth}
        style={styles.usePreviousLimitButton}
      >
        <Text style={styles.usePreviousLimitText}>Pakai Aturan Bulan Kemarin</Text>
      </Pressable>
    </View>
  );
}

function LimitDetailItems(props: {
  isDeleteMode: boolean;
  isEditMode: boolean;
  limitItems: LimitDetail[];
  onCreateCategory: () => void;
  onDeleteBudget: (budgetId: string) => void;
  onEditBudget: (item: LimitDetail) => void;
}) {
  return (
    <View style={styles.limitDetailContent}>
      <LimitDetailItemList {...props} />
      <AddLimitCategoryButton onPress={props.onCreateCategory} />
    </View>
  );
}

function LimitDetailItemList(props: {
  isDeleteMode: boolean;
  isEditMode: boolean;
  limitItems: LimitDetail[];
  onDeleteBudget: (budgetId: string) => void;
  onEditBudget: (item: LimitDetail) => void;
}) {
  return props.limitItems.map(item => (
    <LimitDetailItem
      isDeleteMode={props.isDeleteMode}
      isEditMode={props.isEditMode}
      item={item}
      key={item.id}
      onDelete={() => props.onDeleteBudget(item.id)}
      onEdit={() => props.onEditBudget(item)}
    />
  ));
}

function AddLimitCategoryButton(props: { onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.addLimitCategoryButton}>
      <Text style={styles.addLimitCategoryText}>Tambah Batas Kategori</Text>
    </Pressable>
  );
}

function LimitDetailContent(props: {
  isDeleteMode: boolean;
  isEditMode: boolean;
  limitItems: LimitDetail[];
  onCreateCategory: () => void;
  onDeleteBudget: (budgetId: string) => void;
  onEditBudget: (item: LimitDetail) => void;
  onUsePreviousMonth: () => void;
}) {
  if (props.limitItems.length) {
    return <LimitDetailItems {...props} />;
  }

  return (
    <View style={styles.limitDetailContent}>
      <LimitEmptyState
        onCreateCategory={props.onCreateCategory}
        onUsePreviousMonth={props.onUsePreviousMonth}
      />
    </View>
  );
}

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

function LimitCategoryCreateContent(props: LimitCategoryCreateContentProps) {
  const state = useLimitCategoryFormState(
    props.month,
    props.refreshKey,
    props.onInfoMessage,
  );

  return (
    <View style={styles.walletForm}>
      <LimitCategoryCreateSnackbar
        message={props.snackbarMessage}
        onHide={props.onHideInfoMessage}
      />
      <LimitCategoryFormFields state={state} />
      <LimitCategoryCreateActions
        {...getLimitCategoryCreateActionProps(props, state)}
      />
    </View>
  );
}

function getLimitCategoryCreateActionProps(
  props: {
    onCreateNewCategory: () => void;
    onSaveCategory: (state: LimitCategoryFormState) => void;
  },
  state: LimitCategoryFormState,
) {
  return {
    onCreateNewCategory: props.onCreateNewCategory,
    onSaveCategory: () => props.onSaveCategory(state),
  };
}

function LimitCategoryCreateSnackbar(props: {
  message: string;
  onHide: () => void;
}) {
  return <Snackbar message={props.message} onHide={props.onHide} />;
}

function LimitCategoryCreateActions(props: {
  onCreateNewCategory: () => void;
  onSaveCategory: () => void;
}) {
  return (
    <>
      <Pressable
        onPress={props.onCreateNewCategory}
        style={styles.limitSecondaryButton}
      >
        <Text style={styles.limitSecondaryButtonText}>Tambah Kategori Baru</Text>
      </Pressable>
      <Pressable
        onPress={props.onSaveCategory}
        style={styles.saveWalletButton}
      >
        <Text style={styles.saveWalletButtonText}>Simpan Kategori</Text>
      </Pressable>
    </>
  );
}

function LimitCategoryFormFields(props: { state: LimitCategoryFormState }) {
  return (
    <>
      <LimitCategoryPicker state={props.state} />
      <WalletFormField
        keyboardType="number-pad"
        label="Limit Bulanan"
        onChangeText={props.state.setLimitAmount}
        placeholder="Rp 500.000"
        value={props.state.limitAmount}
      />
    </>
  );
}

function LimitCategoryPicker(props: { state: LimitCategoryFormState }) {
  return (
    <View style={styles.walletFormField}>
      <Text style={styles.walletFormLabel}>Kategori Pengeluaran</Text>
      <View style={styles.walletTypeRow}>
        {props.state.categories.map(category => (
          <LimitCategoryChip
            category={category}
            key={category.id}
            onSelect={props.state.setSelectedCategoryId}
            selectedCategoryId={props.state.selectedCategoryId}
          />
        ))}
      </View>
    </View>
  );
}

function LimitCategoryChip(props: {
  category: Category;
  onSelect: (categoryId: string) => void;
  selectedCategoryId: string;
}) {
  const isActive = props.selectedCategoryId === props.category.id;

  return (
    <Pressable
      onPress={() => props.onSelect(props.category.id)}
      style={[styles.walletTypeChip, isActive ? styles.walletTypeChipActive : null]}
    >
      <Text style={[styles.walletTypeText, isActive ? styles.walletTypeTextActive : null]}>
        {props.category.name}
      </Text>
    </Pressable>
  );
}

function useLimitCategoryFormState(
  month: string,
  refreshKey: number,
  onInfoMessage: (message: string) => void,
): LimitCategoryFormState {
  const categories = useExpenseCategories(refreshKey);
  const spentCategoryIds = useSpentExpenseCategoryIds(month);
  const [limitAmount, setLimitAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const effectiveCategoryId = selectedCategoryId || categories[0]?.id || '';
  const selectCategory = getSelectLimitCategoryHandler(
    setSelectedCategoryId,
    spentCategoryIds,
    onInfoMessage,
  );

  return {
    categories,
    limitAmount,
    selectedCategoryId: effectiveCategoryId,
    setLimitAmount: (value: string) => setLimitAmount(formatMoneyInput(value)),
    setSelectedCategoryId: selectCategory,
  };
}

function getSelectLimitCategoryHandler(
  setSelectedCategoryId: (value: string) => void,
  spentCategoryIds: Set<string>,
  onInfoMessage: (message: string) => void,
) {
  return (value: string) => {
    setSelectedCategoryId(value);
    if (spentCategoryIds.has(value)) {
      onInfoMessage(
        'Kategori ini sudah punya pengeluaran bulan ini. Pemakaian limit akan langsung menyesuaikan.',
      );
    }
  };
}

function useExpenseCategories(refreshKey: number) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchExpenseCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [refreshKey]);

  return categories;
}

function useSpentExpenseCategoryIds(month: string) {
  const [categoryIds, setCategoryIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSpentExpenseCategoryIds(month)
      .then(setCategoryIds)
      .catch(() => setCategoryIds(new Set()));
  }, [month]);

  return categoryIds;
}

async function fetchExpenseCategories() {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  const response = await getCategories(token, { type: 'EXPENSE' });

  return response.data;
}

async function fetchSpentExpenseCategoryIds(month: string) {
  const summary = await fetchDashboardSummary(month);

  return new Set(
    (summary?.chart.categories ?? []).map(category => category.categoryId),
  );
}

function LimitCategoryCreateView(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  month: string;
  onClose: () => void;
  onCreateNewCategory: () => void;
  onGoBack: () => void;
  onHideSnackbar: () => void;
  onInfoMessage: (message: string) => void;
  onSaveCategory: (state: LimitCategoryFormState) => void;
  refreshKey: number;
  snackbarMessage: string;
}) {
  const contentProps = getLimitCategoryCreateContentProps(props);

  return (
    <>
      <LimitCategoryCreateHeader
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={props.onGoBack}
      />
      <LimitCategoryCreateContent {...contentProps} />
    </>
  );
}

function getLimitCategoryCreateContentProps(props: {
  month: string;
  onCreateNewCategory: () => void;
  onHideSnackbar: () => void;
  onInfoMessage: (message: string) => void;
  onSaveCategory: (state: LimitCategoryFormState) => void;
  refreshKey: number;
  snackbarMessage: string;
}): LimitCategoryCreateContentProps {
  return {
    month: props.month,
    onCreateNewCategory: props.onCreateNewCategory,
    onHideInfoMessage: props.onHideSnackbar,
    onInfoMessage: props.onInfoMessage,
    onSaveCategory: props.onSaveCategory,
    refreshKey: props.refreshKey,
    snackbarMessage: props.snackbarMessage,
  };
}

function LimitCategoryCreateHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onGoBack: () => void;
}) {
  return (
    <SheetHeader
      canGoBack
      dragHandleProps={props.dragHandleProps}
      onClose={props.onClose}
      onGoBack={props.onGoBack}
      title="Tambah Kategori 💖"
    />
  );
}

function LimitEditContent(props: {
  onSave: (state: LimitEditFormState) => void;
  state: LimitEditFormState;
}) {
  return (
    <View style={styles.walletForm}>
      <LimitEditFields state={props.state} />
      <LimitEditSaveButton onPress={() => props.onSave(props.state)} />
    </View>
  );
}

function LimitEditFields(props: { state: LimitEditFormState }) {
  return (
    <>
      <WalletFormField
        editable={false}
        label="Kategori Pengeluaran"
        placeholder={props.state.label}
        value={props.state.label}
      />
      <WalletFormField
        keyboardType="number-pad"
        label="Batas Bulanan"
        onChangeText={props.state.setLimitAmount}
        placeholder="Rp 500.000"
        value={props.state.limitAmount}
      />
    </>
  );
}

function LimitEditSaveButton(props: { onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.saveWalletButton}>
      <Text style={styles.saveWalletButtonText}>Simpan Perubahan</Text>
    </Pressable>
  );
}

function useLimitEditFormState(draft: EditingLimitDraft): LimitEditFormState {
  const [limitAmount, setLimitAmount] = useState(draft.limitAmount);

  return {
    budgetId: draft.budgetId,
    label: draft.label,
    limitAmount,
    setLimitAmount: (value: string) => setLimitAmount(formatMoneyInput(value)),
  };
}

function LimitEditView(props: {
  draft: EditingLimitDraft | null;
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onGoBack: () => void;
  onSave: (state: LimitEditFormState) => void;
}) {
  if (!props.draft) {
    return null;
  }

  return (
    <>
      <LimitEditHeader
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={props.onGoBack}
      />
      {renderLimitEditForm({
        draft: props.draft,
        onSave: props.onSave,
      })}
    </>
  );
}

function renderLimitEditForm(props: {
  draft: EditingLimitDraft;
  onSave: (state: LimitEditFormState) => void;
}) {
  return (
    <LimitEditForm
      draft={props.draft}
      key={props.draft.budgetId}
      onSave={props.onSave}
    />
  );
}

function LimitEditForm(props: {
  draft: EditingLimitDraft;
  onSave: (state: LimitEditFormState) => void;
}) {
  const state = useLimitEditFormState(props.draft);

  return <LimitEditContent onSave={props.onSave} state={state} />;
}

function LimitEditHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onGoBack: () => void;
}) {
  return (
    <SheetHeader
      canGoBack
      dragHandleProps={props.dragHandleProps}
      onClose={props.onClose}
      onGoBack={props.onGoBack}
      title="Edit Batas 💖"
    />
  );
}

function CustomCategoryCreateContent(props: {
  onSaveCategory: (state: CustomCategoryFormState) => void;
}) {
  const state = useCustomCategoryFormState();

  return (
    <View style={styles.walletForm}>
      <WalletFormField
        label="Nama Kategori"
        onChangeText={state.setName}
        placeholder="Transport Malam"
        value={state.name}
      />
      <CategoryColorPicker state={state} />
      <CategoryIconPicker state={state} />
      <Pressable
        onPress={() => props.onSaveCategory(state)}
        style={styles.saveWalletButton}
      >
        <Text style={styles.saveWalletButtonText}>Simpan Kategori</Text>
      </Pressable>
    </View>
  );
}

function CategoryColorPicker(props: { state: CustomCategoryFormState }) {
  return (
    <View style={styles.walletFormField}>
      <Text style={styles.walletFormLabel}>Warna Kategori</Text>
      <View style={styles.categoryPresetRow}>
        {categoryColorPresets.map(color => (
          <Pressable
            key={color}
            onPress={() => props.state.setColor(color)}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              props.state.color === color && styles.colorSwatchActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryIconPicker(props: { state: CustomCategoryFormState }) {
  return (
    <View style={styles.walletFormField}>
      <Text style={styles.walletFormLabel}>Ikon Kategori</Text>
      <View style={styles.walletTypeRow}>
        {categoryIconPresets.map(preset => (
          <CategoryIconPresetButton
            activeIcon={props.state.icon}
            key={preset.icon}
            onPress={() => props.state.setIcon(preset.icon)}
            preset={preset}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryIconPresetButton(props: {
  activeIcon: string;
  onPress: () => void;
  preset: (typeof categoryIconPresets)[number];
}) {
  const isActive = props.activeIcon === props.preset.icon;

  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.iconPresetChip, isActive && styles.iconPresetChipActive]}
    >
      <Text style={styles.iconPresetSymbol}>
        {getBudgetDisplayIcon(props.preset.icon)}
      </Text>
    </Pressable>
  );
}

function useCustomCategoryFormState(): CustomCategoryFormState {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(categoryColorPresets[0]);
  const [icon, setIcon] = useState<string>(categoryIconPresets[0].icon);

  return {
    color,
    icon,
    name,
    setColor,
    setIcon,
    setName,
  };
}

function CustomCategoryCreateView(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onGoBack: () => void;
  onSaveCategory: (state: CustomCategoryFormState) => void;
}) {
  return (
    <>
      <SheetHeader
        canGoBack
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={props.onGoBack}
        title="Tambah Category ✨"
      />
      <CustomCategoryCreateContent onSaveCategory={props.onSaveCategory} />
    </>
  );
}

function LimitDetailListView(props: LimitDetailListViewProps) {
  return (
    <>
      <LimitDetailHeader {...props} />
      <LimitDetailListSnackbar {...props} />
      <LimitDetailContent {...props} />
    </>
  );
}

function LimitDetailListSnackbar(props: {
  onHideSnackbar: () => void;
  snackbarMessage: string;
}) {
  return (
    <Snackbar
      message={props.snackbarMessage}
      onHide={props.onHideSnackbar}
    />
  );
}

function useLimitDetailState(props: LimitDetailStateProps) {
  const state = useLimitDetailLocalState();
  const saveParams = getSaveLimitParams(
    props,
    state.bumpCategoryRefreshKey,
    state.setLimitState,
    state.setSnackbarMessage,
    state.setView,
  );
  const actions = getLimitDetailActions(saveParams, state);

  useLimitDetailRefresh(props.month, props.visible, state.setLimitState);

  return getLimitDetailStateValue(
    getLimitDetailStatePayload(state, actions),
  );
}

function useLimitDetailLocalState() {
  const values = useLimitDetailLocalStateValues();
  const setters = getLimitDetailLocalStateSetters(
    values.setDeleteMode,
    values.setEditMode,
    values.setEditingLimitDraft,
    values.setLimitState,
    values.setSnackbarMessage,
    values.setView,
  );

  return {
    bumpCategoryRefreshKey: () => values.setCategoryRefreshKey(value => value + 1),
    ...getLimitDetailLocalStateValueSnapshot(values),
    ...setters,
  };
}

function useLimitDetailLocalStateValues() {
  const [categoryRefreshKey, setCategoryRefreshKey] = useState(0);
  const [editingLimitDraft, setEditingLimitDraft] = useState<EditingLimitDraft | null>(
    null,
  );
  const [limitState, setLimitState] = useState<LimitDetailState>({ items: [] });
  const modeState = useLimitDetailModeState();
  const sheetState = useLimitDetailSheetState();

  return getLimitDetailLocalStateValuesResult(
    categoryRefreshKey,
    editingLimitDraft,
    limitState,
    modeState,
    setCategoryRefreshKey,
    setEditingLimitDraft,
    setLimitState,
    sheetState,
  );
}

function useLimitDetailModeState() {
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [isEditMode, setEditMode] = useState(false);

  return {
    isDeleteMode,
    isEditMode,
    setDeleteMode,
    setEditMode,
  };
}

function useLimitDetailSheetState() {
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [view, setView] = useState<LimitSheetView>('list');

  return {
    setSnackbarMessage,
    setView,
    snackbarMessage,
    view,
  };
}

function getLimitDetailLocalStateValuesResult(
  categoryRefreshKey: number,
  editingLimitDraft: EditingLimitDraft | null,
  limitState: LimitDetailState,
  modeState: ReturnType<typeof useLimitDetailModeState>,
  setCategoryRefreshKey: Dispatch<SetStateAction<number>>,
  setEditingLimitDraft: Dispatch<SetStateAction<EditingLimitDraft | null>>,
  setLimitState: Dispatch<SetStateAction<LimitDetailState>>,
  sheetState: ReturnType<typeof useLimitDetailSheetState>,
) {
  return {
    categoryRefreshKey,
    editingLimitDraft,
    limitState,
    setCategoryRefreshKey,
    setEditingLimitDraft,
    setLimitState,
    ...getLimitDetailModeStateResult(modeState),
    ...getLimitDetailSheetStateResult(sheetState),
  };
}

function getLimitDetailModeStateResult(
  modeState: ReturnType<typeof useLimitDetailModeState>,
) {
  return {
    isDeleteMode: modeState.isDeleteMode,
    isEditMode: modeState.isEditMode,
    setDeleteMode: modeState.setDeleteMode,
    setEditMode: modeState.setEditMode,
  };
}

function getLimitDetailSheetStateResult(
  sheetState: ReturnType<typeof useLimitDetailSheetState>,
) {
  return {
    setSnackbarMessage: sheetState.setSnackbarMessage,
    setView: sheetState.setView,
    snackbarMessage: sheetState.snackbarMessage,
    view: sheetState.view,
  };
}

function getLimitDetailStatePayload(
  state: ReturnType<typeof useLimitDetailLocalState>,
  actions: ReturnType<typeof getLimitDetailActions>,
) {
  return {
    categoryRefreshKey: state.categoryRefreshKey,
    editingLimitDraft: state.editingLimitDraft,
    hideSnackbar: () => state.setSnackbarMessage(''),
    isDeleteMode: state.isDeleteMode,
    isEditMode: state.isEditMode,
    limitItems: state.limitState.items,
    setView: state.setView,
    showSnackbar: state.setSnackbarMessage,
    snackbarMessage: state.snackbarMessage,
    ...actions,
    view: state.view,
  };
}

function getLimitDetailLocalStateValueSnapshot(
  values: ReturnType<typeof useLimitDetailLocalStateValues>,
) {
  return {
    categoryRefreshKey: values.categoryRefreshKey,
    editingLimitDraft: values.editingLimitDraft,
    isDeleteMode: values.isDeleteMode,
    isEditMode: values.isEditMode,
    limitState: values.limitState,
    snackbarMessage: values.snackbarMessage,
    view: values.view,
  };
}

function getLimitDetailLocalStateSetters(
  setDeleteMode: Dispatch<SetStateAction<boolean>>,
  setEditMode: Dispatch<SetStateAction<boolean>>,
  setEditingLimitDraft: Dispatch<SetStateAction<EditingLimitDraft | null>>,
  setLimitState: Dispatch<SetStateAction<LimitDetailState>>,
  setSnackbarMessage: Dispatch<SetStateAction<string>>,
  setView: Dispatch<SetStateAction<LimitSheetView>>,
) {
  return {
    setDeleteMode,
    setEditMode,
    setEditingLimitDraft,
    setLimitState,
    setSnackbarMessage,
    setView,
  };
}

function getLimitDetailActions(
  params: SaveLimitParams,
  state: ReturnType<typeof useLimitDetailLocalState>,
) {
  return {
    deleteCategory: getDeleteLimitCategoryHandler(params),
    editCategory: getEditLimitCategoryHandler(params),
    openEditCategory: getOpenEditLimitHandler(state),
    saveCustomCategory: getSaveCustomCategoryHandler(params),
    saveCategory: getSaveLimitCategoryHandler(params),
    toggleEditMode: getToggleLimitEditModeHandler(state),
    toggleDeleteMode: () => {
      state.setEditMode(false);
      state.setDeleteMode(value => !value);
    },
    usePreviousMonth: getUsePreviousMonthHandler(params, state.limitState),
  };
}

function getSaveLimitParams(
  props: Pick<LimitDetailStateProps, 'month' | 'onChanged'>,
  bumpCategoryRefreshKey: () => void,
  setLimitState: SetLimitState,
  setSnackbarMessage: (message: string) => void,
  setView: (view: LimitSheetView) => void,
): SaveLimitParams {
  return {
    bumpCategoryRefreshKey,
    month: props.month,
    onChanged: props.onChanged,
    setLimitState,
    setSnackbarMessage,
    setView,
  };
}

function getLimitDetailStateValue<TValue extends object>(value: TValue) {
  return value;
}

function getUsePreviousMonthHandler(
  params: SaveLimitParams,
  limitState: LimitDetailState,
) {
  return () => {
    copyPreviousLimitDetails(
      params.month,
      limitState.previousMonth,
      params.setLimitState,
    )
      .then(() => handlePreviousLimitSuccess(
        params.onChanged,
        params.setSnackbarMessage,
      ))
      .catch(() => params.setSnackbarMessage(
        'Belum ada aturan bulan kemarin yang bisa dipakai.',
      ));
  };
}

function handlePreviousLimitSuccess(
  onChanged: () => void,
  setSnackbarMessage: (message: string) => void,
) {
  setSnackbarMessage('');
  onChanged();
}

function getSaveLimitCategoryHandler(params: SaveLimitParams) {
  return (state: LimitCategoryFormState) => {
    createLimitCategory(params.month, state)
      .then(limitState => handleCreateLimitSuccess(params, limitState))
      .catch(() => params.setSnackbarMessage('Batas kategori belum bisa disimpan.'));
  };
}

function getEditLimitCategoryHandler(params: SaveLimitParams) {
  return (state: LimitEditFormState) => {
    updateLimitCategory(params.month, state)
      .then(limitState => handleUpdateLimitSuccess(params, limitState))
      .catch(() => params.setSnackbarMessage('Batas kategori belum bisa diperbarui.'));
  };
}

function getSaveCustomCategoryHandler(params: SaveLimitParams) {
  return (state: CustomCategoryFormState) => {
    createCustomCategory(state)
      .then(() => handleCreateCustomCategorySuccess(params))
      .catch(() => params.setSnackbarMessage('Kategori baru belum bisa disimpan.'));
  };
}

function getOpenEditLimitHandler(
  state: ReturnType<typeof useLimitDetailLocalState>,
) {
  return (item: LimitDetail) => {
    state.setDeleteMode(false);
    state.setEditMode(false);
    state.setEditingLimitDraft({
      budgetId: item.id,
      label: item.label,
      limitAmount: formatRupiah(item.limitAmount),
    });
    state.setView('edit');
  };
}

function getToggleLimitEditModeHandler(
  state: ReturnType<typeof useLimitDetailLocalState>,
) {
  return () => {
    state.setDeleteMode(false);
    state.setEditMode(value => !value);
  };
}

function getDeleteLimitCategoryHandler(params: SaveLimitParams) {
  return (budgetId: string) => {
    params.setLimitState(state => removeLimitDetailItem(state, budgetId));
    deleteLimitCategory(params.month, budgetId)
      .then(limitState => handleDeleteLimitSuccess(params, limitState))
      .catch(() => handleDeleteLimitError(params));
  };
}

function removeLimitDetailItem(state: LimitDetailState, budgetId: string) {
  return {
    ...state,
    items: state.items.filter(item => item.id !== budgetId),
  };
}

function handleDeleteLimitSuccess(
  params: SaveLimitParams,
  limitState: LimitDetailState,
) {
  params.setLimitState(limitState);
  params.setSnackbarMessage('');
  params.onChanged();
}

function handleDeleteLimitError(params: SaveLimitParams) {
  fetchLimitDetails(params.month)
    .then(params.setLimitState)
    .catch(() => undefined);
  params.setSnackbarMessage('Batas kategori belum bisa dihapus.');
  params.onChanged();
}

function handleCreateLimitSuccess(
  params: {
    onChanged: () => void;
    setLimitState: (state: LimitDetailState) => void;
    setSnackbarMessage: (message: string) => void;
    setView: (view: LimitSheetView) => void;
  },
  limitState: LimitDetailState,
) {
  params.setLimitState(limitState);
  params.setSnackbarMessage(
    'Batas kategori tersimpan dan langsung menyesuaikan transaksi bulan ini.',
  );
  params.setView('list');
  params.onChanged();
}

function handleCreateCustomCategorySuccess(params: SaveLimitParams) {
  params.bumpCategoryRefreshKey();
  params.setSnackbarMessage('Kategori baru berhasil ditambahkan.');
  params.setView('create');
}

function handleUpdateLimitSuccess(
  params: {
    onChanged: () => void;
    setLimitState: (state: LimitDetailState) => void;
    setSnackbarMessage: (message: string) => void;
    setView: (view: LimitSheetView) => void;
  },
  limitState: LimitDetailState,
) {
  params.setLimitState(limitState);
  params.setSnackbarMessage('Batas kategori berhasil diperbarui.');
  params.setView('list');
  params.onChanged();
}

function useLimitDetailRefresh(
  month: string,
  visible: boolean,
  setLimitState: SetLimitState,
) {
  useEffect(() => {
    if (visible) {
      fetchLimitDetails(month)
        .then(setLimitState)
        .catch(() => setLimitState({ items: [] }));
    }
  }, [month, visible]);
}

async function copyPreviousLimitDetails(
  month: string,
  previousMonth: BudgetPreviousMonth | undefined,
  setLimitState: SetLimitState,
) {
  const token = await getAuthToken();

  if (!token || !previousMonth?.available) {
    throw new Error('Previous month unavailable');
  }

  const response = await copyPreviousBudgets(token, {
    sourceMonth: previousMonth.month,
    targetMonth: month,
  });
  setLimitState(mapBudgetsResponse(response.data));
}

async function createLimitCategory(
  month: string,
  state: LimitCategoryFormState,
) {
  const token = await getAuthToken();

  if (!token || !isLimitCategoryFormValid(state)) {
    throw new Error('Invalid limit category form');
  }

  await createBudget(token, getCreateBudgetPayload(month, state));

  return fetchLimitDetails(month);
}

async function createCustomCategory(state: CustomCategoryFormState) {
  const token = await getAuthToken();

  if (!token || !isCustomCategoryFormValid(state)) {
    throw new Error('Invalid custom category form');
  }

  await createCategory(token, getCreateCategoryPayload(state));
}

async function updateLimitCategory(
  month: string,
  state: LimitEditFormState,
) {
  const token = await getAuthToken();

  if (!token || !isLimitEditFormValid(state)) {
    throw new Error('Invalid limit edit form');
  }

  await updateBudget(token, state.budgetId, {
    limitAmount: parseWalletBalance(state.limitAmount),
    month,
  });

  return fetchLimitDetails(month);
}

async function deleteLimitCategory(month: string, budgetId: string) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Missing auth token');
  }

  await deleteBudget(token, budgetId, month);

  return fetchLimitDetails(month);
}

function isLimitCategoryFormValid(state: LimitCategoryFormState) {
  return Boolean(state.selectedCategoryId) && parseWalletBalance(state.limitAmount) > 0;
}

function isCustomCategoryFormValid(state: CustomCategoryFormState) {
  return state.name.trim().length >= 2 && Boolean(state.color) && Boolean(state.icon);
}

function isLimitEditFormValid(state: LimitEditFormState) {
  return Boolean(state.budgetId) && parseWalletBalance(state.limitAmount) > 0;
}

function getCreateBudgetPayload(
  month: string,
  state: LimitCategoryFormState,
): CreateBudgetPayload {
  return {
    categoryId: state.selectedCategoryId,
    limitAmount: parseWalletBalance(state.limitAmount),
    month,
  };
}

function getCreateCategoryPayload(
  state: CustomCategoryFormState,
): CreateCategoryPayload {
  return {
    color: state.color,
    icon: state.icon,
    name: state.name.trim(),
    type: 'EXPENSE',
  };
}

function LimitDetailSheetContent(props: LimitDetailSheetContentProps) {
  const limitSheet = useLimitDetailState(props);

  return renderLimitDetailSheetView(props, limitSheet);
}

function renderLimitDetailSheetView(
  props: LimitDetailSheetContentProps,
  limitSheet: LimitSheetState,
) {
  if (limitSheet.view === 'category') {
    return <LimitDetailCategoryRoute limitSheet={limitSheet} props={props} />;
  }

  if (limitSheet.view === 'create') {
    return <LimitDetailCreateRoute limitSheet={limitSheet} props={props} />;
  }

  if (limitSheet.view === 'edit') {
    return <LimitDetailEditRoute limitSheet={limitSheet} props={props} />;
  }

  return <LimitDetailListRoute limitSheet={limitSheet} props={props} />;
}

function LimitDetailCreateRoute(params: {
  limitSheet: LimitSheetState;
  props: LimitDetailSheetContentProps;
}) {
  return (
    <LimitCategoryCreateView
      dragHandleProps={params.props.dragHandleProps}
      month={params.props.month}
      onClose={params.props.onClose}
      onCreateNewCategory={() => params.limitSheet.setView('category')}
      onGoBack={() => params.limitSheet.setView('list')}
      onHideSnackbar={params.limitSheet.hideSnackbar}
      onInfoMessage={params.limitSheet.showSnackbar}
      onSaveCategory={params.limitSheet.saveCategory}
      refreshKey={params.limitSheet.categoryRefreshKey}
      snackbarMessage={params.limitSheet.snackbarMessage}
    />
  );
}

function LimitDetailCategoryRoute(params: {
  limitSheet: LimitSheetState;
  props: LimitDetailSheetContentProps;
}) {
  return (
    <CustomCategoryCreateView
      dragHandleProps={params.props.dragHandleProps}
      onClose={params.props.onClose}
      onGoBack={() => params.limitSheet.setView('create')}
      onSaveCategory={params.limitSheet.saveCustomCategory}
    />
  );
}

function LimitDetailEditRoute(params: {
  limitSheet: LimitSheetState;
  props: LimitDetailSheetContentProps;
}) {
  return (
    <LimitEditView
      draft={params.limitSheet.editingLimitDraft}
      dragHandleProps={params.props.dragHandleProps}
      onClose={params.props.onClose}
      onGoBack={() => params.limitSheet.setView('list')}
      onSave={params.limitSheet.editCategory}
    />
  );
}

function LimitDetailListRoute(params: {
  limitSheet: LimitSheetState;
  props: LimitDetailSheetContentProps;
}) {
  return (
    <LimitDetailListView
      dragHandleProps={params.props.dragHandleProps}
      isDeleteMode={params.limitSheet.isDeleteMode}
      isEditMode={params.limitSheet.isEditMode}
      limitItems={params.limitSheet.limitItems}
      onCreateCategory={() => params.limitSheet.setView('create')}
      onDeleteBudget={params.limitSheet.deleteCategory}
      onEditBudget={params.limitSheet.openEditCategory}
      onHideSnackbar={params.limitSheet.hideSnackbar}
      onToggleEdit={params.limitSheet.toggleEditMode}
      onToggleDelete={params.limitSheet.toggleDeleteMode}
      onUsePreviousMonth={params.limitSheet.usePreviousMonth}
      snackbarMessage={params.limitSheet.snackbarMessage}
    />
  );
}

function LimitDetailBottomSheet(props: {
  month: string;
  onChanged: () => void;
  onClose: () => void;
  visible: boolean;
}) {
  return (
    <BottomSheet
      containerStyle={styles.limitDetailContainer}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <LimitDetailSheetContent
          dragHandleProps={dragHandleProps}
          month={props.month}
          onChanged={props.onChanged}
          onClose={props.onClose}
          visible={props.visible}
        />
      )}
    </BottomSheet>
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
      <HistoryAndWalletSheets {...props} />
      <AddSheetOverlay {...props} />
    </>
  );
}

function HistoryAndWalletSheets(props: DashboardSheetsProps) {
  return (
    <>
      <FullHistoryBottomSheet
        availablePeriod={props.availablePeriod}
        month={props.historyMonth}
        monthLabel={props.historyMonthLabel}
        onClose={props.onCloseFullHistory}
        onSelectFilter={props.onSelectHistoryFilter}
        period={props.historyPeriod}
        selectedFilter={props.selectedHistoryFilter}
        visible={props.isFullHistoryVisible}
      />
      <WalletBottomSheet
        onChanged={props.onDashboardChanged}
        onClose={props.onCloseWalletSheet}
        totalAmount={props.totalWalletAmount}
        visible={props.isWalletSheetVisible}
      />
    </>
  );
}

function DashboardRefreshControl(props: {
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <RefreshControl
      colors={[colors.primary]}
      onRefresh={props.onRefresh}
      refreshing={props.isRefreshing}
      tintColor={colors.primary}
    />
  );
}

function DashboardContent(props: DashboardContentProps) {
  return (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={styles.pageContent}
      refreshControl={
        <DashboardRefreshControl
          isRefreshing={props.isRefreshing}
          onRefresh={props.onRefresh}
        />
      }
    >
      <Header onLogout={props.onLogout} user={props.user} />
      <DashboardBodySections {...props} />
    </ScrollView>
  );
}

function DashboardBodySections(props: DashboardContentProps) {
  return (
    <>
      <DashboardBalanceCard {...props} />
      <DashboardMiddleSections {...props} />
      <DashboardFooterSections {...props} />
    </>
  );
}

function DashboardMiddleSections(props: DashboardContentProps) {
  return (
    <>
      <SummaryCards
        dashboardSummary={props.dashboardSummary}
        onOpenHistory={props.onOpenFullHistory}
        periodLabel={props.filterLabel}
      />
      <UsageSection
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
      <SpendingLimitSection
        dashboardSummary={props.dashboardSummary}
        onOpenLimitDetail={props.onOpenLimitDetail}
      />
      <HistorySection
        histories={props.historyItems}
        onOpenFullHistory={props.onOpenFullHistory}
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
        <DashboardRefreshControl
          isRefreshing={props.isRefreshing}
          onRefresh={props.onRefresh}
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

function DashboardBalanceCard(props: {
  dashboardSummary: DashboardSummary | null;
  onOpenWalletSheet: () => void;
}) {
  return (
    <BalanceCard
      balanceFormatted={props.dashboardSummary?.balance.formatted ?? 'Rp 0'}
      onOpenWalletSheet={props.onOpenWalletSheet}
      selectedWalletName={
        props.dashboardSummary?.selectedWallet.name ?? 'Total Asset Saya'
      }
    />
  );
}

function useSheetVisibilityState() {
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [isFullHistoryVisible, setFullHistoryVisible] = useState(false);
  const [isLimitDetailVisible, setLimitDetailVisible] = useState(false);
  const [isUsagePeriodVisible, setUsagePeriodVisible] = useState(false);
  const [isWalletSheetVisible, setWalletSheetVisible] = useState(false);

  return {
    isAddSheetVisible,
    isFullHistoryVisible,
    isLimitDetailVisible,
    isUsagePeriodVisible,
    isWalletSheetVisible,
    setAddSheetVisible,
    setFullHistoryVisible,
    setLimitDetailVisible,
    setUsagePeriodVisible,
    setWalletSheetVisible,
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
  setWalletSheetVisible: (value: boolean) => void;
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
  setWalletSheetVisible: (value: boolean) => void;
}) {
  return {
    onCloseAddSheet: () => params.setAddSheetVisible(false),
    onCloseFullHistory: () => params.setFullHistoryVisible(false),
    onCloseLimitDetail: () => params.setLimitDetailVisible(false),
    onCloseUsagePeriod: () => params.setUsagePeriodVisible(false),
    onCloseWalletSheet: () => params.setWalletSheetVisible(false),
  };
}

function getDashboardSheetOpenActions(params: {
  openFullHistory: (filter?: HistoryFilter) => void;
  setAddSheetVisible: (value: boolean) => void;
  setLimitDetailVisible: (value: boolean) => void;
  setUsagePeriodVisible: (value: boolean) => void;
  setWalletSheetVisible: (value: boolean) => void;
}) {
  return {
    onOpenAddSheet: () => params.setAddSheetVisible(true),
    onOpenFullHistory: params.openFullHistory,
    onOpenLimitDetail: () => params.setLimitDetailVisible(true),
    onOpenUsagePeriod: () => params.setUsagePeriodVisible(true),
    onOpenWalletSheet: () => params.setWalletSheetVisible(true),
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

function getDashboardPeriod(period: ReturnType<typeof usePeriodState>) {
  const monthIndex = getMonthNumber(period.selectedMonth);

  return {
    apiMonth: `${period.selectedYear}-${String(monthIndex).padStart(2, '0')}`,
    label: `${period.selectedMonth} ${period.selectedYear}`,
  };
}

function UsagePeriodOverlay(props: {
  availablePeriod?: DashboardSummary['availablePeriod'];
  period: ReturnType<typeof usePeriodState>;
  sheets: ReturnType<typeof useDashboardSheetState>;
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
  period: ReturnType<typeof usePeriodState>,
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

async function fetchFullHistoryGroups(
  month: string,
  filter: HistoryFilter,
) {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  const response = await getTransactions(token, getHistoryQuery(month, filter));

  return groupHistoryItems(response.data.map(mapTransactionToHistoryItem));
}

function getHistoryQuery(month: string, filter: HistoryFilter) {
  return {
    limit: 50,
    month,
    page: 1,
    type: getTransactionTypeFilter(filter),
  };
}

function getTransactionTypeFilter(filter: HistoryFilter) {
  const filters: Partial<Record<HistoryFilter, TransactionType>> = {
    Pemasukan: 'INCOME',
    Pengeluaran: 'EXPENSE',
    'Pindah Dana': 'TRANSFER',
  };

  return filters[filter];
}

function mapTransactionToHistoryItem(transaction: Transaction): HistoryItemData {
  return {
    amount: transaction.formattedAmount || formatTransactionAmount(transaction),
    icon: getTransactionIcon(transaction),
    id: transaction.id,
    meta: getTransactionMeta(transaction),
    occurredAt: transaction.occurredAt,
    title: transaction.title,
    tone: getTransactionTone(transaction.type),
  };
}

function getTransactionTone(type: TransactionType): HistoryTone {
  if (type === 'INCOME') {
    return 'income';
  }

  return type === 'TRANSFER' ? 'transfer' : 'expense';
}

function getTransactionIcon(transaction: Transaction) {
  if (transaction.type === 'TRANSFER') {
    return '↔';
  }

  return getBudgetDisplayIcon(transaction.category?.icon ?? '');
}

function formatTransactionAmount(transaction: Transaction) {
  const prefix = transaction.type === 'INCOME' ? '+ ' : '- ';

  return `${prefix}${formatRupiah(transaction.amount)}`;
}

function getTransactionMeta(transaction: Transaction) {
  return `${getTransactionWalletLabel(transaction)} • ${getTransactionTime(transaction)}`;
}

function getTransactionWalletLabel(transaction: Transaction) {
  if (transaction.type === 'TRANSFER') {
    return `${transaction.fromWallet?.name ?? '-'} → ${transaction.toWallet?.name ?? '-'}`;
  }

  return `Via ${transaction.wallet?.name ?? '-'}`;
}

function getTransactionTime(transaction: Transaction) {
  return new Date(transaction.occurredAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function groupHistoryItems(items: HistoryItemData[]) {
  return items.reduce<FullHistoryGroupData[]>((groups, item) => (
    upsertHistoryGroup(groups, getHistoryGroupTitle(item.occurredAt), item)
  ), []);
}

function upsertHistoryGroup(
  groups: FullHistoryGroupData[],
  title: string,
  item: HistoryItemData,
) {
  const group = groups.find(value => value.title === title);

  if (group) {
    group.transactions.push(item);

    return groups;
  }

  return [...groups, { id: title, title, transactions: [item] }];
}

function getHistoryGroupTitle(occurredAt: string) {
  const date = new Date(occurredAt);

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getWalletTone(wallet: Wallet): WalletTone {
  if (wallet.type === 'EWALLET') {
    return 'primary';
  }

  if (wallet.type === 'SAVINGS') {
    return 'purple';
  }

  return wallet.type === 'CASH' ? 'yellow' : 'blue';
}

function getWalletIcon(wallet: Wallet) {
  if (wallet.type === 'EWALLET') {
    return '▦';
  }

  if (wallet.type === 'SAVINGS') {
    return '★';
  }

  return wallet.type === 'CASH' ? '▤' : '▥';
}

function getWalletFormType(wallet: Wallet): WalletType {
  if (wallet.type === 'EWALLET') {
    return 'E-Wallet';
  }

  if (wallet.type === 'CASH') {
    return 'Cash';
  }

  if (wallet.type === 'SAVINGS') {
    return 'Savings';
  }

  if (wallet.type === 'OTHER') {
    return 'Other';
  }

  return 'Bank';
}

function mapWalletToItem(wallet: Wallet): WalletItem {
  return {
    amount: wallet.formattedBalance,
    balance: wallet.balance,
    icon: getWalletIcon(wallet),
    id: wallet.id,
    name: wallet.name,
    selectedType: getWalletFormType(wallet),
    tone: getWalletTone(wallet),
  };
}

async function fetchWalletItems() {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  const response = await getWallets(token);

  return response.data.map(mapWalletToItem);
}

function useWalletItems(visible: boolean, refreshKey: number) {
  const [items, setItems] = useState<WalletItem[]>([]);
  const remove = (walletId: string) => {
    setItems(value => value.filter(item => item.id !== walletId));
  };

  useEffect(() => {
    if (visible) {
      loadWalletItems(setItems).catch(() => undefined);
    }
  }, [refreshKey, visible]);

  return { items, remove };
}

async function loadWalletItems(setItems: (items: WalletItem[]) => void) {
  try {
    setItems(await fetchWalletItems());
  } catch {
    setItems([]);
  }
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
    <>
      <DashboardContent
        chartAnimationKey={props.dashboardData.chartAnimationKey}
        dashboardSummary={props.dashboardData.dashboardSummary}
        filterLabel={props.filterLabel}
        historyItems={props.dashboardData.historyItems}
        isRefreshing={props.dashboardData.isRefreshing}
        onOpenFullHistory={props.sheets.onOpenFullHistory}
        onOpenLimitDetail={props.sheets.onOpenLimitDetail}
        onOpenUsagePeriod={props.sheets.onOpenUsagePeriod}
        onOpenWalletSheet={props.sheets.onOpenWalletSheet}
        onRefresh={props.dashboardData.refreshDashboard}
        onLogout={props.onLogout}
        user={props.user}
      />
      <FloatingAddButton onPress={props.sheets.onOpenAddSheet} />
    </>
  );
}

function DashboardScreen({ onLogout, user }: DashboardScreenProps) {
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
      <DashboardMainContent
        dashboardData={props.dashboardData}
        filterLabel={props.periodFilter.label}
        onLogout={props.onLogout}
        sheets={props.sheets}
        user={props.user}
      />
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
      availablePeriod={props.availablePeriod}
      apiMonth={props.periodFilter.apiMonth}
      historyMonth={props.historyPeriodFilter.apiMonth}
      historyMonthLabel={props.historyPeriodFilter.label}
      historyPeriod={props.historyPeriodState}
      onDashboardChanged={props.dashboardData.refreshDashboard}
      totalWalletAmount={getDashboardTotalAmount(props.dashboardData)}
      usagePeriodLabel={props.periodFilter.label}
    />
  );
}

function getDashboardTotalAmount(data: ReturnType<typeof useDashboardData>) {
  return data.dashboardSummary?.balance.formatted ?? 'Rp 0';
}

export default DashboardScreen;
