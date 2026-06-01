import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../../../Components/BottomSheet';
import CategoryCreateContent, {
  categoryColorPresets,
  categoryIconPresets,
} from '../../../../Components/CategoryCreateContent';
import { Snackbar } from '../../../../Components/Snackbar';
import {
  copyPreviousBudgets,
  createBudget,
  createCategory,
  deleteBudget,
  getBudgets,
  getCategories,
  getDashboardSummary,
  updateBudget,
  type BudgetItem,
  type BudgetPreviousMonth,
  type BudgetsResponse,
  type Category,
  type CreateBudgetPayload,
  type CreateCategoryPayload,
  type DashboardSummary,
} from '../../../../Services';
import { getAuthToken } from '../../../../Utils/authStorage';
import { getCategoryIconValue } from '../../../../Utils/categoryIcons';
import type {
  CustomCategoryFormState,
  EditingLimitDraft,
  LimitCategoryCreateContentProps,
  LimitCategoryFormState,
  LimitDetail,
  LimitDetailListViewProps,
  LimitDetailSheetContentProps,
  LimitDetailState,
  LimitDetailStateProps,
  LimitEditFormState,
  LimitSheetState,
  LimitSheetView,
  LimitTone,
  SaveLimitParams,
  SetLimitState,
} from '../../DashboardScreen.types';

import styles from './DashboardSpendingLimit.styles';

const limitDetailStyleMap = {
  blue: {
    progress: styles.blueLimitProgress,
    text: styles.blueLimitText,
  },
  primary: {
    progress: styles.primaryLimitProgress,
    text: styles.primaryLimitText,
  },
  purple: {
    progress: styles.purpleLimitProgress,
    text: styles.purpleLimitText,
  },
  yellow: {
    progress: styles.yellowLimitProgress,
    text: styles.yellowLimitText,
  },
};

function SpendingLimitSection(props: {
  budgetRefreshKey: number;
  dashboardSummary: DashboardSummary | null;
  isLoading: boolean;
  month: string;
  onOpenLimitDetail: () => void;
  periodId?: string;
}) {
  const filter = useSpendingLimitFilter(
    props.month,
    props.periodId,
    props.dashboardSummary,
    props.budgetRefreshKey,
  );
  const budgetLimit = getSelectedBudgetLimit(props.dashboardSummary, filter);

  if (props.isLoading || filter.isLoading) {
    return <SpendingLimitLoadingState />;
  }

  return <SpendingLimitCard budgetLimit={budgetLimit} filter={filter} onPress={props.onOpenLimitDetail} />;
}

function SpendingLimitCard(props: {
  budgetLimit: ReturnType<typeof getSelectedBudgetLimit>;
  filter: SpendingLimitFilterState;
  onPress: () => void;
}) {
  return (
    <View style={styles.limitSection}>
      <Pressable onPress={props.onPress} style={styles.limitCard}>
        <SpendingLimitHeader
          filterLabel={props.filter.selectedLabel}
          percentage={props.budgetLimit.percentage}
        />
        <SpendingLimitFilterDropdown filter={props.filter} />
        <SpendingLimitProgress percentage={props.budgetLimit.percentage} />
        <SpendingLimitAmount
          limitAmount={props.budgetLimit.limitAmount}
          usedAmount={props.budgetLimit.usedAmount}
        />
      </Pressable>
    </View>
  );
}

function SpendingLimitLoadingState() {
  return (
    <View style={styles.limitSection}>
      <View style={styles.limitCard}>
        <View style={styles.limitLoadingState}>
          <ActivityIndicator color={styles.limitLoadingSpinner.color} size="large" />
          <Text style={styles.limitLoadingText}>Memuat batas pengeluaran...</Text>
        </View>
      </View>
    </View>
  );
}

function SpendingLimitHeader(props: {
  filterLabel: string;
  percentage: number;
}) {
  return (
    <View style={styles.limitHeader}>
      <View style={styles.limitTitleRow}>
        <Text style={styles.limitIcon}>◎</Text>
        <Text numberOfLines={1} style={styles.limitTitle}>
          {props.filterLabel}
        </Text>
      </View>
      <Text numberOfLines={1} style={styles.limitBadge}>
        {formatLimitPercentage(props.percentage)}
      </Text>
    </View>
  );
}

function SpendingLimitFilterDropdown(props: {
  filter: SpendingLimitFilterState;
}) {
  return (
    <View style={styles.limitFilterArea}>
      <Pressable
        onPress={props.filter.toggleDropdown}
        style={styles.limitFilterButton}
      >
        <View style={styles.limitFilterCopy}>
          <Text style={styles.limitFilterEyebrow}>Filter limit</Text>
          <Text numberOfLines={1} style={styles.limitFilterSelected}>
            {props.filter.selectedLabel}
          </Text>
        </View>
        <Text style={styles.limitFilterArrow}>
          {props.filter.isDropdownOpen ? '⌃' : '⌄'}
        </Text>
      </Pressable>
      <SpendingLimitFilterOptions filter={props.filter} />
    </View>
  );
}

