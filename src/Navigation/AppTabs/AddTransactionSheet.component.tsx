import {
  type ComponentProps,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';
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
import { Snackbar } from '../../Components/Snackbar';
import {
  createTransaction,
  getCategories,
  getWallets,
  type Category,
  type CreateTransactionPayload,
  type TransactionType,
  type Wallet,
} from '../../Services';
import { getAuthToken } from '../../Utils/authStorage';

import styles from './AddTransactionSheet.styles';

const transactionTypes = ['Pengeluaran', 'Pemasukan', 'Pindah Dana'] as const;

type TransactionTab = (typeof transactionTypes)[number];
type SheetStep = 'confirm' | 'form';
type AddTransactionSheetProps = {
  onChanged?: () => void;
  onClose: () => void;
  visible: boolean;
};
type SheetState = {
  amount: string;
  categories: Category[];
  errorMessage: string;
  fromWalletId: string;
  note: string;
  selectedCategoryId: string;
  selectedWalletId: string;
  step: SheetStep;
  toWalletId: string;
  type: TransactionTab;
  wallets: Wallet[];
};
type SheetSetters = {
  setAmount: (value: string) => void;
  setErrorMessage: (value: string) => void;
  setFromWalletId: (value: string) => void;
  setNote: (value: string) => void;
  setSelectedCategoryId: (value: string) => void;
  setSelectedWalletId: (value: string) => void;
  setStep: (value: SheetStep) => void;
  setToWalletId: (value: string) => void;
  setType: (value: TransactionTab) => void;
};

function SheetHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onGoBack?: () => void;
  title: string;
}) {
  return (
    <>
      <View style={styles.dragHandleArea} {...props.dragHandleProps}>
        <View style={styles.handle} />
      </View>
      <View style={styles.header}>
        <BackButton onGoBack={props.onGoBack} />
        <View style={styles.headerTitleArea} {...props.dragHandleProps}>
          <Text style={styles.title}>{props.title}</Text>
        </View>
        <CloseButton onClose={props.onClose} />
      </View>
    </>
  );
}

function BackButton(props: { onGoBack?: () => void }) {
  if (!props.onGoBack) {
    return null;
  }

  return (
    <Pressable onPress={props.onGoBack} style={styles.backButton}>
      <Text style={styles.backText}>‹</Text>
    </Pressable>
  );
}

function CloseButton(props: { onClose: () => void }) {
  return (
    <Pressable onPress={props.onClose} style={styles.closeButton}>
      <Text style={styles.closeText}>×</Text>
    </Pressable>
  );
}

function TypeSegment(props: {
  activeType: TransactionTab;
  onChangeType: (type: TransactionTab) => void;
}) {
  return (
    <View style={styles.segment}>
      {transactionTypes.map(type => (
        <TypeSegmentButton
          isActive={props.activeType === type}
          key={type}
          onPress={() => props.onChangeType(type)}
          type={type}
        />
      ))}
    </View>
  );
}

function TypeSegmentButton(props: {
  isActive: boolean;
  onPress: () => void;
  type: TransactionTab;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.segmentButton, props.isActive && styles.segmentButtonActive]}
    >
      <Text style={[styles.segmentText, props.isActive && styles.segmentTextActive]}>
        {props.type}
      </Text>
    </Pressable>
  );
}

function AmountInput(props: {
  amount: string;
  onChangeAmount: (value: string) => void;
}) {
  return (
    <View style={styles.amountBox}>
      <Text style={styles.amountLabel}>Total Amount</Text>
      <View style={styles.amountRow}>
        <Text style={styles.inputPrefix}>Rp</Text>
        <TextInput
          keyboardType="number-pad"
          onChangeText={props.onChangeAmount}
          placeholder="0"
          style={styles.amountInput}
          value={props.amount}
        />
      </View>
    </View>
  );
}

function WalletFields(props: {
  selectedWalletId: string;
  setSelectedWalletId: (walletId: string) => void;
  wallets: Wallet[];
}) {
  return (
    <PickerSection title="Wallet">
      <WalletPicker
        selectedWalletId={props.selectedWalletId}
        setSelectedWalletId={props.setSelectedWalletId}
        wallets={props.wallets}
      />
    </PickerSection>
  );
}

