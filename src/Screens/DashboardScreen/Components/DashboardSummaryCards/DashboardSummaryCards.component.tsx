import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../../Theme';
import type {
  SummaryCardsProps,
} from '../../DashboardScreen.types';

import styles from './DashboardSummaryCards.styles';
import type {
  SummaryCardData,
  SummaryCardProps,
  SummaryCardVariant,
} from './DashboardSummaryCards.types';

function DashboardSummaryCards(props: SummaryCardsProps) {
  return (
    <View style={styles.grid}>
      {getSummaryCards(props).map(card => (
        <SummaryCard
          key={card.variant}
          {...card}
          isLoading={props.isLoading}
          onOpenHistory={props.onOpenHistory}
          periodLabel={props.periodLabel}
        />
      ))}
    </View>
  );
}

function SummaryCard(props: SummaryCardProps) {
  if (props.isLoading) {
    return <SummaryCardLoadingState variant={props.variant} />;
  }

  return (
    <Pressable
      disabled={props.isLoading}
      onPress={() => props.onOpenHistory(props.filter)}
      style={styles.card}
    >
      <SummaryIcon icon={props.icon} variant={props.variant} />
      <Text style={styles.label}>{props.label}</Text>
      <Text style={styles.period}>{props.periodLabel}</Text>
      <Text style={styles.value}>{props.value}</Text>
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

function getSummaryCards(props: SummaryCardsProps): SummaryCardData[] {
  return [
    {
      filter: 'Pemasukan',
      icon: '↙',
      label: 'Uang Masuk',
      value: props.dashboardSummary?.income.formatted ?? 'Rp 0',
      variant: 'income',
    },
    {
      filter: 'Pengeluaran',
      icon: '↗',
      label: 'Uang Keluar',
      value: props.dashboardSummary?.expense.formatted ?? 'Rp 0',
      variant: 'expense',
    },
  ];
}

export default DashboardSummaryCards;