function SpendingLimitFilterOptions(props: {
  filter: SpendingLimitFilterState;
}) {
  if (!props.filter.isDropdownOpen) {
    return null;
  }

  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={styles.limitFilterOptions}
      contentContainerStyle={styles.limitFilterOptionsContent}
    >
      {getLimitFilterOptions(props.filter.items).map(option => (
        <LimitFilterOption
          isActive={props.filter.selectedBudgetId === option.id}
          key={option.id}
          label={option.name}
          onPress={() => props.filter.selectBudget(option.id)}
        />
      ))}
    </ScrollView>
  );
}

function LimitFilterOption(props: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.limitFilterOption, props.isActive && styles.limitFilterOptionActive]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.limitFilterOptionText,
          props.isActive && styles.limitFilterOptionTextActive,
        ]}
      >
        {props.label}
      </Text>
    </Pressable>
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

type SpendingLimitFilterState = {
  isDropdownOpen: boolean;
  isLoading: boolean;
  items: BudgetItem[];
  selectedBudgetId: string;
  selectedLabel: string;
  selectBudget: (budgetId: string) => void;
  toggleDropdown: () => void;
};

function useSpendingLimitFilter(
  month: string,
  periodId: string | undefined,
  dashboardSummary: DashboardSummary | null,
  refreshKey: number,
): SpendingLimitFilterState {
  const state = useSpendingLimitFilterLocalState();
  const deps = getSpendingLimitFilterDeps(month, periodId, dashboardSummary, refreshKey);

  useSpendingLimitFilterLoader(month, periodId, state, deps);

  return getSpendingLimitFilterState(state);
}

function useSpendingLimitFilterLoader(
  month: string,
  periodId: string | undefined,
  state: ReturnType<typeof useSpendingLimitFilterLocalState>,
  deps: unknown[],
) {
  useEffect(
    () => createSpendingLimitFilterLoadEffect(
      month,
      periodId,
      state.setItems,
      state.setLoading,
    ),
    deps,
  );
}

function useSpendingLimitFilterLocalState() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState('all');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  return {
    isDropdownOpen,
    isLoading,
    items,
    selectedBudgetId,
    setDropdownOpen,
    setItems,
    setLoading,
    setSelectedBudgetId,
  };
}

function getSpendingLimitFilterState(
  state: ReturnType<typeof useSpendingLimitFilterLocalState>,
) {
  return {
    isDropdownOpen: state.isDropdownOpen,
    isLoading: state.isLoading,
    items: state.items,
    selectedBudgetId: state.selectedBudgetId,
    selectedLabel: getSelectedLimitLabel(state.selectedBudgetId, state.items),
    selectBudget: getSelectBudgetHandler(state.setSelectedBudgetId, state.setDropdownOpen),
    toggleDropdown: () => state.setDropdownOpen(value => !value),
  };
}

function getSpendingLimitFilterDeps(
  month: string,
  periodId: string | undefined,
  dashboardSummary: DashboardSummary | null,
  refreshKey: number,
) {
  return [
    month,
    periodId,
    refreshKey,
    dashboardSummary?.budgetLimit.limitAmount,
    dashboardSummary?.budgetLimit.usedAmount,
  ];
}

function getSelectBudgetHandler(
  setSelectedBudgetId: (budgetId: string) => void,
  setDropdownOpen: (value: boolean) => void,
) {
  return (budgetId: string) => {
    setSelectedBudgetId(budgetId);
    setDropdownOpen(false);
  };
}

function createSpendingLimitFilterLoadEffect(
  month: string,
  periodId: string | undefined,
  setItems: (items: BudgetItem[]) => void,
  setLoading: (value: boolean) => void,
) {
  let isMounted = true;

  loadSpendingLimitFilterItems({
    month,
    periodId,
    setItems: value => isMounted && setItems(value),
    setLoading: value => isMounted && setLoading(value),
  }).catch(() => undefined);

  return () => {
    isMounted = false;
  };
}

async function loadSpendingLimitFilterItems(params: {
  month: string;
  periodId?: string;
  setItems: (items: BudgetItem[]) => void;
  setLoading: (value: boolean) => void;
}) {
  params.setLoading(true);

  try {
    params.setItems(await fetchBudgetItems(params.month, params.periodId));
  } finally {
    params.setLoading(false);
  }
}

async function fetchBudgetItems(month: string, periodId?: string) {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  return (await getBudgets(token, month, periodId)).data.items;
}

function getSelectedLimitLabel(selectedBudgetId: string, items: BudgetItem[]) {
  if (selectedBudgetId === 'all') {
    return 'Semua Limit';
  }

  return items.find(item => item.id === selectedBudgetId)?.name ?? 'Semua Limit';
}

function getLimitFilterOptions(items: BudgetItem[]) {
  return [{ id: 'all', name: 'Semua Limit' }, ...items];
}