function TransferFields(props: {
  fromWalletId: string;
  setFromWalletId: (walletId: string) => void;
  setToWalletId: (walletId: string) => void;
  toWalletId: string;
  wallets: Wallet[];
}) {
  return (
    <>
      {getTransferPickers(props).map(picker => (
        <TransferWalletPicker
          excludedWalletId={picker.excludedWalletId}
          key={picker.title}
          selectedWalletId={picker.selectedWalletId}
          setSelectedWalletId={picker.setSelectedWalletId}
          title={picker.title}
          wallets={props.wallets}
        />
      ))}
    </>
  );
}

function getTransferPickers(props: {
  fromWalletId: string;
  setFromWalletId: (walletId: string) => void;
  setToWalletId: (walletId: string) => void;
  toWalletId: string;
}) {
  return [
    {
      excludedWalletId: props.toWalletId,
      selectedWalletId: props.fromWalletId,
      setSelectedWalletId: props.setFromWalletId,
      title: 'From Wallet',
    },
    {
      excludedWalletId: props.fromWalletId,
      selectedWalletId: props.toWalletId,
      setSelectedWalletId: props.setToWalletId,
      title: 'To Wallet',
    },
  ] as const;
}

function TransferWalletPicker(
  props: ComponentProps<typeof WalletPicker> & { title: string },
) {
  return (
    <PickerSection title={props.title}>
      <WalletPicker {...props} />
    </PickerSection>
  );
}

function PickerSection(props: { children: ReactNode; title: string }) {
  return (
    <View style={styles.pickerSection}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      {props.children}
    </View>
  );
}

function WalletPicker(props: {
  excludedWalletId?: string;
  selectedWalletId: string;
  setSelectedWalletId: (walletId: string) => void;
  wallets: Wallet[];
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.choiceRow}>
        {props.wallets
          .filter(wallet => wallet.id !== props.excludedWalletId)
          .map(wallet => (
          <ChoiceChip
            isActive={props.selectedWalletId === wallet.id}
            key={wallet.id}
            label={wallet.name}
            onPress={() => props.setSelectedWalletId(wallet.id)}
          />
          ))}
      </View>
    </ScrollView>
  );
}

function CategoryPicker(props: {
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (categoryId: string) => void;
}) {
  return (
    <PickerSection title="Category">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          {props.categories.map(category => (
            <CategoryItem
              category={category}
              isActive={props.selectedCategoryId === category.id}
              key={category.id}
              onPress={() => props.setSelectedCategoryId(category.id)}
            />
          ))}
        </View>
      </ScrollView>
    </PickerSection>
  );
}

function CategoryItem(props: {
  category: Category;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={props.onPress} style={styles.categoryItem}>
      <CategoryIcon isActive={props.isActive} value={getCategoryIcon(props.category)} />
      <Text style={[styles.categoryLabel, props.isActive && styles.categoryLabelActive]}>
        {props.category.name}
      </Text>
    </Pressable>
  );
}

function CategoryIcon(props: { isActive: boolean; value: string }) {
  return (
    <View style={[styles.categoryCircle, props.isActive && styles.categoryCircleActive]}>
      <Text style={[styles.categoryIcon, props.isActive && styles.categoryIconActive]}>
        {props.value}
      </Text>
    </View>
  );
}

function ChoiceChip(props: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.choiceChip, props.isActive && styles.choiceChipActive]}
    >
      <Text style={[styles.choiceText, props.isActive && styles.choiceTextActive]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

function NotesField(props: {
  note: string;
  onChangeNote: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.notesSection}>
      <Text style={styles.sectionTitle}>Notes (Optional)</Text>
      <TextInput
        multiline
        onChangeText={props.onChangeNote}
        placeholder={props.placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.noteInput}
        value={props.note}
      />
    </View>
  );
}

function SheetBody(props: {
  setters: SheetSetters;
  state: SheetState;
}) {
  return props.state.step === 'confirm'
    ? <ConfirmationContent state={props.state} />
    : <FormContent setters={props.setters} state={props.state} />;
}

