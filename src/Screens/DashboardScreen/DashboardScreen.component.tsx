import { type ComponentProps, type ReactNode, useState } from 'react';
import {
  Pressable,
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
import { colors } from '../../Theme';

import {
  categories,
  fullHistoryGroups,
  histories,
  wallets,
} from './DashboardScreen.data';
import styles from './DashboardScreen.styles';

type LimitTone = 'blue' | 'primary' | 'purple' | 'yellow';
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
  onCloseAddSheet: () => void;
  onCloseFullHistory: () => void;
  onCloseLimitDetail: () => void;
  onCloseWalletSheet: () => void;
  onSelectHistoryFilter: (filter: HistoryFilter) => void;
  selectedHistoryFilter: HistoryFilter;
};
type DashboardScreenProps = {
  onLogout?: () => void;
};
type LimitSheetView = 'create' | 'list';
type HistoryFilter = 'Pemasukan' | 'Pengeluaran' | 'Pindah Dana' | 'Semua';
type WalletType = (typeof walletTypes)[number];
type WalletItem = (typeof wallets)[number];
type WalletSheetView = 'create' | 'list';
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

function Header({ onLogout }: DashboardScreenProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerIntro}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>▯</Text>
        </View>
        <View>
          <Text style={styles.hello}>HALO, KAK!</Text>
          <Text style={styles.name}>Caca Cute ✨</Text>
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

function BalanceCard({ onOpenWalletSheet }: { onOpenWalletSheet: () => void }) {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balancePattern}>· · ·</Text>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>SISA UANG JAJAN KAMU</Text>
        <Pressable onPress={onOpenWalletSheet} style={styles.balanceBadge}>
          <Text style={styles.balanceBadgeText}>Total Asset Saya</Text>
        </Pressable>
      </View>
      <Text style={styles.balanceValue}>Rp 5.250.000</Text>
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

function TotalWalletOption() {
  return (
    <Pressable style={styles.totalWalletOption}>
      <View style={styles.totalWalletIcon}>
        <Text style={styles.sheetIconText}>▣</Text>
      </View>
      <View style={styles.totalWalletCopy}>
        <Text style={styles.totalWalletTitle}>Semua Dompet</Text>
        <Text style={styles.totalWalletSubtitle}>Lihat total keseluruhan</Text>
      </View>
      <Text style={styles.totalWalletAmount}>Rp 8.420k</Text>
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
  walletItems: WalletItem[];
}) {
  return (
    <>
      {!!props.walletItems.length && <TotalWalletOption />}
      <WalletGrid
        isDeleteMode={props.isDeleteMode}
        onDeleteWallet={props.onDeleteWallet}
        walletItems={props.walletItems}
      />
      <AddWalletButton onPress={props.onCreateWallet} />
      <Pressable style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Konfirmasi Pilihan</Text>
      </Pressable>
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

function WalletFormField(props: { label: string; placeholder: string }) {
  return (
    <View style={styles.walletFormField}>
      <Text style={styles.walletFormLabel}>{props.label}</Text>
      <TextInput
        placeholder={props.placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.walletFormInput}
      />
    </View>
  );
}

function WalletCreateContent() {
  const [selectedType, setSelectedType] = useState<WalletType>('Bank');

  return (
    <View style={styles.walletForm}>
      <WalletFormField label="Nama Dompet" placeholder="BCA Saya" />
      <View style={styles.walletFormField}>
        <Text style={styles.walletFormLabel}>Tipe Dompet</Text>
        <WalletTypeOptions
          onSelectType={setSelectedType}
          selectedType={selectedType}
        />
      </View>
      <WalletFormField label="Saldo Awal" placeholder="Rp 0" />
      <Pressable style={styles.saveWalletButton}>
        <Text style={styles.saveWalletButtonText}>Simpan Dompet</Text>
      </Pressable>
    </View>
  );
}

function useWalletSheetState() {
  const [isDeleteMode, setDeleteMode] = useState(false);
  const [view, setView] = useState<WalletSheetView>('list');
  const [walletItems, setWalletItems] = useState<WalletItem[]>([wallets[0]]);
  const deleteWallet = (walletId: string) => {
    setWalletItems(items => items.filter(item => item.id !== walletId));
  };

  return {
    deleteWallet,
    isDeleteMode,
    setDeleteMode,
    setView,
    view,
    walletItems,
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
  walletItems: WalletItem[];
}) {
  return (
    <WalletListContent
      isDeleteMode={props.isDeleteMode}
      onCreateWallet={props.onCreateWallet}
      onDeleteWallet={props.onDeleteWallet}
      walletItems={props.walletItems}
    />
  );
}

function WalletSheetHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isCreateView: boolean;
  onClose: () => void;
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  return (
    <SheetHeader
      action={<WalletHeaderAction
        isCreateView={props.isCreateView}
        isDeleteMode={props.walletSheet.isDeleteMode}
        onToggleDelete={() => props.walletSheet.setDeleteMode(value => !value)}
        walletItems={props.walletSheet.walletItems}
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
  walletSheet: ReturnType<typeof useWalletSheetState>;
}) {
  if (props.isCreateView) {
    return <WalletCreateContent />;
  }

  return (
    <WalletSheetBody
      isDeleteMode={props.walletSheet.isDeleteMode}
      onCreateWallet={() => props.walletSheet.setView('create')}
      onDeleteWallet={props.walletSheet.deleteWallet}
      walletItems={props.walletSheet.walletItems}
    />
  );
}

function SheetContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
}) {
  const walletSheet = useWalletSheetState();
  const isCreateView = walletSheet.view === 'create';

  return (
    <>
      <WalletSheetHeader
        dragHandleProps={props.dragHandleProps}
        isCreateView={isCreateView}
        onClose={props.onClose}
        walletSheet={walletSheet}
      />
      <WalletSheetCurrentContent
        isCreateView={isCreateView}
        walletSheet={walletSheet}
      />
    </>
  );
}

function WalletBottomSheet(props: { onClose: () => void; visible: boolean }) {
  return (
    <BottomSheet
      containerStyle={styles.sheetContainer}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <SheetContent
          dragHandleProps={dragHandleProps}
          onClose={props.onClose}
        />
      )}
    </BottomSheet>
  );
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
        onClose={props.onCloseWalletSheet}
        visible={props.isWalletSheetVisible}
      />
      <AddSheetOverlay {...props} />
    </>
  );
}

function DashboardContent(props: {
  filterLabel: string;
  onOpenFullHistory: (filter?: HistoryFilter) => void;
  onOpenLimitDetail: () => void;
  onOpenUsagePeriod: () => void;
  onOpenWalletSheet: () => void;
  onLogout?: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContent}>
      <Header onLogout={props.onLogout} />
      <BalanceCard onOpenWalletSheet={props.onOpenWalletSheet} />
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

function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const sheets = useDashboardSheetState();
  const period = useUsagePeriodState();
  const filterLabel = `${period.selectedMonth} ${period.selectedYear}`;

  return (
    <View style={styles.container}>
      <DashboardContent
        filterLabel={filterLabel}
        onOpenFullHistory={sheets.onOpenFullHistory}
        onOpenLimitDetail={sheets.onOpenLimitDetail}
        onOpenUsagePeriod={sheets.onOpenUsagePeriod}
        onOpenWalletSheet={sheets.onOpenWalletSheet}
        onLogout={onLogout}
      />
      <FloatingAddButton onPress={sheets.onOpenAddSheet} />
      <DashboardSheets {...sheets} />
      <UsagePeriodOverlay period={period} sheets={sheets} />
    </View>
  );
}

export default DashboardScreen;
