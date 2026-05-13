import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import AddTransactionSheet from '../../../../Components/AddTransactionSheet';
import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../../../Components/BottomSheet';
import {
  getTransactions,
  type DashboardSummary,
  type Transaction,
  type TransactionType,
} from '../../../../Services';
import { getAuthToken } from '../../../../Utils/authStorage';
import { monthOptions } from '../../DashboardScreen.data';
import type {
  FullHistoryGroupData,
  HistoryFilter,
  HistoryItemData,
  HistoryTone,
  PeriodState,
} from '../../DashboardScreen.types';

import styles from './DashboardHistory.styles';
import type {
  DashboardHistoryProps,
  FullHistoryBottomSheetProps,
  FullHistoryPeriodContentProps,
} from './DashboardHistory.types';

function DashboardHistory(props: DashboardHistoryProps) {
  const edit = useHistoryEditState(props.onChanged);

  return (
    <>
      <HistorySection
        histories={props.histories}
        isLoading={props.isLoading}
        onEditTransaction={edit.setEditingTransaction}
        onOpenFullHistory={props.onOpenFullHistory}
      />
      <FullHistoryBottomSheet
        {...props}
        onEditTransaction={edit.setEditingTransaction}
        refreshKey={edit.historyRefreshKey}
      />
      <HistoryEditSheet
        editingTransaction={edit.editingTransaction}
        onChanged={edit.onEditChanged}
        onClose={edit.closeEditSheet}
      />
    </>
  );
}

function useHistoryEditState(onChanged: () => void) {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  return {
    closeEditSheet: () => setEditingTransaction(null),
    editingTransaction,
    historyRefreshKey,
    onEditChanged: () => {
      setHistoryRefreshKey(key => key + 1);
      onChanged();
    },
    setEditingTransaction,
  };
}

function HistoryEditSheet(props: {
  editingTransaction: Transaction | null;
  onChanged: () => void;
  onClose: () => void;
}) {
  return (
    <AddTransactionSheet
      onChanged={props.onChanged}
      onClose={props.onClose}
      transaction={props.editingTransaction}
      visible={Boolean(props.editingTransaction)}
    />
  );
}

function HistorySection(props: {
  histories: HistoryItemData[];
  isLoading: boolean;
  onEditTransaction: (transaction: Transaction) => void;
  onOpenFullHistory: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Histori Lucu 🐾</Text>
        {Boolean(props.histories.length) && (
          <Pressable onPress={props.onOpenFullHistory}>
            <Text style={styles.sectionLink}>Lihat Semua</Text>
          </Pressable>
        )}
      </View>
      <HistoryList
        histories={props.histories}
        isLoading={props.isLoading}
        onEditTransaction={props.onEditTransaction}
      />
    </View>
  );
}

function HistoryList(props: {
  histories: HistoryItemData[];
  isLoading: boolean;
  onEditTransaction: (transaction: Transaction) => void;
}) {
  const groups = groupHistoryItems(props.histories);

  return renderHistoryListContent({
    groups,
    isLoading: props.isLoading,
    onEditTransaction: props.onEditTransaction,
  });
}

function renderHistoryListContent(params: {
  groups: FullHistoryGroupData[];
  isLoading: boolean;
  onEditTransaction: (transaction: Transaction) => void;
}) {
  if (params.isLoading) {
    return <HistoryLoadingState />;
  }

  if (!params.groups.length) {
    return <HistoryEmptyState />;
  }

  return (
    <View style={styles.historyList}>
      {params.groups.map(group => (
        <HistoryGroup
          group={group}
          key={group.id}
          onEditTransaction={params.onEditTransaction}
        />
      ))}
    </View>
  );
}

function HistoryLoadingState() {
  return (
    <View style={styles.historyLoadingState}>
      <ActivityIndicator color={styles.historyLoadingSpinner.color} size="small" />
      <Text style={styles.historyLoadingText}>Memuat histori...</Text>
    </View>
  );
}