function getSelectedBudgetLimit(
  dashboardSummary: DashboardSummary | null,
  filter: SpendingLimitFilterState,
) {
  const selectedItem = filter.items.find(item => item.id === filter.selectedBudgetId);

  if (selectedItem) {
    return {
      limitAmount: selectedItem.limitAmount,
      percentage: selectedItem.percentage,
      usedAmount: selectedItem.usedAmount,
    };
  }

  return dashboardSummary?.budgetLimit ?? {
    limitAmount: 0,
    percentage: 0,
    usedAmount: 0,
  };
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

function getLimitDetailStyles(tone: LimitTone) {
  return limitDetailStyleMap[tone];
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
    icon: getCategoryIconValue(item.icon),
    id: item.id,
    label: item.name,
    limitAmount: item.limitAmount,
    progress: item.statusLabel || formatLimitPercentage(item.percentage),
    tone: getBudgetTone(item.color),
    width: getLimitWidth(item.percentage),
  };
}

function mapBudgetsResponse(response: BudgetsResponse): LimitDetailState {
  return {
    items: response.items.map(mapBudgetToLimitDetail),
    previousMonth: response.previousMonth,
  };
}

async function fetchLimitDetails(month: string, periodId?: string) {
  const token = await getAuthToken();

  if (!token) {
    return { items: [] };
  }

  const response = await getBudgets(token, month, periodId);

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
      <View style={styles.limitDetailTitleRow}>
        <View style={styles.limitDetailTitleCopy}>
          <Text style={styles.limitDetailTitle}>Detail Limit 📊</Text>
          <Text style={styles.limitDetailSubtitle}>SEMANGAT HEMAT YA, KAK! ✨</Text>
        </View>
        <LimitDetailHeaderActions {...props} />
      </View>
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
  if (!props.limitItems.length) {
    return null;
  }

  return <LimitDetailHeaderActionButtons {...props} />;
}

function LimitDetailHeaderActionButtons(props: {
  isDeleteMode: boolean;
  isEditMode: boolean;
  onToggleEdit: () => void;
  onToggleDelete: () => void;
}) {
  return (
    <View style={styles.limitHeaderAction}>
      <WalletEditModeButton
        isActive={props.isEditMode}
        isDisabled={false}
        onPress={props.onToggleEdit}
      />
      <WalletTrashButton
        isActive={props.isDeleteMode}
        isDisabled={false}
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
  isBusy: boolean;
  onCreateCategory: () => void;
  onUsePreviousMonth: () => void;
}) {
  return (
    <View style={styles.limitEmptyState}>
      <Text style={styles.limitEmptyTitle}>Belum ada batas pengeluaran</Text>
      <Text style={styles.limitEmptyText}>
        Atur batas belanja per kategori, atau pakai aturan bulan kemarin.
      </Text>
      <LimitEmptyStateActions {...props} />
    </View>
  );
}

function LimitEmptyStateActions(props: {
  isBusy: boolean;
  onCreateCategory: () => void;
  onUsePreviousMonth: () => void;
}) {
  return (
    <>
      <Pressable
        disabled={props.isBusy}
        onPress={props.onCreateCategory}
        style={[styles.addLimitCategoryButton, props.isBusy && styles.walletTrashButtonDisabled]}
      >
        <Text style={styles.addLimitCategoryText}>Tambah Batas Kategori</Text>
      </Pressable>
      <Pressable
        disabled={props.isBusy}
        onPress={props.onUsePreviousMonth}
        style={[styles.usePreviousLimitButton, props.isBusy && styles.walletTrashButtonDisabled]}
      >
        <Text style={styles.usePreviousLimitText}>Pakai Aturan Bulan Kemarin</Text>
      </Pressable>
    </>
  );
}

