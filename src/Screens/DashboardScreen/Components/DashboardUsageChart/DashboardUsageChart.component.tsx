import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  CategoryDonutChart,
  type CategoryDonutChartItem,
} from '../../../../Components/CategoryDonutChart';
import {
  getTransactions,
  type Transaction,
} from '../../../../Services';
import { getAuthToken } from '../../../../Utils/authStorage';

import styles from './DashboardUsageChart.styles';
import type {
  DashboardUsageChartProps,
  IncomeChartState,
} from './DashboardUsageChart.types';

function DashboardUsageChart(props: DashboardUsageChartProps) {
  const income = useIncomeChartState(props);

  return (
    <>
      <ExpenseUsageChart {...props} />
      <IncomeUsageChart
        animationKey={props.chartAnimationKey}
        income={income}
        isParentLoading={props.isLoading}
      />
    </>
  );
}

function ExpenseUsageChart(props: DashboardUsageChartProps) {
  const chart = props.dashboardSummary?.chart;

  return (
    <UsageChartSection
      action={<UsagePeriodButton {...props} />}
      centerLabel="KELUAR"
      emptyText="Belum ada pengeluaran."
      isLoading={props.isLoading}
      items={chart?.categories ?? []}
      loadingText="Memuat penggunaan dompet..."
      title="Penggunaan Dompet Ini"
      totalAmount={chart?.expenseTotal ?? 0}
      animationKey={props.chartAnimationKey}
    />
  );
}

function IncomeUsageChart(props: {
  animationKey: number;
  income: IncomeChartState;
  isParentLoading: boolean;
}) {
  if (props.income.isHidden) {
    return null;
  }

  return (
    <UsageChartSection
      action={<HideIncomeChartButton onPress={props.income.hide} />}
      centerLabel="MASUK"
      emptyText="Belum ada pemasukan."
      isLoading={props.isParentLoading || props.income.isLoading}
      items={props.income.items}
      loadingText="Memuat pemasukan..."
      title="Pemasukan Bulan Ini"
      totalAmount={props.income.totalAmount}
      animationKey={props.animationKey}
    />
  );
}

function UsageChartSection(props: {
  action: ReactNode;
  animationKey: number;
  centerLabel: string;
  emptyText: string;
  isLoading: boolean;
  items: CategoryDonutChartItem[];
  loadingText: string;
  title: string;
  totalAmount: number;
}) {
  return (
    <View style={styles.section}>
      <UsageSectionHeader action={props.action} title={props.title} />
      <View style={styles.card}>
        {props.isLoading ? (
          <UsageChartLoadingState label={props.loadingText} />
        ) : (
          <CategoryDonutChart {...getCategoryDonutChartProps(props)} />
        )}
      </View>
    </View>
  );
}

function getCategoryDonutChartProps(props: {
  animationKey: number;
  centerLabel: string;
  emptyText: string;
  items: CategoryDonutChartItem[];
  totalAmount: number;
}) {
  return {
    animationKey: props.animationKey,
    centerLabel: props.centerLabel,
    emptyText: props.emptyText,
    items: props.items,
    totalAmount: props.totalAmount,
  };
}

function UsageSectionHeader(props: {
  action: ReactNode;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      {props.action}
    </View>
  );
}

function UsagePeriodButton(props: {
  filterLabel: string;
  isLoading: boolean;
  onOpenUsagePeriod: () => void;
}) {
  return (
    <Pressable disabled={props.isLoading} onPress={props.onOpenUsagePeriod}>
      <Text style={[styles.sectionLink, props.isLoading && styles.sectionLinkDisabled]}>
        {props.isLoading ? 'Memuat...' : `${props.filterLabel}⌄`}
      </Text>
    </Pressable>
  );
}

function HideIncomeChartButton(props: { onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.hideButton}>
      <Text style={styles.hideButtonText}>Sembunyikan</Text>
    </Pressable>
  );
}

function UsageChartLoadingState(props: { label: string }) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator color={styles.loadingSpinner.color} size="large" />
      <Text style={styles.loadingText}>{props.label}</Text>
    </View>
  );
}

