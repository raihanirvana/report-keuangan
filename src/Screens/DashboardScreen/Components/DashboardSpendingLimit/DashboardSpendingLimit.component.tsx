import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../../../Components/BottomSheet';
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
import {
  categoryColorPresets,
  categoryIconPresets,
} from '../../DashboardScreen.data';
import styles from '../../DashboardScreen.styles';
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

async function fetchDashboardSummary(month: string) {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const response = await getDashboardSummary(token, month);

  return response.data;
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


export {
  LimitDetailBottomSheet,
  SpendingLimitSection as DashboardSpendingLimit,
};