function LimitDetailItems(props: {
  isBusy: boolean;
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
      <AddLimitCategoryButton isBusy={props.isBusy} onPress={props.onCreateCategory} />
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

function AddLimitCategoryButton(props: { isBusy: boolean; onPress: () => void }) {
  return (
    <Pressable
      disabled={props.isBusy}
      onPress={props.onPress}
      style={[styles.addLimitCategoryButton, props.isBusy && styles.walletTrashButtonDisabled]}
    >
      <Text style={styles.addLimitCategoryText}>Tambah Batas Kategori</Text>
    </Pressable>
  );
}

function LimitDetailContent(props: {
  isBusy: boolean;
  isDeleteMode: boolean;
  isEditMode: boolean;
  isFetching: boolean;
  limitItems: LimitDetail[];
  onCreateCategory: () => void;
  onDeleteBudget: (budgetId: string) => void;
  onEditBudget: (item: LimitDetail) => void;
  onUsePreviousMonth: () => void;
}) {
  if (props.isFetching) {
    return (
      <View style={styles.limitDetailContent}>
        <LimitDetailLoadingState />
      </View>
    );
  }

  return renderLimitDetailContentBody(props);
}

function renderLimitDetailContentBody(props: {
  isBusy: boolean;
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
        isBusy={props.isBusy}
        onCreateCategory={props.onCreateCategory}
        onUsePreviousMonth={props.onUsePreviousMonth}
      />
    </View>
  );
}

function LimitDetailLoadingState() {
  return (
    <View style={styles.limitLoadingSheetState}>
      <ActivityIndicator color={styles.limitLoadingSpinner.color} size="large" />
      <Text style={styles.limitLoadingText}>Memuat batas kategori...</Text>
    </View>
  );
}

function LimitCategoryCreateContent(props: LimitCategoryCreateContentProps) {
  const state = useLimitCategoryFormState(
    props.month,
    props.periodId,
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
    isBusy: boolean;
    onCreateNewCategory: () => void;
    onSaveCategory: (state: LimitCategoryFormState) => void;
  },
  state: LimitCategoryFormState,
) {
  return {
    isBusy: props.isBusy,
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
  isBusy: boolean;
  onCreateNewCategory: () => void;
  onSaveCategory: () => void;
}) {
  return (
    <>
      <Pressable
        disabled={props.isBusy}
        onPress={props.onCreateNewCategory}
        style={[styles.limitSecondaryButton, props.isBusy && styles.walletTrashButtonDisabled]}
      >
        <Text style={styles.limitSecondaryButtonText}>Tambah Kategori Baru</Text>
      </Pressable>
      <Pressable
        disabled={props.isBusy}
        onPress={props.onSaveCategory}
        style={[styles.saveWalletButton, props.isBusy && styles.walletTrashButtonDisabled]}
      >
        <Text style={styles.saveWalletButtonText}>Simpan Kategori</Text>
      </Pressable>
    </>
  );
}

function LimitCategoryFormFields(props: { state: LimitCategoryFormState }) {
  if (props.state.isLoading) {
    return <LimitFormLoadingState label="Memuat kategori pengeluaran..." />;
  }

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

function LimitFormLoadingState(props: { label: string }) {
  return (
    <View style={styles.limitFormLoadingState}>
      <ActivityIndicator color={styles.limitLoadingSpinner.color} size="large" />
      <Text style={styles.limitLoadingText}>{props.label}</Text>
    </View>
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
  periodId: string | undefined,
  refreshKey: number,
  onInfoMessage: (message: string) => void,
): LimitCategoryFormState {
  const categoriesState = useExpenseCategories(refreshKey);
  const spentCategoryIdsState = useSpentExpenseCategoryIds(month, periodId);
  const selection = useLimitCategorySelectionState(
    spentCategoryIdsState.categoryIds,
    onInfoMessage,
  );

  return getLimitCategoryFormState({
    categories: categoriesState.categories,
    isLoading: categoriesState.isLoading || spentCategoryIdsState.isLoading,
    limitAmount: selection.limitAmount,
    selectCategory: selection.selectCategory,
    selectedCategoryId: getEffectiveCategoryId(
      selection.selectedCategoryId,
      categoriesState.categories,
    ),
    setLimitAmount: selection.setLimitAmount,
  });
}

function useLimitCategorySelectionState(
  spentCategoryIds: Set<string>,
  onInfoMessage: (message: string) => void,
) {
  const [limitAmount, setLimitAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  return {
    limitAmount,
    selectedCategoryId,
    selectCategory: getSelectLimitCategoryHandler(
      setSelectedCategoryId,
      spentCategoryIds,
      onInfoMessage,
    ),
    setLimitAmount,
  };
}

function getEffectiveCategoryId(selectedCategoryId: string, categories: Category[]) {
  return selectedCategoryId || categories[0]?.id || '';
}

function getLimitCategoryFormState(params: {
  categories: Category[];
  isLoading: boolean;
  limitAmount: string;
  selectCategory: (value: string) => void;
  selectedCategoryId: string;
  setLimitAmount: (value: string) => void;
}): LimitCategoryFormState {
  return {
    categories: params.categories,
    isLoading: params.isLoading,
    limitAmount: params.limitAmount,
    selectedCategoryId: params.selectedCategoryId,
    setLimitAmount: value => params.setLimitAmount(formatMoneyInput(value)),
    setSelectedCategoryId: params.selectCategory,
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
  const [isLoading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadExpenseCategories(setCategories, setLoading).catch(() => undefined);
  }, [refreshKey]);

  return {
    categories,
    isLoading,
  };
}

function useSpentExpenseCategoryIds(month: string, periodId?: string) {
  const [isLoading, setLoading] = useState(false);
  const [categoryIds, setCategoryIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSpentExpenseCategoryIds(month, periodId, setCategoryIds, setLoading).catch(() => undefined);
  }, [month, periodId]);

  return {
    categoryIds,
    isLoading,
  };
}

async function loadExpenseCategories(
  setCategories: (value: Category[]) => void,
  setLoading: (value: boolean) => void,
) {
  try {
    setLoading(true);
    setCategories(await fetchExpenseCategories());
  } catch {
    setCategories([]);
  } finally {
    setLoading(false);
  }
}

async function loadSpentExpenseCategoryIds(
  month: string,
  periodId: string | undefined,
  setCategoryIds: (value: Set<string>) => void,
  setLoading: (value: boolean) => void,
) {
  try {
    setLoading(true);
    setCategoryIds(await fetchSpentExpenseCategoryIds(month, periodId));
  } catch {
    setCategoryIds(new Set());
  } finally {
    setLoading(false);
  }
}

async function fetchExpenseCategories() {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  const response = await getCategories(token, { type: 'EXPENSE' });

  return response.data;
}

async function fetchSpentExpenseCategoryIds(month: string, periodId?: string) {
  const summary = await fetchDashboardSummary(month, periodId);

  return new Set(
    (summary?.chart.categories ?? []).map(category => category.categoryId),
  );
}

async function fetchDashboardSummary(month: string, periodId?: string) {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const response = await getDashboardSummary(token, month, 'all', periodId);

  return response.data;
}

function LimitCategoryCreateView(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isBusy: boolean;
  month: string;
  onClose: () => void;
  onCreateNewCategory: () => void;
  onGoBack: () => void;
  onHideSnackbar: () => void;
  onInfoMessage: (message: string) => void;
  onSaveCategory: (state: LimitCategoryFormState) => void;
  periodId?: string;
  refreshKey: number;
  snackbarMessage: string;
}) {
  return (
    <>
      <LimitCategoryCreateHeader
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={props.onGoBack}
      />
      <LimitCategoryCreateBody {...props} />
    </>
  );
}

function LimitCategoryCreateBody(props: {
  isBusy: boolean;
  month: string;
  onCreateNewCategory: () => void;
  onHideSnackbar: () => void;
  onInfoMessage: (message: string) => void;
  onSaveCategory: (state: LimitCategoryFormState) => void;
  periodId?: string;
  refreshKey: number;
  snackbarMessage: string;
}) {
  const contentProps = getLimitCategoryCreateContentProps(props);

  return (
    <SheetScrollableContent>
      <LimitCategoryCreateContent {...contentProps} />
    </SheetScrollableContent>
  );
}

function SheetScrollableContent(props: { children: ReactNode }) {
  return (
    <ScrollView
      contentContainerStyle={styles.sheetScrollContent}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={styles.sheetScroll}
    >
      {props.children}
    </ScrollView>
  );
}

function getLimitCategoryCreateContentProps(props: {
  isBusy: boolean;
  month: string;
  onCreateNewCategory: () => void;
  onHideSnackbar: () => void;
  onInfoMessage: (message: string) => void;
  onSaveCategory: (state: LimitCategoryFormState) => void;
  periodId?: string;
  refreshKey: number;
  snackbarMessage: string;
}): LimitCategoryCreateContentProps {
  return {
    isBusy: props.isBusy,
    month: props.month,
    onCreateNewCategory: props.onCreateNewCategory,
    onHideInfoMessage: props.onHideSnackbar,
    onInfoMessage: props.onInfoMessage,
    onSaveCategory: props.onSaveCategory,
    periodId: props.periodId,
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
  isBusy: boolean;
  onSave: (state: LimitEditFormState) => void;
  state: LimitEditFormState;
}) {
  return (
    <View style={styles.walletForm}>
      <LimitEditFields state={props.state} />
      <LimitEditSaveButton isBusy={props.isBusy} onPress={() => props.onSave(props.state)} />
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

function LimitEditSaveButton(props: { isBusy: boolean; onPress: () => void }) {
  return (
    <Pressable
      disabled={props.isBusy}
      onPress={props.onPress}
      style={[styles.saveWalletButton, props.isBusy && styles.walletTrashButtonDisabled]}
    >
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
  isBusy: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onSave: (state: LimitEditFormState) => void;
}) {
  if (!props.draft) {
    return null;
  }

  return renderLimitEditLayout({
    draft: props.draft,
    dragHandleProps: props.dragHandleProps,
    isBusy: props.isBusy,
    onClose: props.onClose,
    onGoBack: props.onGoBack,
    onSave: props.onSave,
  });
}

function renderLimitEditLayout(props: {
  draft: EditingLimitDraft;
  dragHandleProps: BottomSheetDragHandleProps;
  isBusy: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onSave: (state: LimitEditFormState) => void;
}) {
  return (
    <>
      <LimitEditHeader
        dragHandleProps={props.dragHandleProps}
        onClose={props.onClose}
        onGoBack={props.onGoBack}
      />
      <LimitEditViewContent
        draft={props.draft}
        isBusy={props.isBusy}
        onSave={props.onSave}
      />
    </>
  );
}

function LimitEditViewContent(props: {
  draft: EditingLimitDraft;
  isBusy: boolean;
  onSave: (state: LimitEditFormState) => void;
}) {
  return (
    <LimitEditForm
      draft={props.draft}
      isBusy={props.isBusy}
      key={props.draft.budgetId}
      onSave={props.onSave}
    />
  );
}

function LimitEditForm(props: {
  draft: EditingLimitDraft;
  isBusy: boolean;
  onSave: (state: LimitEditFormState) => void;
}) {
  const state = useLimitEditFormState(props.draft);

  return <LimitEditContent isBusy={props.isBusy} onSave={props.onSave} state={state} />;
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
  isBusy: boolean;
  onSaveCategory: (state: CustomCategoryFormState) => void;
}) {
  const state = useCustomCategoryFormState();

  return (
    <View style={styles.walletForm}>
      <CategoryCreateContent
        color={state.color}
        icon={state.icon}
        isBusy={props.isBusy}
        name={state.name}
        onChangeColor={state.setColor}
        onChangeIcon={state.setIcon}
        onChangeName={state.setName}
        onSave={() => props.onSaveCategory(state)}
        saveLabel="Simpan Kategori"
      />
    </View>
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
  isBusy: boolean;
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
      <SheetScrollableContent>
        <CustomCategoryCreateContent
          isBusy={props.isBusy}
          onSaveCategory={props.onSaveCategory}
        />
      </SheetScrollableContent>
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

  useLimitDetailRefresh(
    props.month,
    props.periodId,
    props.visible,
    state.setFetching,
    state.setLimitState,
    state.setLoadingLabel,
  );

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
    values.setFetching,
    values.setLimitState,
    values.setLoadingLabel,
    values.setMutationCount,
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
  const loadingState = useLimitDetailLoadingState();
  const modeState = useLimitDetailModeState();
  const sheetState = useLimitDetailSheetState();

  return getLimitDetailLocalStateValuesResult({
    categoryRefreshKey,
    editingLimitDraft,
    limitState,
    loadingState,
    modeState,
    setCategoryRefreshKey,
    setEditingLimitDraft,
    setLimitState,
    sheetState,
  });
}

function useLimitDetailLoadingState() {
  const [isFetching, setFetching] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Memuat batas pengeluaran...');
  const [mutationCount, setMutationCount] = useState(0);

  return {
    isFetching,
    loadingLabel,
    mutationCount,
    setFetching,
    setLoadingLabel,
    setMutationCount,
  };
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

function getLimitDetailLocalStateValuesResult(props: {
  categoryRefreshKey: number;
  editingLimitDraft: EditingLimitDraft | null;
  limitState: LimitDetailState;
  loadingState: ReturnType<typeof useLimitDetailLoadingState>;
  modeState: ReturnType<typeof useLimitDetailModeState>;
  setCategoryRefreshKey: Dispatch<SetStateAction<number>>;
  setEditingLimitDraft: Dispatch<SetStateAction<EditingLimitDraft | null>>;
  setLimitState: Dispatch<SetStateAction<LimitDetailState>>;
  sheetState: ReturnType<typeof useLimitDetailSheetState>;
}) {
  return {
    categoryRefreshKey: props.categoryRefreshKey,
    editingLimitDraft: props.editingLimitDraft,
    limitState: props.limitState,
    setCategoryRefreshKey: props.setCategoryRefreshKey,
    setEditingLimitDraft: props.setEditingLimitDraft,
    setLimitState: props.setLimitState,
    ...props.loadingState,
    ...getLimitDetailModeStateResult(props.modeState),
    ...getLimitDetailSheetStateResult(props.sheetState),
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
    isBusy: state.isFetching || state.mutationCount > 0,
    isDeleteMode: state.isDeleteMode,
    isEditMode: state.isEditMode,
    isFetching: state.isFetching,
    limitItems: state.limitState.items,
    loadingLabel: state.loadingLabel,
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
    isFetching: values.isFetching,
    isDeleteMode: values.isDeleteMode,
    isEditMode: values.isEditMode,
    limitState: values.limitState,
    loadingLabel: values.loadingLabel,
    mutationCount: values.mutationCount,
    snackbarMessage: values.snackbarMessage,
    view: values.view,
  };
}

function getLimitDetailLocalStateSetters(
  setDeleteMode: Dispatch<SetStateAction<boolean>>,
  setEditMode: Dispatch<SetStateAction<boolean>>,
  setEditingLimitDraft: Dispatch<SetStateAction<EditingLimitDraft | null>>,
  setFetching: Dispatch<SetStateAction<boolean>>,
  setLimitState: Dispatch<SetStateAction<LimitDetailState>>,
  setLoadingLabel: Dispatch<SetStateAction<string>>,
  setMutationCount: Dispatch<SetStateAction<number>>,
  setSnackbarMessage: Dispatch<SetStateAction<string>>,
  setView: Dispatch<SetStateAction<LimitSheetView>>,
) {
  return {
    setDeleteMode,
    setEditMode,
    setEditingLimitDraft,
    setFetching,
    setLimitState,
    setLoadingLabel,
    setMutationCount,
    setSnackbarMessage,
    setView,
  };
}

function getLimitDetailActions(
  params: SaveLimitParams,
  state: ReturnType<typeof useLimitDetailLocalState>,
) {
  const setMutationState = createLimitMutationStateSetter(
    state.setLoadingLabel,
    state.setMutationCount,
  );

  return {
    deleteCategory: getDeleteLimitCategoryHandler(params, setMutationState),
    editCategory: getEditLimitCategoryHandler(params, setMutationState),
    openEditCategory: getOpenEditLimitHandler(state),
    saveCustomCategory: getSaveCustomCategoryHandler(params, setMutationState),
    saveCategory: getSaveLimitCategoryHandler(params, setMutationState),
    toggleEditMode: getToggleLimitEditModeHandler(state),
    toggleDeleteMode: () => {
      state.setEditMode(false);
      state.setDeleteMode(value => !value);
    },
    usePreviousMonth: getUsePreviousMonthHandler(params, state.limitState, setMutationState),
  };
}

function getSaveLimitParams(
  props: Pick<LimitDetailStateProps, 'month' | 'onChanged' | 'periodId'>,
  bumpCategoryRefreshKey: () => void,
  setLimitState: SetLimitState,
  setSnackbarMessage: (message: string) => void,
  setView: (view: LimitSheetView) => void,
): SaveLimitParams {
  return {
    bumpCategoryRefreshKey,
    month: props.month,
    onChanged: props.onChanged,
    periodId: props.periodId,
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
  setMutationState: (value: boolean, label: string) => void,
) {
  return async () => {
    setMutationState(true, 'Menyalin aturan bulan sebelumnya...');

    copyPreviousLimitDetails(
      params.month,
      params.periodId,
      limitState.previousMonth,
      params.setLimitState,
    )
      .then(() => handlePreviousLimitSuccess(
        params.onChanged,
        params.setSnackbarMessage,
      ))
      .catch(() => params.setSnackbarMessage(
        'Belum ada aturan bulan kemarin yang bisa dipakai.',
      ))
      .finally(() => setMutationState(false, ''));
  };
}

function handlePreviousLimitSuccess(
  onChanged: () => void,
  setSnackbarMessage: (message: string) => void,
) {
  setSnackbarMessage('');
  onChanged();
}

function getSaveLimitCategoryHandler(
  params: SaveLimitParams,
  setMutationState: (value: boolean, label: string) => void,
) {
  return (state: LimitCategoryFormState) => {
    setMutationState(true, 'Menyimpan batas kategori...');
    createLimitCategory(params.month, params.periodId, state)
      .then(limitState => handleCreateLimitSuccess(params, limitState))
      .catch(() => params.setSnackbarMessage('Batas kategori belum bisa disimpan.'))
      .finally(() => setMutationState(false, ''));
  };
}

function getEditLimitCategoryHandler(
  params: SaveLimitParams,
  setMutationState: (value: boolean, label: string) => void,
) {
  return (state: LimitEditFormState) => {
    setMutationState(true, 'Menyimpan perubahan batas...');
    updateLimitCategory(params.month, params.periodId, state)
      .then(limitState => handleUpdateLimitSuccess(params, limitState))
      .catch(() => params.setSnackbarMessage('Batas kategori belum bisa diperbarui.'))
      .finally(() => setMutationState(false, ''));
  };
}

function getSaveCustomCategoryHandler(
  params: SaveLimitParams,
  setMutationState: (value: boolean, label: string) => void,
) {
  return (state: CustomCategoryFormState) => {
    setMutationState(true, 'Menyimpan kategori baru...');
    createCustomCategory(state)
      .then(() => handleCreateCustomCategorySuccess(params))
      .catch(() => params.setSnackbarMessage('Kategori baru belum bisa disimpan.'))
      .finally(() => setMutationState(false, ''));
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

function getDeleteLimitCategoryHandler(
  params: SaveLimitParams,
  setMutationState: (value: boolean, label: string) => void,
) {
  return (budgetId: string) => {
    params.setLimitState(state => removeLimitDetailItem(state, budgetId));
    setMutationState(true, 'Menghapus batas kategori...');
    deleteLimitCategory(params.month, params.periodId, budgetId)
      .then(limitState => handleDeleteLimitSuccess(params, limitState))
      .catch(() => handleDeleteLimitError(params))
      .finally(() => setMutationState(false, ''));
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
  fetchLimitDetails(params.month, params.periodId)
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
  periodId: string | undefined,
  visible: boolean,
  setFetching: (value: boolean) => void,
  setLimitState: SetLimitState,
  setLoadingLabel: (value: string) => void,
) {
  useEffect(() => {
    if (visible) {
      setLoadingLabel('Memuat batas pengeluaran...');
      setFetching(true);
      fetchLimitDetails(month, periodId)
        .then(setLimitState)
        .catch(() => setLimitState({ items: [] }))
        .finally(() => setFetching(false));
    }
  }, [month, periodId, setFetching, setLimitState, setLoadingLabel, visible]);
}

function createLimitMutationStateSetter(
  setLoadingLabel: (value: string) => void,
  setMutationCount: (setter: (value: number) => number) => void,
) {
  return (value: boolean, label: string) => {
    if (value) {
      setLoadingLabel(label);
      setMutationCount(count => count + 1);

      return;
    }

    setMutationCount(count => Math.max(count - 1, 0));
  };
}

async function copyPreviousLimitDetails(
  month: string,
  periodId: string | undefined,
  previousMonth: BudgetPreviousMonth | undefined,
  setLimitState: SetLimitState,
) {
  const token = await getAuthToken();

  if (!token || !previousMonth?.available) {
    throw new Error('Previous month unavailable');
  }

  const response = await copyPreviousBudgets(token, {
    sourceMonth: previousMonth.month,
    sourcePeriodId: previousMonth.periodId,
    targetMonth: month,
    targetPeriodId: periodId,
  });
  setLimitState(mapBudgetsResponse(response.data));
}

async function createLimitCategory(
  month: string,
  periodId: string | undefined,
  state: LimitCategoryFormState,
) {
  const token = await getAuthToken();

  if (!token || !isLimitCategoryFormValid(state)) {
    throw new Error('Invalid limit category form');
  }

  await createBudget(token, getCreateBudgetPayload(month, periodId, state));

  return fetchLimitDetails(month, periodId);
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
  periodId: string | undefined,
  state: LimitEditFormState,
) {
  const token = await getAuthToken();

  if (!token || !isLimitEditFormValid(state)) {
    throw new Error('Invalid limit edit form');
  }

  await updateBudget(token, state.budgetId, {
    limitAmount: parseWalletBalance(state.limitAmount),
    month,
    periodId,
  });

  return fetchLimitDetails(month, periodId);
}

async function deleteLimitCategory(
  month: string,
  periodId: string | undefined,
  budgetId: string,
) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Missing auth token');
  }

  await deleteBudget(token, budgetId, month, periodId);

  return fetchLimitDetails(month, periodId);
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
  periodId: string | undefined,
  state: LimitCategoryFormState,
): CreateBudgetPayload {
  return {
    categoryId: state.selectedCategoryId,
    limitAmount: parseWalletBalance(state.limitAmount),
    month,
    periodId,
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

function LimitDetailSheetContent(
  props: LimitDetailSheetContentProps & {
    limitSheet: LimitSheetState;
  },
) {
  return renderLimitDetailSheetView(props, props.limitSheet);
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
      isBusy={params.limitSheet.isBusy}
      month={params.props.month}
      onClose={params.props.onClose}
      onCreateNewCategory={() => params.limitSheet.setView('category')}
      onGoBack={() => params.limitSheet.setView('list')}
      onHideSnackbar={params.limitSheet.hideSnackbar}
      onInfoMessage={params.limitSheet.showSnackbar}
      onSaveCategory={params.limitSheet.saveCategory}
      periodId={params.props.periodId}
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
      isBusy={params.limitSheet.isBusy}
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
      isBusy={params.limitSheet.isBusy}
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
      isBusy={params.limitSheet.isBusy}
      isDeleteMode={params.limitSheet.isDeleteMode}
      isEditMode={params.limitSheet.isEditMode}
      isFetching={params.limitSheet.isFetching}
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
  periodId?: string;
  visible: boolean;
}) {
  return <LimitDetailBottomSheetContent {...props} />;
}

function LimitDetailBottomSheetContent(props: {
  month: string;
  onChanged: () => void;
  onClose: () => void;
  periodId?: string;
  visible: boolean;
}) {
  const limitSheet = useLimitDetailState(props);

  return (
    <BottomSheet
      containerStyle={styles.limitDetailContainer}
      disableClose={limitSheet.isBusy}
      dragFromHandleOnly={isLimitDetailScrollView(limitSheet.view)}
      isLoading={limitSheet.isBusy}
      loadingLabel={limitSheet.loadingLabel}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => renderLimitDetailSheetNode(dragHandleProps, limitSheet, props)}
    </BottomSheet>
  );
}

function isLimitDetailScrollView(view: LimitSheetView) {
  return view === 'category' || view === 'create';
}

function renderLimitDetailSheetNode(
  dragHandleProps: BottomSheetDragHandleProps,
  limitSheet: LimitSheetState,
  props: {
    month: string;
    onChanged: () => void;
    onClose: () => void;
    periodId?: string;
    visible: boolean;
  },
) {
  return (
    <LimitDetailSheetContent
      dragHandleProps={dragHandleProps}
      limitSheet={limitSheet}
      month={props.month}
      onChanged={props.onChanged}
      onClose={props.onClose}
      periodId={props.periodId}
      visible={props.visible}
    />
  );
}


export {
  LimitDetailBottomSheet,
  SpendingLimitSection as DashboardSpendingLimit,
};
