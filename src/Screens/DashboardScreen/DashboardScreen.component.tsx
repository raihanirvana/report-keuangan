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

import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../Components/BottomSheet';
import AddTransactionSheet from '../../Navigation/AppTabs/AddTransactionSheet.component';
import {
  createWallet,
  deleteWallet,
  getDashboardSummary,
  getWallets,
  type AuthUser,
  type CreateWalletPayload,
  type DashboardSummary,
  type Wallet,
} from '../../Services';
import { colors } from '../../Theme';
import { getAuthToken } from '../../Utils/authStorage';

import {
  categories,
  fullHistoryGroups,
  histories,
} from './DashboardScreen.data';
import styles from './DashboardScreen.styles';

type LimitTone = 'blue' | 'primary' | 'purple' | 'yellow';
type WalletTone = 'blue' | 'primary' | 'purple' | 'yellow';
type LimitDetail = {
  icon: string;
  label: string;
  progress: string;
  tone: LimitTone;
  width: `${number}%`;
};

const limitDetails: LimitDetail[] = [
  {
    icon: '≋',
    label: 'Internet/Kuota',
    progress: '75%',
    tone: 'blue',
    width: '75%',
  },
  {
    icon: '⌂',
    label: 'Kos/Rent',
    progress: '100%',
    tone: 'primary',
    width: '100%',
  },
  {
    icon: '☰',
    label: 'Food',
    progress: '60%',
    tone: 'yellow',
    width: '60%',
  },
  {
    icon: '☻',
    label: 'Skincare',
    progress: '80%',
    tone: 'purple',
    width: '80%',
  },
];
const newLimitDetail: LimitDetail = {
  icon: '↯',
  label: 'Transport',
  progress: '0%',
  tone: 'blue',
  width: '0%',
};

type DashboardSheetsProps = {
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
};
type DashboardContentProps = {
  dashboardSummary: DashboardSummary | null;
  filterLabel: string;
  isRefreshing: boolean;
  onOpenFullHistory: (filter?: HistoryFilter) => void;
  onOpenLimitDetail: () => void;
  onOpenUsagePeriod: () => void;
  onOpenWalletSheet: () => void;
  onRefresh: () => void;
  onLogout?: () => void;
  user?: AuthUser | null;
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
  filterLabel: string;
  onLogout?: () => void;
  period: ReturnType<typeof useUsagePeriodState>;
  sheets: ReturnType<typeof useDashboardSheetState>;
  user?: AuthUser | null;
};
type LimitSheetView = 'create' | 'list';
type HistoryFilter = 'Pemasukan' | 'Pengeluaran' | 'Pindah Dana' | 'Semua';
type WalletType = (typeof walletTypes)[number];
type WalletItem = {
  amount: string;
  icon: string;
  id: string;
  name: string;
  tone: WalletTone;
};
type WalletSheetView = 'create' | 'list';
type DashboardDataSetters = {
  setDashboardSummary: (summary: DashboardSummary | null) => void;
  setErrorMessage: (message: string) => void;
  setRefreshing: (value: boolean) => void;
};
type LimitDetailSheetContentProps = {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
};
type UsagePeriodContentProps = {
  onApply: () => void;
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: string) => void;
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
const walletTypes = ['Bank', 'E-Wallet', 'Cash', 'Savings'];
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
const yearOptions = ['2024', '2025', '2026'] as const;

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

function SummaryCards(props: { onOpenHistory: (filter: HistoryFilter) => void }) {
  return (
    <View style={styles.summaryGrid}>
      <SummaryCard
        icon="↙"
        label="Uang Masuk"
        onPress={() => props.onOpenHistory('Pemasukan')}
        value="Rp 2.100k"
        variant="income"
      />
      <SummaryCard
        icon="↗"
        label="Uang Keluar"
        onPress={() => props.onOpenHistory('Pengeluaran')}
        value="Rp 850k"
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
      <Text style={styles.summaryValue}>{props.value}</Text>
    </Pressable>
  );
}

