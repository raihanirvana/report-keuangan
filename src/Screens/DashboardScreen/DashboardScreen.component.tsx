import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
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

function Header() {
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
      <Pressable style={styles.iconButton}>
        <Text style={styles.iconButtonText}>●</Text>
        <View style={styles.iconButtonDot} />
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

function SummaryCards() {
  return (
    <View style={styles.summaryGrid}>
      <SummaryCard
        icon="↙"
        label="Uang Masuk"
        value="Rp 2.100k"
        variant="income"
      />
      <SummaryCard
        icon="↗"
        label="Uang Keluar"
        value="Rp 850k"
        variant="expense"
      />
    </View>
  );
}

function SummaryCard(props: {
  icon: string;
  label: string;
  value: string;
  variant: 'income' | 'expense';
}) {
  const isIncome = props.variant === 'income';

  return (
    <View style={[styles.chartCard, styles.summaryCard]}>
      <View
        style={[
          styles.summaryIconBox,
          { backgroundColor: isIncome ? colors.secondary : colors.primary },
        ]}
      >
        <Text style={styles.summaryIcon}>{props.icon}</Text>
      </View>
      <Text style={styles.summaryLabel}>{props.label}</Text>
      <Text style={styles.summaryValue}>{props.value}</Text>
    </View>
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

function UsageSection() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Penggunaan Dompet Ini</Text>
        <Text style={styles.sectionLink}>Mei 2024⌄</Text>
      </View>
      <View style={styles.chartCard}>
        <DonutChart />
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
      </View>
    </View>
  );
}

function SpendingLimitSection() {
  return (
    <View style={styles.limitSection}>
      <View style={styles.limitCard}>
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
      </View>
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
        <Pressable onPress={props.onOpenFullHistory}>
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

function FullHistoryHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
}) {
  return (
    <View style={styles.fullHistoryHeader}>
      <View {...props.dragHandleProps}>
        <View style={styles.fullHistoryHandle} />
      </View>
      <View style={styles.fullHistoryTitleRow}>
        <View style={styles.fullHistoryTitleLeft} {...props.dragHandleProps}>
          <View style={styles.fullHistoryIconBox}>
            <Text style={styles.fullHistoryIcon}>↺</Text>
          </View>
          <Text style={styles.fullHistoryTitle}>Histori Lengkap</Text>
        </View>
        <Text style={styles.fullHistoryMonth}>Mei 2024⌄</Text>
      </View>
      <HistoryFilterChips />
    </View>
  );
}

function HistoryFilterChips() {
  const chips = ['Semua', 'Pengeluaran', 'Pemasukan', 'Pindah Dana'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.fullHistoryChipRow}>
        {chips.map((chip, index) => (
          <HistoryFilterChip isActive={index === 0} key={chip} label={chip} />
        ))}
      </View>
    </ScrollView>
  );
}