function useIncomeChartState(props: DashboardUsageChartProps): IncomeChartState {
  const [items, setItems] = useState<CategoryDonutChartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [isHidden, setHidden] = useState(false);

  useIncomeChartRequest(props, setItems, setTotalAmount, setLoading);

  return {
    hide: () => setHidden(true),
    isHidden,
    isLoading,
    items,
    totalAmount,
  };
}

function useIncomeChartRequest(
  props: DashboardUsageChartProps,
  setItems: (items: CategoryDonutChartItem[]) => void,
  setTotalAmount: (value: number) => void,
  setLoading: (value: boolean) => void,
) {
  useEffect(() => createIncomeChartLoadEffect({
    month: props.apiMonth,
    periodId: props.periodId,
    setItems,
    setLoading,
    setTotalAmount,
  }), [props.apiMonth, props.periodId, setItems, setLoading, setTotalAmount]);
}

function createIncomeChartLoadEffect(params: {
  month: string;
  periodId?: string;
  setItems: (items: CategoryDonutChartItem[]) => void;
  setLoading: (value: boolean) => void;
  setTotalAmount: (value: number) => void;
}) {
  let isMounted = true;

  loadIncomeChart({
    ...params,
    isMounted: () => isMounted,
  }).catch(() => undefined);

  return () => {
    isMounted = false;
  };
}

async function loadIncomeChart(params: {
  isMounted: () => boolean;
  month: string;
  periodId?: string;
  setItems: (items: CategoryDonutChartItem[]) => void;
  setLoading: (value: boolean) => void;
  setTotalAmount: (value: number) => void;
}) {
  const token = await getAuthToken();

  if (!canLoadIncomeChart(token, params.isMounted)) {
    return;
  }

  params.setLoading(true);

  try {
    setIncomeChartData(
      params,
      await getIncomeTransactions(token, params.month, params.periodId),
    );
  } finally {
    stopIncomeChartLoading(params);
  }
}

function stopIncomeChartLoading(params: {
  isMounted: () => boolean;
  setLoading: (value: boolean) => void;
}) {
  if (params.isMounted()) {
    params.setLoading(false);
  }
}

function canLoadIncomeChart(
  token: string | null,
  isMounted: () => boolean,
): token is string {
  return Boolean(token && isMounted());
}

async function getIncomeTransactions(
  token: string,
  month: string,
  periodId?: string,
) {
  return (await getTransactions(token, {
    limit: 1000,
    month,
    periodId,
    type: 'INCOME',
  })).data;
}

function setIncomeChartData(
  params: Pick<Parameters<typeof loadIncomeChart>[0], 'isMounted' | 'setItems' | 'setTotalAmount'>,
  transactions: Transaction[],
) {
  if (!params.isMounted()) {
    return;
  }

  const items = mapTransactionsToChartItems(transactions);

  params.setItems(items);
  params.setTotalAmount(getTransactionTotal(transactions));
}

function mapTransactionsToChartItems(transactions: Transaction[]) {
  const grouped = groupIncomeTransactions(transactions);
  const totalAmount = getGroupedTotal(grouped);

  return Array.from(grouped.values()).map(item => ({
    ...item,
    percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
  }));
}

function groupIncomeTransactions(transactions: Transaction[]) {
  return transactions.reduce<Map<string, CategoryDonutChartItem>>((grouped, transaction) => {
    const key = transaction.category?.id ?? 'income-other';
    const current = grouped.get(key) ?? getFallbackIncomeChartItem(transaction);

    grouped.set(key, {
      ...current,
      amount: current.amount + transaction.amount,
    });

    return grouped;
  }, new Map());
}

function getFallbackIncomeChartItem(transaction: Transaction): CategoryDonutChartItem {
  return {
    amount: 0,
    categoryId: transaction.category?.id ?? 'income-other',
    color: transaction.category?.color ?? '#4EA8DE',
    name: transaction.category?.name ?? 'Pemasukan',
    percentage: 0,
  };
}

function getGroupedTotal(grouped: Map<string, CategoryDonutChartItem>) {
  return Array.from(grouped.values()).reduce((sum, item) => sum + item.amount, 0);
}

function getTransactionTotal(transactions: Transaction[]) {
  return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
}

export default DashboardUsageChart;