function DonutChart() {
  return (
    <View style={styles.chartRing}>
      <View style={[styles.ringSegment, styles.ringPrimary]} />
      <View style={[styles.ringSegment, styles.ringBlue]} />
      <View style={[styles.ringSegment, styles.ringYellow]} />
      <View style={[styles.ringSegment, styles.ringPurple]} />
      <View style={styles.chartCenter}>
        <Text style={styles.chartCenterLabel}>KELUAR</Text>
        <Text style={styles.chartCenterValue}>850K</Text>
      </View>
    </View>
  );
}

function CategoryBreakdown() {
  return (
    <View style={styles.categoryList}>
      {categories.map(category => (
        <View key={category.label} style={styles.categoryItem}>
          <View
            style={[styles.categoryDot, { backgroundColor: category.color }]}
          />
          <Text style={styles.categoryLabel}>{category.label}</Text>
        </View>
      ))}
    </View>
  );
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
  filterLabel: string;
  onOpenUsagePeriod: () => void;
}) {
  return (
    <View style={styles.section}>
      <UsageSectionHeader {...props} />
      <View style={styles.chartCard}>
        <DonutChart />
        <CategoryBreakdown />
      </View>
    </View>
  );
}

function SpendingLimitSection(props: { onOpenLimitDetail: () => void }) {
  return (
    <View style={styles.limitSection}>
      <Pressable onPress={props.onOpenLimitDetail} style={styles.limitCard}>
        <View style={styles.limitHeader}>
          <View style={styles.limitTitleRow}>
            <Text style={styles.limitIcon}>◎</Text>
            <Text numberOfLines={1} style={styles.limitTitle}>
              Limit Pengeluaran
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.limitBadge}>
            60%
          </Text>
        </View>
        <View style={styles.limitTrack}>
          <View style={styles.limitProgress} />
        </View>
        <SpendingLimitAmount />
      </Pressable>
    </View>
  );
}

function SpendingLimitAmount() {
  return (
    <Text style={styles.limitAmount}>
      <Text style={styles.limitAmountUsed}>Rp 3.000.000</Text>
      <Text> / Rp 5.000.000</Text>
    </Text>
  );
}

function HistorySection(props: { onOpenFullHistory: () => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Histori Lucu 🐾</Text>
        <Pressable onPress={() => props.onOpenFullHistory()}>
          <Text style={styles.sectionLink}>Lihat Semua</Text>
        </Pressable>
      </View>
      <View style={styles.historyList}>
        {histories.map(history => (
          <HistoryItem history={history} key={history.title} />
        ))}
      </View>
    </View>
  );
}

