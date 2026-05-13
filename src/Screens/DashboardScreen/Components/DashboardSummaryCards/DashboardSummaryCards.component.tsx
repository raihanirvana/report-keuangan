import {
  Pressable,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../../Theme';
import type {
  HistoryFilter,
  SummaryCardsProps,
} from '../../DashboardScreen.types';

import styles from './DashboardSummaryCards.styles';

type SummaryCardVariant = 'expense' | 'income';

type SummaryCardData = {
  filter: HistoryFilter;
  icon: string;
  label: string;
  value: string;
  variant: SummaryCardVariant;
};

type SummaryCardProps = SummaryCardData & {
  onOpenHistory: (filter: HistoryFilter) => void;
  periodLabel: string;
};

function DashboardSummaryCards(props: SummaryCardsProps) {
  return (
    <View style={styles.grid}>
      {getSummaryCards(props).map(card => (
        <SummaryCard
          key={card.variant}
          {...card}
          onOpenHistory={props.onOpenHistory}
          periodLabel={props.periodLabel}
        />
      ))}
    </View>
  );
}

function SummaryCard(props: SummaryCardProps) {
  return (
    <Pressable
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