function FormContent(props: {
  setters: SheetSetters;
  state: SheetState;
}) {
  const isTransfer = props.state.type === 'Pindah Dana';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TypeSegment
        activeType={props.state.type}
        onChangeType={props.setters.setType}
      />
      <AmountInput
        amount={props.state.amount}
        onChangeAmount={props.setters.setAmount}
      />
      <TransactionControls isTransfer={isTransfer} {...props} />
      <NotesField
        note={props.state.note}
        onChangeNote={props.setters.setNote}
        placeholder={getNotePlaceholder(isTransfer)}
      />
    </ScrollView>
  );
}

function ConfirmationContent(props: { state: SheetState }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.confirmationCard}>
        <Text style={styles.confirmationEyebrow}>Summary</Text>
        <Text style={styles.confirmationTitle}>Cek lagi sebelum disimpan</Text>
        {getSummaryRows(props.state).map(item => (
          <SummaryRow key={item.label} label={item.label} value={item.value} />
        ))}
      </View>
    </ScrollView>
  );
}

function SummaryRow(props: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{props.label}</Text>
      <Text style={styles.summaryValue}>{props.value}</Text>
    </View>
  );
}

function TransactionControls(props: {
  isTransfer: boolean;
  setters: SheetSetters;
  state: SheetState;
}) {
  if (props.isTransfer) {
    return <TransferFields {...props.state} {...props.setters} />;
  }

  return (
    <>
      <WalletFields {...props.state} {...props.setters} />
      <CategoryPicker {...props.state} {...props.setters} />
    </>
  );
}

function SheetFooter(props: {
  buttonLabel: string;
  onSecondaryAction?: () => void;
  onSubmit: () => void;
  secondaryLabel?: string;
}) {
  return (
    <View style={styles.footer}>
      {!!props.onSecondaryAction && !!props.secondaryLabel && (
        <Pressable onPress={props.onSecondaryAction} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{props.secondaryLabel}</Text>
        </Pressable>
      )}
      <Pressable onPress={props.onSubmit} style={styles.saveButton}>
        <Text style={styles.saveText}>{props.buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

function AddTransactionSheet(props: AddTransactionSheetProps) {
  const sheet = useAddTransactionSheet(props);

  return (
    <BottomSheet
      containerStyle={styles.container}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <SheetLayout
          dragHandleProps={dragHandleProps}
          onClose={props.onClose}
          onHideSnackbar={() => sheet.setters.setErrorMessage('')}
          onReturnToForm={() => sheet.setters.setStep('form')}
          onSubmit={sheet.submit}
          snackbarMessage={sheet.snackbarMessage}
          state={sheet.state}
          setters={sheet.setters}
        />
      )}
    </BottomSheet>
  );
}

function SheetLayout(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onClose: () => void;
  onHideSnackbar: () => void;
  onReturnToForm: () => void;
  onSubmit: () => void;
  setters: SheetSetters;
  snackbarMessage: string;
  state: SheetState;
}) {
  const isConfirmStep = props.state.step === 'confirm';
  const headerProps = getSheetHeaderSectionProps(props, isConfirmStep);
  const contentProps = getSheetContentSectionProps(props, isConfirmStep);

  return (
    <>
      <SheetHeaderSection {...headerProps} />
      <SheetContentSection {...contentProps} />
    </>
  );
}

function SheetContentSection(props: {
  isConfirmStep: boolean;
  onHideSnackbar: () => void;
  onReturnToForm: () => void;
  onSubmit: () => void;
  setters: SheetSetters;
  snackbarMessage: string;
  state: SheetState;
}) {
  return (
    <>
      <Snackbar
        message={props.snackbarMessage}
        onHide={props.onHideSnackbar}
      />
      <SheetBody setters={props.setters} state={props.state} />
      <SheetFooterSection
        isConfirmStep={props.isConfirmStep}
        onReturnToForm={props.onReturnToForm}
        onSubmit={props.onSubmit}
      />
    </>
  );
}

function getSheetHeaderSectionProps(
  props: {
    dragHandleProps: BottomSheetDragHandleProps;
    onClose: () => void;
    onReturnToForm: () => void;
  },
  isConfirmStep: boolean,
) {
  return {
    dragHandleProps: props.dragHandleProps,
    isConfirmStep,
    onClose: props.onClose,
    onReturnToForm: props.onReturnToForm,
  };
}