function HistoryFilterChip(props: { isActive: boolean; label: string }) {
  return (
    <View
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
    </View>
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

function FullHistoryGroup(props: {
  group: (typeof fullHistoryGroups)[number];
}) {
  return (
    <View style={styles.fullHistoryGroup}>
      <Text style={styles.fullHistoryGroupTitle}>{props.group.title}</Text>
      <View style={styles.fullHistoryList}>
        {props.group.transactions.map(transaction => (
          <FullHistoryTransaction
            key={transaction.title}
            transaction={transaction}
          />
        ))}
      </View>
    </View>
  );
}

function FullHistoryContent() {
  return (
    <ScrollView contentContainerStyle={styles.fullHistoryContent}>
      {fullHistoryGroups.map(group => (
        <FullHistoryGroup group={group} key={group.id} />
      ))}
    </ScrollView>
  );
}

function FullHistoryBottomSheet(props: {
  onClose: () => void;
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
          <FullHistoryHeader dragHandleProps={dragHandleProps} />
          <FullHistoryContent />
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

function WalletOption({ wallet }: { wallet: (typeof wallets)[number] }) {
  const optionStyle = styles[`${wallet.tone}WalletOption`];
  const iconStyle = styles[`${wallet.tone}WalletIcon`];
  const amountStyle = styles[`${wallet.tone}WalletAmount`];

  return (
    <Pressable style={[styles.walletOption, optionStyle]}>
      <View style={[styles.walletOptionIcon, iconStyle]}>
        <Text style={styles.sheetIconText}>{wallet.icon}</Text>
      </View>
      <Text style={styles.walletOptionName}>{wallet.name}</Text>
      <Text style={[styles.walletOptionAmount, amountStyle]}>
        {wallet.amount}
      </Text>
    </Pressable>
  );
}

function WalletGrid() {
  return (
    <View style={styles.walletGrid}>
      {wallets.map(wallet => (
        <WalletOption key={wallet.id} wallet={wallet} />
      ))}
    </View>
  );
}

function SheetHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
}) {
  return (
    <View>
      <View {...props.dragHandleProps}>
        <View style={styles.sheetHandle} />
      </View>
      <View style={styles.sheetHeader}>
        <View style={styles.sheetTitleArea} {...props.dragHandleProps}>
          <Text style={styles.sheetTitle}>Pilih Dompet 👛</Text>
        </View>
        <Pressable onPress={props.onClose} style={styles.sheetCloseButton}>
          <Text style={styles.sheetCloseText}>×</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SheetContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
}) {
  return (
    <>
      <SheetHeader
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
      />
      <TotalWalletOption />
      <WalletGrid />
      <Pressable style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>Konfirmasi Pilihan</Text>
      </Pressable>
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

function FloatingAddButton(props: { onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.floatingAddButton}>
      <Text style={styles.floatingAddText}>+</Text>
    </Pressable>
  );
}

function DashboardSheets(props: {
  isFullHistoryVisible: boolean;
  isAddSheetVisible: boolean;
  isWalletSheetVisible: boolean;
  onCloseAddSheet: () => void;
  onCloseFullHistory: () => void;
  onCloseWalletSheet: () => void;
}) {
  return (
    <>
      <FullHistoryBottomSheet
        onClose={props.onCloseFullHistory}
        visible={props.isFullHistoryVisible}
      />
      <WalletBottomSheet
        onClose={props.onCloseWalletSheet}
        visible={props.isWalletSheetVisible}
      />
      <AddTransactionSheet
        onClose={props.onCloseAddSheet}
        visible={props.isAddSheetVisible}
      />
    </>
  );
}

function DashboardContent(props: {
  onOpenFullHistory: () => void;
  onOpenWalletSheet: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContent}>
      <Header />
      <BalanceCard onOpenWalletSheet={props.onOpenWalletSheet} />
      <SummaryCards />
      <UsageSection />
      <SpendingLimitSection />
      <HistorySection onOpenFullHistory={props.onOpenFullHistory} />
    </ScrollView>
  );
}

function DashboardScreen() {
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [isFullHistoryVisible, setFullHistoryVisible] = useState(false);
  const [isWalletSheetVisible, setWalletSheetVisible] = useState(false);

  return (
    <View style={styles.container}>
      <DashboardContent
        onOpenFullHistory={() => setFullHistoryVisible(true)}
        onOpenWalletSheet={() => setWalletSheetVisible(true)}
      />
      <FloatingAddButton onPress={() => setAddSheetVisible(true)} />
      <DashboardSheets
        isAddSheetVisible={isAddSheetVisible}
        isFullHistoryVisible={isFullHistoryVisible}
        isWalletSheetVisible={isWalletSheetVisible}
        onCloseAddSheet={() => setAddSheetVisible(false)}
        onCloseFullHistory={() => setFullHistoryVisible(false)}
        onCloseWalletSheet={() => setWalletSheetVisible(false)}
      />
    </View>
  );
}

export default DashboardScreen;