function FullHistoryTitleRow(props: {
  dragHandleProps: BottomSheetDragHandleProps;
}) {
  return (
    <View style={styles.fullHistoryTitleRow}>
      <View style={styles.fullHistoryTitleLeft} {...props.dragHandleProps}>
        <View style={styles.fullHistoryIconBox}>
          <Text style={styles.fullHistoryIcon}>↺</Text>
        </View>
        <Text style={styles.fullHistoryTitle}>Histori Lengkap</Text>
      </View>
      <Text style={styles.fullHistoryMonth}>Mei 2024⌄</Text>
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
  onSelectFilter: (filter: HistoryFilter) => void;
  selectedFilter: HistoryFilter;
}) {
  return (
    <View style={styles.fullHistoryHeader}>
      <FullHistoryHandle dragHandleProps={props.dragHandleProps} />
      <FullHistoryTitleRow dragHandleProps={props.dragHandleProps} />
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

function HistoryItem({ history }: { history: (typeof histories)[number] }) {
  const amountStyle =
    history.tone === 'income'
      ? styles.historyAmountIncome
      : styles.historyAmountExpense;

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

function FullHistoryTransaction(props: {
  transaction: (typeof fullHistoryGroups)[number]['transactions'][number];
}) {
  const amountStyle =
    props.transaction.tone === 'income'
      ? styles.fullHistoryAmountIncome
      : styles.fullHistoryAmountExpense;

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

function FullHistoryTransactionCopy(props: {
  transaction: (typeof fullHistoryGroups)[number]['transactions'][number];
}) {
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
  group: (typeof fullHistoryGroups)[number],
  selectedFilter: HistoryFilter,
) {
  return group.transactions.filter(transaction => {
    if (selectedFilter === 'Semua') {
      return true;
    }

    if (selectedFilter === 'Pemasukan') {
      return transaction.tone === 'income';
    }

    return selectedFilter === 'Pengeluaran' && transaction.tone === 'expense';
  });
}

function FullHistoryGroup(props: {
  group: (typeof fullHistoryGroups)[number];
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
            key={transaction.title}
            transaction={transaction}
          />
        ))}
      </View>
    </View>
  );
}

function hasVisibleHistory(selectedFilter: HistoryFilter) {
  return fullHistoryGroups.some(group => (
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

function FullHistoryContent(props: { selectedFilter: HistoryFilter }) {
  const hasData = hasVisibleHistory(props.selectedFilter);

  return (
    <ScrollView contentContainerStyle={styles.fullHistoryContent}>
      {hasData ? fullHistoryGroups.map(group => (
        <FullHistoryGroup
          group={group}
          key={group.id}
          selectedFilter={props.selectedFilter}
        />
      )) : <FullHistoryEmptyState />}
    </ScrollView>
  );
}

function FullHistoryBottomSheet(props: {
  onClose: () => void;
  onSelectFilter: (filter: HistoryFilter) => void;
  selectedFilter: HistoryFilter;
  visible: boolean;
}) {
  return (
    <BottomSheet
      containerStyle={styles.fullHistoryContainer}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <>
          <FullHistoryHeader
            dragHandleProps={dragHandleProps}
            onSelectFilter={props.onSelectFilter}
            selectedFilter={props.selectedFilter}
          />
          <FullHistoryContent selectedFilter={props.selectedFilter} />
        </>
      )}
    </BottomSheet>
  );
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

function WalletOption(props: {
  isDeleteMode: boolean;
  onDelete: () => void;
  wallet: WalletItem;
}) {
  const wallet = props.wallet;
  const optionStyle = styles[`${wallet.tone}WalletOption`];
  const iconStyle = styles[`${wallet.tone}WalletIcon`];

  return (
    <Pressable style={[styles.walletOption, optionStyle]}>
      <WalletDeleteButton
        isVisible={props.isDeleteMode}
        onPress={props.onDelete}
      />
      <View style={[styles.walletOptionIcon, iconStyle]}>
        <Text style={styles.sheetIconText}>{wallet.icon}</Text>
      </View>
      <WalletOptionCopy wallet={wallet} />
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
  isDeleteMode: boolean;
  onDeleteWallet: (walletId: string) => void;
  walletItems: WalletItem[];
}) {
  if (!props.walletItems.length) {
    return <WalletEmptyState />;
  }

  return (
    <View style={styles.walletGrid}>
      {props.walletItems.map(wallet => (
        <WalletOption
          isDeleteMode={props.isDeleteMode}
          key={wallet.id}
          onDelete={() => props.onDeleteWallet(wallet.id)}
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

function WalletListContent(props: {
  isDeleteMode: boolean;
  onCreateWallet: () => void;
  onDeleteWallet: (walletId: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  return (
    <>
      {!!props.walletItems.length && (
        <TotalWalletOption amount={props.totalAmount} />
      )}
      <WalletGrid
        isDeleteMode={props.isDeleteMode}
        onDeleteWallet={props.onDeleteWallet}
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

  return { color: '#4EA8DE', icon: 'account_balance', type: 'BANK' };
}

function getWalletBalanceDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatWalletBalanceInput(value: string) {
  const digits = getWalletBalanceDigits(value);

  if (!digits) {
    return '';
  }

  return `Rp ${Number(digits).toLocaleString('id-ID')}`;
}

function parseWalletBalance(value: string) {
  const amount = Number(getWalletBalanceDigits(value));

  return Number.isFinite(amount) ? amount : 0;
}

function getWalletSubmitPayload(params: {
  balance: string;
  name: string;
  selectedType: WalletType;
}) {
  return {
    ...getWalletTypePayload(params.selectedType),
    initialBalance: parseWalletBalance(params.balance),
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

function WalletFormFields({ state }: { state: WalletFormState }) {
  return (
    <>
      <WalletFormField
        label="Nama Dompet"
        onChangeText={state.setName}
        placeholder="BCA Saya"
        value={state.name}
      />
      <WalletTypeField state={state} />
      <WalletFormField
        keyboardType="number-pad"
        label="Saldo Awal"
        onChangeText={state.setBalance}
        onFocus={state.focusBalance}
        placeholder="Rp 0"
        value={state.balance}
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

function getWalletSubmitParams(props: {
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

function WalletSaveButton(props: {
  onChanged: () => void;
  onSuccess: () => void;
  state: WalletFormState;
}) {
  return (
    <>
      {!!props.state.errorMessage && (
        <Text style={styles.walletFormError}>{props.state.errorMessage}</Text>
      )}
      <Pressable
        onPress={async () => {
          await submitWalletForm(getWalletSubmitParams(props));
        }}
        style={styles.saveWalletButton}
      >
        <Text style={styles.saveWalletButtonText}>Simpan Dompet</Text>
      </Pressable>
    </>
  );
}

function useWalletFormState(): WalletFormState {
  const [balance, setBalance] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<WalletType>('Bank');
  const setFormattedBalance = (value: string) => {
    setBalance(formatWalletBalanceInput(value));
  };
  const focusBalance = () => {
    setBalance(value => value || 'Rp ');
  };

  return {
    balance,
    errorMessage,
    focusBalance,
    name,
    selectedType,
    setBalance: setFormattedBalance,
    setErrorMessage,
    setName,
    setSelectedType,
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
      <WalletSaveButton {...props} state={state} />
    </View>
  );
}

function useWalletSheetState() {
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [view, setView] = useState<WalletSheetView>('list');

  return {
    isDeleteMode,
    setDeleteMode,
    setView,
    view,
  };
}

function WalletHeaderAction(props: {
  isCreateView: boolean;
  isDeleteMode: boolean;
  onToggleDelete: () => void;
  walletItems: WalletItem[];
}) {
  if (props.isCreateView || !props.walletItems.length) {
    return null;
  }

  return (
    <WalletTrashButton
      isActive={props.isDeleteMode}
      isDisabled={false}
      onPress={props.onToggleDelete}
    />
  );
}

function WalletSheetBody(props: {
  isDeleteMode: boolean;
  onCreateWallet: () => void;
  onDeleteWallet: (walletId: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  return (
    <WalletListContent
      isDeleteMode={props.isDeleteMode}
      onCreateWallet={props.onCreateWallet}
      onDeleteWallet={props.onDeleteWallet}
      totalAmount={props.totalAmount}
      walletItems={props.walletItems}
    />
  );
}

function WalletSheetHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isCreateView: boolean;
  onClose: () => void;
  walletSheet: ReturnType<typeof useWalletSheetState>;
  walletItems: WalletItem[];
}) {
  return (
    <SheetHeader
      action={<WalletHeaderAction
        isCreateView={props.isCreateView}
        isDeleteMode={props.walletSheet.isDeleteMode}
        onToggleDelete={() => props.walletSheet.setDeleteMode(value => !value)}
        walletItems={props.walletItems}
      />}
      canGoBack={props.isCreateView}
      dragHandleProps={props.dragHandleProps}
      onClose={props.onClose}
      onGoBack={() => props.walletSheet.setView('list')}
      title={props.isCreateView ? 'Tambah Dompet 💳' : 'Pilih Dompet 👛'}
    />
  );
}

function WalletSheetCurrentContent(props: {
  isCreateView: boolean;
  onChanged: () => void;
  onDeleteWallet: (walletId: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  if (props.isCreateView) {
    return <WalletSheetCreateContent {...props} />;
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
      onSuccess={() => props.walletSheet.setView('list')}
    />
  );
}

function WalletSheetListContent(props: {
  onChanged: () => void;
  onDeleteWallet: (walletId: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  return (
    <WalletSheetBody
      isDeleteMode={props.walletSheet.isDeleteMode}
      onCreateWallet={() => props.walletSheet.setView('create')}
      onDeleteWallet={props.onDeleteWallet}
      totalAmount={props.totalAmount}
      walletItems={props.walletItems}
    />
  );
}

function WalletSheetHeaderContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  isCreateView: boolean;
  walletItems: WalletItem[];
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  return (
    <WalletSheetHeader
      dragHandleProps={props.dragHandleProps}
      isCreateView={props.isCreateView}
      onClose={props.onClose}
      walletItems={props.walletItems}
      walletSheet={props.walletSheet}
    />
  );
}

function SheetContent(props: WalletSheetContentProps) {
  const walletSheet = useWalletSheetState();
  const isCreateView = walletSheet.view === 'create';

  return (
    <>
      <WalletSheetHeaderContent
        dragHandleProps={props.dragHandleProps}
        isCreateView={isCreateView}
        onClose={props.onClose}
        walletItems={props.walletItems}
        walletSheet={walletSheet}
      />
      <WalletSheetCurrentContent
        isCreateView={isCreateView}
        onChanged={props.onChanged}
        onDeleteWallet={props.onDeleteWallet}
        totalAmount={props.totalAmount}
        walletItems={props.walletItems}
        walletSheet={walletSheet}
      />
    </>
  );
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

function getLimitDetailStyles(tone: LimitTone) {
  return {
    progress: styles[`${tone}LimitProgress`],
    text: styles[`${tone}LimitText`],
  };
}

function LimitDetailHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
}) {
  return (
    <View style={styles.limitDetailHeader} {...props.dragHandleProps}>
      <View style={styles.limitDetailHandle} />
      <Text style={styles.limitDetailTitle}>Detail Limit 📊</Text>
      <Text style={styles.limitDetailSubtitle}>SEMANGAT HEMAT YA, KAK! ✨</Text>
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
        <Text style={styles.limitDetailEdit}>⌕</Text>
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

function LimitDetailItem(props: { item: LimitDetail }) {
  return (
    <View style={styles.limitDetailItem}>
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
  limitItems: LimitDetail[];
  onCreateCategory: () => void;
}) {
  return (
    <View style={styles.limitDetailContent}>
      {props.limitItems.map(item => (
        <LimitDetailItem item={item} key={item.label} />
      ))}
      <Pressable
        onPress={props.onCreateCategory}
        style={styles.addLimitCategoryButton}
      >
        <Text style={styles.addLimitCategoryText}>Tambah Batas Kategori</Text>
      </Pressable>
    </View>
  );
}

function LimitDetailContent(props: {
  limitItems: LimitDetail[];
  onCreateCategory: () => void;
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

function LimitCategoryCreateContent(props: { onSaveCategory: () => void }) {
  return (
    <View style={styles.walletForm}>
      <WalletFormField label="Nama Kategori" placeholder="Transport" />
      <WalletFormField label="Limit Bulanan" placeholder="Rp 500.000" />
      <Pressable onPress={props.onSaveCategory} style={styles.saveWalletButton}>
        <Text style={styles.saveWalletButtonText}>Simpan Kategori</Text>
      </Pressable>
    </View>
  );
}

function LimitCategoryCreateView(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onGoBack: () => void;
  onSaveCategory: () => void;
}) {
  return (
    <>
      <SheetHeader
        canGoBack
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={props.onGoBack}
        title="Tambah Kategori 💖"
      />
      <LimitCategoryCreateContent onSaveCategory={props.onSaveCategory} />
    </>
  );
}

function LimitDetailListView(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  limitItems: LimitDetail[];
  onCreateCategory: () => void;
  onUsePreviousMonth: () => void;
}) {
  return (
    <>
      <LimitDetailHeader dragHandleProps={props.dragHandleProps} />
      <LimitDetailContent
        limitItems={props.limitItems}
        onCreateCategory={props.onCreateCategory}
        onUsePreviousMonth={props.onUsePreviousMonth}
      />
    </>
  );
}

function useLimitDetailState() {
  const [limitItems, setLimitItems] = useState<LimitDetail[]>([]);
  const [view, setView] = useState<LimitSheetView>('list');
  const usePreviousMonth = () => setLimitItems([...limitDetails]);
  const saveCategory = () => {
    setLimitItems(currentItems => [...currentItems, newLimitDetail]);
    setView('list');
  };

  return {
    limitItems,
    saveCategory,
    setView,
    usePreviousMonth,
    view,
  };
}

function LimitDetailSheetContent(props: LimitDetailSheetContentProps) {
  const limitSheet = useLimitDetailState();

  if (limitSheet.view === 'create') {
    return (
      <LimitCategoryCreateView
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={() => limitSheet.setView('list')}
        onSaveCategory={limitSheet.saveCategory}
      />
    );
  }

  return (
    <LimitDetailListView
      dragHandleProps={props.dragHandleProps}
      limitItems={limitSheet.limitItems}
      onCreateCategory={() => limitSheet.setView('create')}
      onUsePreviousMonth={limitSheet.usePreviousMonth}
    />
  );
}

function LimitDetailBottomSheet(props: { onClose: () => void; visible: boolean }) {
  return (
    <BottomSheet
      containerStyle={styles.limitDetailContainer}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <LimitDetailSheetContent
          dragHandleProps={dragHandleProps}
          onClose={props.onClose}
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
        options={monthOptions}
        selectedOption={props.selectedMonth}
        title="Bulan"
      />
      <PeriodGroup
        onSelectOption={props.setSelectedYear}
        options={yearOptions}
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

function UsagePeriodBottomSheet(props: {
  onApply: () => void;
  onClose: () => void;
  selectedMonth: string;
  selectedYear: string;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: string) => void;
  visible: boolean;
}) {
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
      onClose={props.onCloseAddSheet}
      visible={props.isAddSheetVisible}
    />
  );
}

function DashboardSheets(props: DashboardSheetsProps) {
  return (
    <>
      <LimitDetailBottomSheet
        onClose={props.onCloseLimitDetail}
        visible={props.isLimitDetailVisible}
      />
      <FullHistoryBottomSheet
        onClose={props.onCloseFullHistory}
        onSelectFilter={props.onSelectHistoryFilter}
        selectedFilter={props.selectedHistoryFilter}
        visible={props.isFullHistoryVisible}
      />
      <WalletBottomSheet
        onChanged={props.onDashboardChanged}
        onClose={props.onCloseWalletSheet}
        totalAmount={props.totalWalletAmount}
        visible={props.isWalletSheetVisible}
      />
      <AddSheetOverlay {...props} />
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
      <DashboardBalanceCard {...props} />
      <SummaryCards onOpenHistory={props.onOpenFullHistory} />
      <UsageSection
        filterLabel={props.filterLabel}
        onOpenUsagePeriod={props.onOpenUsagePeriod}
      />
      <SpendingLimitSection onOpenLimitDetail={props.onOpenLimitDetail} />
      <HistorySection onOpenFullHistory={props.onOpenFullHistory} />
    </ScrollView>
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
    onCloseAddSheet: () => params.setAddSheetVisible(false),
    onCloseFullHistory: () => params.setFullHistoryVisible(false),
    onCloseLimitDetail: () => params.setLimitDetailVisible(false),
    onCloseUsagePeriod: () => params.setUsagePeriodVisible(false),
    onCloseWalletSheet: () => params.setWalletSheetVisible(false),
    onOpenAddSheet: () => params.setAddSheetVisible(true),
    onOpenFullHistory: params.openFullHistory,
    onOpenLimitDetail: () => params.setLimitDetailVisible(true),
    onOpenUsagePeriod: () => params.setUsagePeriodVisible(true),
    onOpenWalletSheet: () => params.setWalletSheetVisible(true),
    onSelectHistoryFilter: params.setSelectedHistoryFilter,
  };
}

function useUsagePeriodState() {
  const [selectedMonth, setSelectedMonth] = useState('Mei');
  const [selectedYear, setSelectedYear] = useState('2024');

  return {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
  };
}

function UsagePeriodOverlay(props: {
  period: ReturnType<typeof useUsagePeriodState>;
  sheets: ReturnType<typeof useDashboardSheetState>;
}) {
  return (
    <UsagePeriodBottomSheet
      onApply={props.sheets.onCloseUsagePeriod}
      onClose={props.sheets.onCloseUsagePeriod}
      selectedMonth={props.period.selectedMonth}
      selectedYear={props.period.selectedYear}
      setSelectedMonth={props.period.setSelectedMonth}
      setSelectedYear={props.period.setSelectedYear}
      visible={props.sheets.isUsagePeriodVisible}
    />
  );
}

async function fetchDashboardSummary() {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const response = await getDashboardSummary(token);

  return response.data;
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

function mapWalletToItem(wallet: Wallet): WalletItem {
  return {
    amount: wallet.formattedBalance,
    icon: getWalletIcon(wallet),
    id: wallet.id,
    name: wallet.name,
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

function useDashboardData() {
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRefreshing, setRefreshing] = useState(false);
  const refreshDashboard = () => (
    loadDashboardData({
      setDashboardSummary,
      setErrorMessage,
      setRefreshing,
    })
  );
  useInitialDashboardRefresh(refreshDashboard);

  return {
    dashboardSummary,
    errorMessage,
    isRefreshing,
    refreshDashboard,
  };
}

function useInitialDashboardRefresh(refreshDashboard: () => Promise<void>) {
  useEffect(() => {
    refreshDashboard().catch(() => undefined);
  }, []);
}

async function loadDashboardData(setters: DashboardDataSetters) {
  setters.setRefreshing(true);

  try {
    const summary = await fetchDashboardSummary();
    setters.setDashboardSummary(summary);
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
        dashboardSummary={props.dashboardData.dashboardSummary}
        filterLabel={props.filterLabel}
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
  const dashboardData = useDashboardData();
  const sheets = useDashboardSheetState();
  const period = useUsagePeriodState();
  const filterLabel = `${period.selectedMonth} ${period.selectedYear}`;

  return (
    <DashboardScreenShell
      dashboardData={dashboardData}
      filterLabel={filterLabel}
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
  return (
    <View style={styles.container}>
      <DashboardMainContent
        dashboardData={props.dashboardData}
        filterLabel={props.filterLabel}
        onLogout={props.onLogout}
        sheets={props.sheets}
        user={props.user}
      />
      <DashboardSheets
        {...props.sheets}
        onDashboardChanged={props.dashboardData.refreshDashboard}
        totalWalletAmount={getDashboardTotalAmount(props.dashboardData)}
      />
      <UsagePeriodOverlay period={props.period} sheets={props.sheets} />
    </View>
  );
}

function getDashboardTotalAmount(data: ReturnType<typeof useDashboardData>) {
  return data.dashboardSummary?.balance.formatted ?? 'Rp 0';
}

export default DashboardScreen;