function getSheetContentSectionProps(
  props: {
    onHideSnackbar: () => void;
    onReturnToForm: () => void;
    onSubmit: () => void;
    setters: SheetSetters;
    snackbarMessage: string;
    state: SheetState;
  },
  isConfirmStep: boolean,
) {
  return {
    isConfirmStep,
    onHideSnackbar: props.onHideSnackbar,
    onReturnToForm: props.onReturnToForm,
    onSubmit: props.onSubmit,
    setters: props.setters,
    snackbarMessage: props.snackbarMessage,
    state: props.state,
  };
}

function SheetHeaderSection(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isConfirmStep: boolean;
  onClose: () => void;
  onReturnToForm: () => void;
}) {
  return (
    <SheetHeader
      dragHandleProps={props.dragHandleProps}
      onClose={props.onClose}
      onGoBack={props.isConfirmStep ? props.onReturnToForm : undefined}
      title={props.isConfirmStep ? 'Confirm Transaction' : 'Add Transaction'}
    />
  );
}

function SheetFooterSection(props: {
  isConfirmStep: boolean;
  onReturnToForm: () => void;
  onSubmit: () => void;
}) {
  return (
    <SheetFooter
      buttonLabel={props.isConfirmStep ? 'Simpan  ✓' : 'Next'}
      onSecondaryAction={props.isConfirmStep ? props.onReturnToForm : undefined}
      onSubmit={props.onSubmit}
      secondaryLabel={props.isConfirmStep ? 'Kembali' : undefined}
    />
  );
}

function useAddTransactionSheet(props: AddTransactionSheetProps) {
  const [state, setState] = useState(getInitialState());
  const setters = getSheetSetters(setState);
  const hydratedState = getHydratedState(state);

  useSheetOptions(props.visible, state.type, setState);
  useResetSheetStateOnClose(props.visible, setState);

  return {
    setters,
    snackbarMessage: state.errorMessage,
    state: hydratedState,
    submit: () => handlePrimaryAction(hydratedState, props, setState),
  };
}

function useSheetOptions(
  visible: boolean,
  type: TransactionTab,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  useEffect(() => {
    if (visible) {
      loadSheetOptions(setState, type);
    }
  }, [setState, type, visible]);
}

function useResetSheetStateOnClose(
  visible: boolean,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  useEffect(() => {
    if (!visible) {
      setState(getInitialState());
    }
  }, [setState, visible]);
}

function getInitialState(): SheetState {
  return {
    amount: '',
    categories: [],
    errorMessage: '',
    fromWalletId: '',
    note: '',
    selectedCategoryId: '',
    selectedWalletId: '',
    step: 'form',
    toWalletId: '',
    type: 'Pengeluaran',
    wallets: [],
  };
}

function getSheetSetters(setState: Dispatch<SetStateAction<SheetState>>) {
  return {
    setAmount: (amount: string) => setState(value => ({ ...value, amount: formatMoneyInput(amount) })),
    setErrorMessage: (errorMessage: string) => setState(value => ({ ...value, errorMessage })),
    setFromWalletId: (fromWalletId: string) => setState(value => ({ ...value, fromWalletId })),
    setNote: (note: string) => setState(value => ({ ...value, note })),
    setSelectedCategoryId: (selectedCategoryId: string) => setState(value => ({ ...value, selectedCategoryId })),
    setSelectedWalletId: (selectedWalletId: string) => setState(value => ({ ...value, selectedWalletId })),
    setStep: (step: SheetStep) => setState(value => ({ ...value, step })),
    setToWalletId: (toWalletId: string) => setState(value => ({ ...value, toWalletId })),
    setType: (type: TransactionTab) => setState(value => ({
      ...value,
      selectedCategoryId: '',
      step: 'form',
      type,
    })),
  };
}

