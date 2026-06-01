import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  getDashboardSummary,
  getWallets,
  type DashboardSummary,
  type Wallet,
} from '../../../../Services';
import { colors } from '../../../../Theme';
import { getAuthToken } from '../../../../Utils/authStorage';
import type {
  SummaryCardsProps,
} from '../../DashboardScreen.types';

import styles from './DashboardSummaryCards.styles';
import type {
  SummaryCardData,
  SummaryCardFilterState,
  SummaryCardProps,
  SummaryCardVariant,
} from './DashboardSummaryCards.types';

function DashboardSummaryCards(props: SummaryCardsProps) {
  const wallets = useSummaryWallets();
  const income = useSummaryCardSummary(props, wallets);
  const expense = useSummaryCardSummary(props, wallets);

  return (
    <View style={styles.section}>
      <View style={styles.grid}>
        {getSummaryCards().map(card => (
          <SummaryCard
            key={card.variant}
            {...card}
            filterState={card.variant === 'income' ? income.filter : expense.filter}
            isLoading={props.isLoading || getCardLoading(card.variant, income, expense)}
            onOpenHistory={props.onOpenHistory}
            periodLabel={props.periodLabel}
            value={getCardValue(card.variant, income.summary, expense.summary)}
          />
        ))}
      </View>
    </View>
  );
}

function SummaryCard(props: SummaryCardProps) {
  if (props.isLoading) {
    return <SummaryCardLoadingState variant={props.variant} />;
  }

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => props.onOpenHistory(
          props.filter,
          props.filterState.selectedWalletId,
        )}
        style={styles.cardMain}
      >
        <SummaryIcon icon={props.icon} variant={props.variant} />
        <Text style={styles.label}>{props.label}</Text>
        <Text style={styles.period}>{props.periodLabel}</Text>
        <Text style={styles.value}>{props.value}</Text>
      </Pressable>
      <SummaryWalletDropdown filter={props.filterState} />
    </View>
  );
}

function SummaryWalletDropdown(props: { filter: SummaryCardFilterState }) {
  if (!props.filter.wallets.length) {
    return null;
  }

  return (
    <View style={styles.dropdownArea}>
      <Pressable onPress={props.filter.toggleDropdown} style={styles.dropdownButton}>
        <Text numberOfLines={1} style={styles.dropdownText}>
          {props.filter.selectedWalletName}
        </Text>
        <Text style={styles.dropdownIcon}>
          {props.filter.isDropdownOpen ? '⌃' : '⌄'}
        </Text>
      </Pressable>
      <SummaryWalletDropdownOptions filter={props.filter} />
    </View>
  );
}

function SummaryWalletDropdownOptions(props: { filter: SummaryCardFilterState }) {
  if (!props.filter.isDropdownOpen) {
    return null;
  }

  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={styles.dropdownOptions}
      contentContainerStyle={styles.dropdownOptionsContent}
    >
      {getWalletOptions(props.filter.wallets).map(wallet => (
        <SummaryWalletDropdownOption
          filter={props.filter}
          key={wallet.id}
          wallet={wallet}
        />
      ))}
    </ScrollView>
  );
}

function SummaryWalletDropdownOption(props: {
  filter: SummaryCardFilterState;
  wallet: { id: string; name: string };
}) {
  const isActive = props.filter.selectedWalletId === props.wallet.id;

  return (
    <Pressable
      onPress={() => props.filter.selectWallet(props.wallet.id)}
      style={[styles.dropdownOption, isActive && styles.dropdownOptionActive]}
    >
      <Text
        numberOfLines={1}
        style={[styles.dropdownOptionText, isActive && styles.dropdownOptionTextActive]}
      >
        {props.wallet.name}
      </Text>
    </Pressable>
  );
}

function SummaryCardLoadingState(props: {
  variant: SummaryCardVariant;
}) {
  return (
    <View style={styles.card}>
      <SummaryIcon icon={props.variant === 'income' ? '↙' : '↗'} variant={props.variant} />
      <View style={styles.loadingState}>
        <ActivityIndicator color={styles.loadingSpinner.color} size="small" />
        <Text style={styles.loadingText}>Memuat ringkasan...</Text>
      </View>
    </View>
  );
}

function SummaryIcon(props: {
  icon: string;
  variant: SummaryCardVariant;
}) {
  return (
    <View
      style={[
        styles.iconBox,
        { backgroundColor: getSummaryIconColor(props.variant) },
      ]}
    >
      <Text style={styles.icon}>{props.icon}</Text>
    </View>
  );
}

function getSummaryIconColor(variant: SummaryCardVariant) {
  return variant === 'income' ? colors.secondary : colors.primary;
}

function getSummaryCards(): SummaryCardData[] {
  return [
    {
      filter: 'Pemasukan',
      icon: '↙',
      label: 'Uang Masuk',
      variant: 'income',
    },
    {
      filter: 'Pengeluaran',
      icon: '↗',
      label: 'Uang Keluar',
      variant: 'expense',
    },
  ];
}

type SummaryCardSummaryState = {
  filter: SummaryCardFilterState;
  isLoading: boolean;
  summary: DashboardSummary | null;
};

function useSummaryWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => createSummaryWalletLoadEffect(setWallets), []);

  return wallets;
}

function useSummaryCardSummary(
  props: SummaryCardsProps,
  wallets: Wallet[],
): SummaryCardSummaryState {
  const state = useSummaryCardLocalState();

  useSummaryCardSummaryRequest(
    props.apiMonth,
    props.periodId,
    state.selectedWalletId,
    state.setSummary,
    state.setLoading,
  );

  return getSummaryCardSummaryState({
    dashboardSummary: props.dashboardSummary,
    state,
    wallets,
  });
}