function HistoryGroup(props: {
  group: FullHistoryGroupData;
  onEditTransaction: (transaction: Transaction) => void;
}) {
  return (
    <View style={styles.historyGroup}>
      <Text style={styles.historyGroupTitle}>{props.group.title}</Text>
      {props.group.transactions.map(history => (
        <HistoryItem
          history={history}
          key={history.id}
          onEditTransaction={props.onEditTransaction}
        />
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

function HistoryItem(props: {
  history: HistoryItemData;
  onEditTransaction: (transaction: Transaction) => void;
}) {
  const amountStyle = getHistoryAmountStyle(props.history.tone);

  return (
    <Pressable
      onPress={() => props.onEditTransaction(props.history.transaction)}
      style={styles.historyItem}
    >
      <HistoryItemCopy history={props.history} />
      <HistoryItemAmount amount={props.history.amount} amountStyle={amountStyle} />
    </Pressable>
  );
}

function HistoryItemCopy(props: { history: HistoryItemData }) {
  return (
    <View style={styles.historyLeft}>
      <View style={styles.historyIconBox}>
        <Text style={styles.historyIcon}>{props.history.icon}</Text>
      </View>
      <View style={styles.historyCopy}>
        <Text numberOfLines={1} style={styles.historyTitle}>
          {props.history.title}
        </Text>
        <Text style={styles.historyMeta}>{props.history.meta}</Text>
      </View>
    </View>
  );
}

function HistoryItemAmount(props: {
  amount: string;
  amountStyle: object;
}) {
  return (
    <Text
      adjustsFontSizeToFit
      numberOfLines={1}
      style={[styles.historyAmountText, props.amountStyle]}
    >
      {props.amount}
    </Text>
  );
}

function FullHistoryBottomSheet(props: FullHistoryBottomSheetProps) {
  const fullHistory = useFullHistoryGroups(props);
  const {
    closeSheet,
    renderSheetView,
  } = useFullHistorySheetRenderer(props, fullHistory);

  return (
    <BottomSheet
      containerStyle={styles.fullHistoryContainer}
      onClose={closeSheet}
      visible={props.isFullHistoryVisible}
    >
      {renderSheetView}
    </BottomSheet>
  );
}

function useFullHistorySheetRenderer(
  props: FullHistoryBottomSheetProps,
  fullHistory: FullHistoryState,
) {
  const {
    closeSheet,
    openPeriod,
    showList,
    view,
  } = useFullHistorySheetViewState(props);

  return {
    closeSheet,
    renderSheetView: getFullHistoryViewRenderer({
      closeSheet,
      fullHistory,
      openPeriod,
      props,
      showList,
      view,
    }),
  };
}

function getFullHistoryViewRenderer(params: {
  closeSheet: () => void;
  fullHistory: FullHistoryState;
  openPeriod: () => void;
  props: FullHistoryBottomSheetProps;
  showList: () => void;
  view: 'list' | 'period';
}) {
  return ({ dragHandleProps }: { dragHandleProps: BottomSheetDragHandleProps }) => (
    params.view === 'period'
      ? renderFullHistoryPeriod(params, dragHandleProps)
      : renderFullHistoryList(params, dragHandleProps)
  );
}

function renderFullHistoryPeriod(
  params: {
    closeSheet: () => void;
    props: FullHistoryBottomSheetProps;
    showList: () => void;
  },
  dragHandleProps: BottomSheetDragHandleProps,
) {
  return (
    <FullHistoryPeriodContent
      dragHandleProps={dragHandleProps}
      onApply={params.showList}
      onClose={params.closeSheet}
      onGoBack={params.showList}
      period={params.props.historyPeriod}
      range={getAvailablePeriodRange(params.props.availablePeriod)}
    />
  );
}

function renderFullHistoryList(
  params: {
    fullHistory: FullHistoryState;
    openPeriod: () => void;
    props: FullHistoryBottomSheetProps;
  },
  dragHandleProps: BottomSheetDragHandleProps,
) {
  return (
    <FullHistorySheetContent
      dragHandleProps={dragHandleProps}
      groups={params.fullHistory.groups}
      isLoading={params.fullHistory.isLoading}
      monthLabel={params.props.historyMonthLabel}
      onEditTransaction={params.props.onEditTransaction}
      onPressMonth={params.openPeriod}
      onSelectFilter={params.props.onSelectHistoryFilter}
      selectedFilter={params.props.selectedHistoryFilter}
    />
  );
}

function useFullHistorySheetViewState(props: FullHistoryBottomSheetProps) {
  const [view, setView] = useState<'list' | 'period'>('list');

  return {
    closeSheet: () => {
      setView('list');
      props.onCloseFullHistory();
    },
    openPeriod: () => setView('period'),
    showList: () => setView('list'),
    view,
  };
}

function FullHistorySheetContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  groups: FullHistoryGroupData[];
  isLoading: boolean;
  monthLabel: string;
  onEditTransaction: (transaction: Transaction) => void;
  onPressMonth: () => void;
  onSelectFilter: (filter: HistoryFilter) => void;
  selectedFilter: HistoryFilter;
}) {
  return (
    <>
      <FullHistoryHeader {...props} />
      <FullHistoryContent {...props} />
    </>
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

function FullHistoryHandle(props: { dragHandleProps: BottomSheetDragHandleProps }) {
  return (
    <View {...props.dragHandleProps}>
      <View style={styles.fullHistoryHandle} />
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

function FullHistoryContent(props: {
  groups: FullHistoryGroupData[];
  isLoading: boolean;
  onEditTransaction: (transaction: Transaction) => void;
  selectedFilter: HistoryFilter;
}) {
  const hasData = hasVisibleHistory(props.groups, props.selectedFilter);

  return (
    <ScrollView contentContainerStyle={styles.fullHistoryContent}>
      {props.isLoading ? <FullHistoryLoadingState /> : hasData ? props.groups.map(group => (
        <FullHistoryGroup
          group={group}
          key={group.id}
          onEditTransaction={props.onEditTransaction}
          selectedFilter={props.selectedFilter}
        />
      )) : <FullHistoryEmptyState />}
    </ScrollView>
  );
}

function FullHistoryLoadingState() {
  return (
    <View style={styles.fullHistoryLoadingState}>
      <ActivityIndicator color={styles.historyLoadingSpinner.color} size="large" />
      <Text style={styles.historyLoadingText}>Memuat histori lengkap...</Text>
    </View>
  );
}

function FullHistoryGroup(props: {
  group: FullHistoryGroupData;
  onEditTransaction: (transaction: Transaction) => void;
  selectedFilter: HistoryFilter;
}) {
  const transactions = getFilteredTransactions(props.group, props.selectedFilter);

  if (!transactions.length) {
    return null;
  }

  return (
    <View style={styles.fullHistoryGroup}>
      <Text style={styles.fullHistoryGroupTitle}>{props.group.title}</Text>
      <FullHistoryTransactionList
        onEditTransaction={props.onEditTransaction}
        transactions={transactions}
      />
    </View>
  );
}

function FullHistoryTransactionList(props: {
  onEditTransaction: (transaction: Transaction) => void;
  transactions: HistoryItemData[];
}) {
  return (
    <View style={styles.fullHistoryList}>
      {props.transactions.map(transaction => (
        <FullHistoryTransaction
          key={transaction.id}
          onEditTransaction={props.onEditTransaction}
          transaction={transaction}
        />
      ))}
    </View>
  );
}

function FullHistoryTransaction(props: {
  onEditTransaction: (transaction: Transaction) => void;
  transaction: HistoryItemData;
}) {
  const amountStyle = getFullHistoryAmountStyle(props.transaction.tone);

  return (
    <Pressable
      onPress={() => props.onEditTransaction(props.transaction.transaction)}
      style={styles.fullHistoryItem}
    >
      <FullHistoryTransactionCopy transaction={props.transaction} />
      <FullHistoryTransactionAmount
        amount={props.transaction.amount}
        amountStyle={amountStyle}
      />
    </Pressable>
  );
}

function FullHistoryTransactionCopy(props: { transaction: HistoryItemData }) {
  return (
    <View style={styles.fullHistoryItemLeft}>
      <View style={styles.fullHistoryItemIconBox}>
        <Text style={styles.fullHistoryItemIcon}>{props.transaction.icon}</Text>
      </View>
      <View style={styles.fullHistoryItemCopy}>
        <Text numberOfLines={1} style={styles.fullHistoryItemTitle}>
          {props.transaction.title}
        </Text>
        <Text style={styles.fullHistoryItemMeta}>{props.transaction.meta}</Text>
      </View>
    </View>
  );
}

function FullHistoryTransactionAmount(props: {
  amount: string;
  amountStyle: object;
}) {
  return (
    <Text
      adjustsFontSizeToFit
      numberOfLines={1}
      style={[styles.fullHistoryAmount, props.amountStyle]}
    >
      {props.amount}
    </Text>
  );
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

function FullHistoryPeriodContent(props: FullHistoryPeriodContentProps) {
  const options = getPeriodOptionsFromRange(
    props.range,
    props.period.selectedYear,
  );

  return (
    <>
      <SheetHeader
        canGoBack
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={props.onGoBack}
        title="Pilih Periode 📅"
      />
      <FullHistoryPeriodOptions
        onApply={props.onApply}
        options={options}
        period={props.period}
      />
    </>
  );
}

function FullHistoryPeriodOptions(props: {
  onApply: () => void;
  options: ReturnType<typeof getPeriodOptionsFromRange>;
  period: PeriodState;
}) {
  const selectYear = getSelectPeriodYearHandler(props.period, props.options);

  return (
    <View style={styles.fullHistoryPeriodContent}>
      <PeriodOptionGroups
        options={props.options}
        period={props.period}
        selectYear={selectYear}
      />
      <Pressable onPress={props.onApply} style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Terapkan</Text>
      </Pressable>
    </View>
  );
}

function PeriodOptionGroups(props: {
  options: ReturnType<typeof getPeriodOptionsFromRange>;
  period: PeriodState;
  selectYear: (year: string) => void;
}) {
  return (
    <>
      <PeriodGroup
        onSelectOption={props.period.setSelectedMonth}
        options={props.options.monthOptions}
        selectedOption={props.period.selectedMonth}
        title="Bulan"
      />
      <PeriodGroup
        onSelectOption={props.selectYear}
        options={props.options.yearOptions}
        selectedOption={props.period.selectedYear}
        title="Tahun"
      />
    </>
  );
}

function SheetHeader(props: {
  canGoBack?: boolean;
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onGoBack?: () => void;
  title: string;
}) {
  return (
    <View>
      <FullHistoryHandle dragHandleProps={props.dragHandleProps} />
      <View style={styles.sheetHeader}>
        <SheetBackButton
          isVisible={props.canGoBack}
          onPress={props.onGoBack}
        />
        <View style={styles.sheetTitleArea} {...props.dragHandleProps}>
          <Text style={styles.sheetTitle}>{props.title}</Text>
        </View>
        <SheetCloseButton onClose={props.onClose} />
      </View>
    </View>
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

function SheetCloseButton(props: { onClose: () => void }) {
  return (
    <Pressable onPress={props.onClose} style={styles.sheetCloseButton}>
      <Text style={styles.sheetCloseText}>×</Text>
    </Pressable>
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
      <PeriodOptionGrid {...props} />
    </>
  );
}

function PeriodOptionGrid(props: {
  onSelectOption: (option: string) => void;
  options: readonly string[];
  selectedOption: string;
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

function PeriodOption(props: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.periodOption, props.isActive && styles.periodOptionActive]}
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

type FullHistoryState = {
  groups: FullHistoryGroupData[];
  isLoading: boolean;
};

function useFullHistoryGroups(props: {
  historyMonth: string;
  isFullHistoryVisible: boolean;
  refreshKey: number;
  selectedHistoryFilter: HistoryFilter;
}) {
  const [groups, setGroups] = useState<FullHistoryGroupData[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(
    () => createFullHistoryLoadEffect(props, setGroups, setLoading),
    [
      props.historyMonth,
      props.isFullHistoryVisible,
      props.refreshKey,
      props.selectedHistoryFilter,
    ],
  );

  return { groups, isLoading };
}

function createFullHistoryLoadEffect(
  props: {
    historyMonth: string;
    isFullHistoryVisible: boolean;
    selectedHistoryFilter: HistoryFilter;
  },
  setGroups: (groups: FullHistoryGroupData[]) => void,
  setLoading: (value: boolean) => void,
) {
  let isMounted = true;

  if (props.isFullHistoryVisible) {
    loadFullHistoryGroups({
      filter: props.selectedHistoryFilter,
      month: props.historyMonth,
      setGroups: items => isMounted && setGroups(items),
      setLoading: value => isMounted && setLoading(value),
    }).catch(() => undefined);
  }

  return () => {
    isMounted = false;
  };
}

async function loadFullHistoryGroups(params: {
  filter: HistoryFilter;
  month: string;
  setGroups: (groups: FullHistoryGroupData[]) => void;
  setLoading: (value: boolean) => void;
}) {
  params.setLoading(true);

  try {
    params.setGroups(await fetchFullHistoryGroups(params.month, params.filter));
  } catch {
    params.setGroups([]);
  } finally {
    params.setLoading(false);
  }
}

async function fetchFullHistoryGroups(month: string, filter: HistoryFilter) {
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

function hasVisibleHistory(
  groups: FullHistoryGroupData[],
  selectedFilter: HistoryFilter,
) {
  return groups.some(group => (
    getFilteredTransactions(group, selectedFilter).length > 0
  ));
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

function mapTransactionToHistoryItem(transaction: Transaction): HistoryItemData {
  return {
    amount: transaction.formattedAmount || formatTransactionAmount(transaction),
    icon: getTransactionIcon(transaction),
    id: transaction.id,
    meta: getTransactionMeta(transaction),
    occurredAt: transaction.occurredAt,
    title: getTransactionTitle(transaction),
    tone: getTransactionTone(transaction.type),
    transaction,
  };
}

function getTransactionTitle(transaction: Transaction) {
  return transaction.title?.trim()
    || transaction.category?.name
    || getFallbackTransactionTitle(transaction.type);
}

function getFallbackTransactionTitle(type: TransactionType) {
  if (type === 'INCOME') {
    return 'Pemasukan';
  }

  return type === 'TRANSFER' ? 'Pindah Dana' : 'Pengeluaran';
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

function formatTransactionAmount(transaction: Transaction) {
  const prefix = transaction.type === 'INCOME' ? '+ ' : '- ';

  return `${prefix}${formatRupiah(transaction.amount)}`;
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
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

function getAvailablePeriodRange(
  availablePeriod: DashboardSummary['availablePeriod'] | undefined,
) {
  const fallback = getCurrentApiMonth();

  return {
    maxMonth: availablePeriod?.maxMonth ?? fallback,
    minMonth: availablePeriod?.minMonth ?? fallback,
  };
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

function getSelectPeriodYearHandler(
  period: PeriodState,
  options: ReturnType<typeof getPeriodOptionsFromRange>,
) {
  return (year: string) => {
    const monthOptionsForYear = getAvailableMonthOptions(options.range, year);
    period.setSelectedYear(year);

    if (!monthOptionsForYear.some(month => month === period.selectedMonth)) {
      period.setSelectedMonth(monthOptionsForYear[0] ?? monthOptions[0]);
    }
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

function getCurrentApiMonth() {
  return new Date().toISOString().slice(0, 7);
}

export { mapTransactionToHistoryItem };
export default DashboardHistory;