function getHydratedState(state: SheetState): SheetState {
  const fallbackWalletId = state.selectedWalletId || state.wallets[0]?.id || '';
  const fallbackFromWalletId = state.fromWalletId || state.wallets[0]?.id || '';

  return {
    ...state,
    fromWalletId: fallbackFromWalletId,
    selectedCategoryId: state.selectedCategoryId || state.categories[0]?.id || '',
    selectedWalletId: fallbackWalletId,
    toWalletId: getEffectiveToWalletId({
      ...state,
      fromWalletId: fallbackFromWalletId,
    }),
  };
}

function getEffectiveToWalletId(state: SheetState) {
  const fallback = state.wallets.find(wallet => wallet.id !== state.fromWalletId);

  if (state.toWalletId && state.toWalletId !== state.fromWalletId) {
    return state.toWalletId;
  }

  return fallback?.id || state.wallets[1]?.id || '';
}

async function loadSheetOptions(
  setState: Dispatch<SetStateAction<SheetState>>,
  type: TransactionTab,
) {
  const token = await getAuthToken();

  if (!token) {
    return;
  }

  const [wallets, categories] = await Promise.all([
    getWallets(token),
    getCategories(token, { type: getCategoryType(type) }),
  ]);

  setState(value => ({
    ...value,
    categories: categories.data,
    wallets: wallets.data,
  }));
}

function handlePrimaryAction(
  state: SheetState,
  props: AddTransactionSheetProps,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  if (!canSubmitTransaction(state, setState)) {
    return;
  }

  if (state.step === 'form') {
    setState(value => ({ ...value, step: 'confirm' }));

    return;
  }

  submitTransaction(state, props, setState).catch(() => undefined);
}

async function submitTransaction(
  state: SheetState,
  props: AddTransactionSheetProps,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  if (!canSubmitTransaction(state, setState)) {
    return;
  }

  try {
    await submitTransactionRequest(state);
    setState(getInitialState());
    props.onChanged?.();
    props.onClose();
  } catch (error) {
    showSheetError(
      setState,
      error instanceof Error ? error.message : 'Transaksi gagal disimpan.',
    );
  }
}

function canSubmitTransaction(
  state: SheetState,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  const validationMessage = getValidationMessage(state);

  if (!validationMessage) {
    return true;
  }

  showSheetError(setState, validationMessage);

  return false;
}

async function submitTransactionRequest(state: SheetState) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Sesi login kamu belum tersedia.');
  }

  return createTransaction(token, getTransactionPayload(state));
}

function getTransactionPayload(state: SheetState): CreateTransactionPayload {
  if (state.type === 'Pindah Dana') {
    return getTransferPayload(state);
  }

  return getIncomeExpensePayload(state);
}

function getIncomeExpensePayload(state: SheetState): CreateTransactionPayload {
  return {
    amount: parseMoneyInput(state.amount),
    categoryId: state.selectedCategoryId,
    note: normalizeNote(state.note),
    title: getSelectedCategory(state)?.name ?? state.type,
    type: getApiTransactionType(state.type),
    walletId: state.selectedWalletId,
  };
}

function getTransferPayload(state: SheetState): CreateTransactionPayload {
  return {
    amount: parseMoneyInput(state.amount),
    fromWalletId: state.fromWalletId,
    note: normalizeNote(state.note),
    title: 'Pindah Dana',
    toWalletId: state.toWalletId,
    type: 'TRANSFER',
  };
}

function getApiTransactionType(type: TransactionTab): TransactionType {
  return type === 'Pemasukan' ? 'INCOME' : 'EXPENSE';
}

function getCategoryType(type: TransactionTab) {
  return type === 'Pemasukan' ? 'INCOME' : 'EXPENSE';
}

function getSelectedCategory(state: SheetState) {
  return state.categories.find(category => category.id === state.selectedCategoryId);
}

function getCategoryIcon(category: Category) {
  const iconMap: Record<string, string> = {
    restaurant: '▮▮',
    shopping_bag: '▢',
    two_wheeler: '⌘',
  };

  return iconMap[category.icon] ?? '☆';
}

function getNotePlaceholder(isTransfer: boolean) {
  return isTransfer
    ? 'What is this transfer for? e.g., Monthly saving...'
    : 'What did you buy? e.g., Sushi date...';
}

function formatMoneyInput(value: string) {
  const amount = parseMoneyInput(value);

  return amount ? new Intl.NumberFormat('id-ID').format(amount) : '';
}