function getSummaryCardSummaryState(params: {
  dashboardSummary: DashboardSummary | null;
  state: ReturnType<typeof useSummaryCardLocalState>;
  wallets: Wallet[];
}): SummaryCardSummaryState {
  return {
    filter: getSummaryCardFilter({
      isDropdownOpen: params.state.isDropdownOpen,
      selectedWalletId: params.state.selectedWalletId,
      setDropdownOpen: params.state.setDropdownOpen,
      setSelectedWalletId: params.state.setSelectedWalletId,
      setSummary: params.state.setSummary,
      wallets: params.wallets,
    }),
    isLoading: params.state.isLoading,
    summary: params.state.summary ?? params.dashboardSummary,
  };
}

function useSummaryCardLocalState() {
  const [selectedWalletId, setSelectedWalletId] = useState('all');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setLoading] = useState(false);

  return {
    isDropdownOpen,
    isLoading,
    selectedWalletId,
    setDropdownOpen,
    setLoading,
    setSelectedWalletId,
    setSummary,
    summary,
  };
}

function useSummaryCardSummaryRequest(
  apiMonth: string,
  periodId: string | undefined,
  selectedWalletId: string,
  setSummary: (summary: DashboardSummary | null) => void,
  setLoading: (value: boolean) => void,
) {
  useEffect(() => createSummaryFilterLoadEffect(
    apiMonth,
    periodId,
    selectedWalletId,
    setSummary,
    setLoading,
  ), [apiMonth, periodId, selectedWalletId, setLoading, setSummary]);
}

function getSummaryCardFilter(params: {
  isDropdownOpen: boolean;
  selectedWalletId: string;
  setDropdownOpen: (value: boolean | ((value: boolean) => boolean)) => void;
  setSelectedWalletId: (walletId: string) => void;
  setSummary: (summary: DashboardSummary | null) => void;
  wallets: Wallet[];
}): SummaryCardFilterState {
  return {
    isDropdownOpen: params.isDropdownOpen,
    selectedWalletId: params.selectedWalletId,
    selectedWalletName: getSelectedWalletName(params.selectedWalletId, params.wallets),
    selectWallet: getSelectSummaryWalletHandler(params),
    toggleDropdown: () => params.setDropdownOpen(value => !value),
    wallets: params.wallets,
  };
}

function getSelectSummaryWalletHandler(
  params: Pick<
    Parameters<typeof getSummaryCardFilter>[0],
    'setDropdownOpen' | 'setSelectedWalletId' | 'setSummary'
  >,
) {
  return (walletId: string) => {
    if (walletId === 'all') {
      params.setSummary(null);
    }

    params.setSelectedWalletId(walletId);
    params.setDropdownOpen(false);
  };
}

function createSummaryWalletLoadEffect(setWallets: (wallets: Wallet[]) => void) {
  let isMounted = true;

  loadSummaryWallets(wallets => isMounted && setWallets(wallets))
    .catch(() => undefined);

  return () => {
    isMounted = false;
  };
}

function createSummaryFilterLoadEffect(
  apiMonth: string,
  periodId: string | undefined,
  walletId: string,
  setSummary: (summary: DashboardSummary | null) => void,
  setLoading: (value: boolean) => void,
) {
  let isMounted = true;

  if (walletId !== 'all') {
    loadWalletSummary({
      apiMonth,
      periodId,
      setLoading: value => isMounted && setLoading(value),
      setSummary: value => isMounted && setSummary(value),
      walletId,
    }).catch(() => undefined);
  }

  return () => {
    isMounted = false;
  };
}

async function loadSummaryWallets(setWallets: (wallets: Wallet[]) => void) {
  const token = await getAuthToken();

  if (!token) {
    return;
  }

  setWallets((await getWallets(token)).data);
}

async function loadWalletSummary(params: {
  apiMonth: string;
  periodId?: string;
  setLoading: (value: boolean) => void;
  setSummary: (summary: DashboardSummary | null) => void;
  walletId: string;
}) {
  const token = await getAuthToken();

  if (!token) {
    return;
  }

  params.setLoading(true);

  try {
    params.setSummary(await fetchWalletSummary(token, params));
  } finally {
    params.setLoading(false);
  }
}

async function fetchWalletSummary(
  token: string,
  params: Pick<Parameters<typeof loadWalletSummary>[0], 'apiMonth' | 'periodId' | 'walletId'>,
) {
  return (
    await getDashboardSummary(
      token,
      params.apiMonth,
      params.walletId,
      params.periodId,
    )
  ).data;
}

function getCardLoading(
  variant: SummaryCardVariant,
  income: SummaryCardSummaryState,
  expense: SummaryCardSummaryState,
) {
  return variant === 'income' ? income.isLoading : expense.isLoading;
}

function getCardValue(
  variant: SummaryCardVariant,
  income?: DashboardSummary | null,
  expense?: DashboardSummary | null,
) {
  const amount = variant === 'income'
    ? income?.income.amount
    : expense?.expense.amount;

  return formatRupiah(amount ?? 0);
}

function getSelectedWalletName(walletId: string, wallets: Wallet[]) {
  if (walletId === 'all') {
    return 'Semua Dompet';
  }

  return wallets.find(wallet => wallet.id === walletId)?.name ?? 'Dompet';
}

function getWalletOptions(wallets: Array<{ id: string; name: string }>) {
  return [{ id: 'all', name: 'Semua Dompet' }, ...wallets];
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export default DashboardSummaryCards;