function parseMoneyInput(value: string) {
  return Number(value.replace(/\D/g, ''));
}

function normalizeNote(note: string) {
  const trimmedNote = note.trim();

  return trimmedNote ? trimmedNote : undefined;
}

function getValidationMessage(state: SheetState) {
  const baseMessage = getBaseValidationMessage(state);

  if (baseMessage) {
    return baseMessage;
  }

  return state.type === 'Pindah Dana'
    ? getTransferValidationMessage(state)
    : getStandardValidationMessage(state);
}

function getBaseValidationMessage(state: SheetState) {
  if (!parseMoneyInput(state.amount)) {
    return 'Masukkan nominal transaksi dulu ya.';
  }

  return '';
}

function getTransferValidationMessage(state: SheetState) {
  const amount = parseMoneyInput(state.amount);
  const fromWalletBalance = getWalletBalance(state.wallets, state.fromWalletId);
  const baseTransferMessage = getBaseTransferValidationMessage(state);

  if (baseTransferMessage) {
    return baseTransferMessage;
  }

  if (fromWalletBalance < 1) {
    return 'Saldo dompet asal belum cukup untuk pindah dana.';
  }

  if (amount > fromWalletBalance) {
    return 'Nominal pindah dana melebihi saldo dompet asal.';
  }

  return '';
}

function getBaseTransferValidationMessage(state: SheetState) {
  if (state.wallets.length < 2) {
    return 'Pindah dana butuh minimal 2 dompet aktif.';
  }

  if (!state.fromWalletId || !state.toWalletId) {
    return 'Pilih dompet asal dan tujuan dulu ya.';
  }

  if (state.fromWalletId === state.toWalletId) {
    return 'Dompet asal dan tujuan tidak boleh sama.';
  }

  return '';
}

function getStandardValidationMessage(state: SheetState) {
  const selectedWalletBalance = getWalletBalance(
    state.wallets,
    state.selectedWalletId,
  );
  const amount = parseMoneyInput(state.amount);

  if (!state.wallets.length || !state.selectedWalletId) {
    return 'Tambahkan dompet dulu sebelum membuat transaksi.';
  }

  if (!state.selectedCategoryId) {
    return 'Pilih kategori transaksi dulu ya.';
  }

  if (state.type === 'Pengeluaran' && selectedWalletBalance < 1) {
    return 'Saldo dompet ini kosong, jadi belum bisa dipakai untuk pengeluaran.';
  }

  if (state.type === 'Pengeluaran' && amount > selectedWalletBalance) {
    return 'Nominal pengeluaran melebihi saldo dompet yang dipilih.';
  }

  return '';
}

function showSheetError(
  setState: Dispatch<SetStateAction<SheetState>>,
  errorMessage: string,
) {
  setState(value => ({ ...value, errorMessage }));
}

function getWalletBalance(wallets: Wallet[], walletId: string) {
  return wallets.find(wallet => wallet.id === walletId)?.balance ?? 0;
}

function getSummaryRows(state: SheetState) {
  const amountValue = `Rp ${formatMoneyInput(state.amount || '0') || '0'}`;
  const sharedRows = [
    { label: 'Tipe', value: state.type },
    { label: 'Nominal', value: amountValue },
  ];

  if (state.type === 'Pindah Dana') {
    return [
      ...sharedRows,
      { label: 'Dari', value: getWalletName(state.wallets, state.fromWalletId) },
      { label: 'Ke', value: getWalletName(state.wallets, state.toWalletId) },
      { label: 'Catatan', value: normalizeSummaryValue(state.note) },
    ];
  }

  return [
    ...sharedRows,
    { label: 'Wallet', value: getWalletName(state.wallets, state.selectedWalletId) },
    { label: 'Kategori', value: getSelectedCategory(state)?.name ?? '-' },
    { label: 'Catatan', value: normalizeSummaryValue(state.note) },
  ];
}

function getWalletName(wallets: Wallet[], walletId: string) {
  return wallets.find(wallet => wallet.id === walletId)?.name ?? '-';
}

function normalizeSummaryValue(value: string) {
  const trimmed = value.trim();

  return trimmed || '-';
}

export default AddTransactionSheet;
