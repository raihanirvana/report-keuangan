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
import CategoryCreateContent, {
  categoryColorPresets,
  categoryIconPresets,
} from '../../Components/CategoryCreateContent';
import { Snackbar } from '../../Components/Snackbar';
import {
  createCategory,
  createTransaction,
  deleteTransaction,
  getCategories,
  getWallets,
  updateTransaction,
  type Category,
  type CreateTransactionPayload,
  type Transaction,
  type TransactionType,
  type Wallet,
} from '../../Services';
import { getAuthToken } from '../../Utils/authStorage';
import { getCategoryIconValue } from '../../Utils/categoryIcons';

import styles from './AddTransactionSheet.styles';
import type {
  AddTransactionSheetProps,
  SheetSetters,
  SheetState,
  SheetStep,
  TransactionTab,
} from './AddTransactionSheet.types';

const transactionTypes = ['Pengeluaran', 'Pemasukan', 'Pindah Dana'] as const;

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
  onCreateCategory: () => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (categoryId: string) => void;
}) {
  return (
    <View style={styles.pickerSection}>
      <CategoryPickerHeader onCreateCategory={props.onCreateCategory} />
      <CategoryPickerList {...props} />
    </View>
  );
}

function CategoryPickerHeader(props: { onCreateCategory: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Category</Text>
      <Pressable onPress={props.onCreateCategory}>
        <Text style={styles.sectionLink}>Tambah</Text>
      </Pressable>
    </View>
  );
}

function CategoryPickerList(props: {
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (categoryId: string) => void;
}) {
  return (
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

function CustomCategoryContent(props: {
  setters: SheetSetters;
  state: SheetState;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <CategoryCreateContent
        color={props.state.customCategoryColor}
        icon={props.state.customCategoryIcon}
        name={props.state.customCategoryName}
        onChangeColor={props.setters.setCustomCategoryColor}
        onChangeIcon={props.setters.setCustomCategoryIcon}
        onChangeName={props.setters.setCustomCategoryName}
      />
    </ScrollView>
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

function TitleField(props: {
  onChangeTitle: (value: string) => void;
  title: string;
}) {
  return (
    <View style={styles.notesSection}>
      <Text style={styles.sectionTitle}>Judul (Optional)</Text>
      <TextInput
        onChangeText={props.onChangeTitle}
        placeholder="Contoh: Makan siang, Gaji, Nabung..."
        placeholderTextColor="#94A3B8"
        style={styles.titleInput}
        value={props.title}
      />
    </View>
  );
}

function DateField(props: {
  date: string;
  onChangeDate: (value: string) => void;
}) {
  const datePicker = useDatePickerField(props);

  return (
    <View style={styles.notesSection}>
      <Text style={styles.sectionTitle}>Tanggal</Text>
      <DateButton
        date={props.date}
        isOpen={datePicker.isOpen}
        onPress={datePicker.toggleOpen}
      />
      <DatePickerPanel {...datePicker.panelProps} />
    </View>
  );
}

function useDatePickerField(props: {
  date: string;
  onChangeDate: (value: string) => void;
}) {
  const [isOpen, setOpen] = useState(false);
  const [monthDate, setMonthDate] = useState(() => parseDateInput(props.date));

  return {
    isOpen,
    panelProps: {
      isOpen,
      monthDate,
      onChangeMonth: setMonthDate,
      selectedDate: props.date,
      onSelectDate: getDateSelectHandler(props.onChangeDate, setOpen),
    },
    toggleOpen: () => setOpen(value => !value),
  };
}

function getDateSelectHandler(
  onChangeDate: (value: string) => void,
  setOpen: (value: boolean) => void,
) {
  return (date: Date) => {
    onChangeDate(formatDateParts(date));
    setOpen(false);
  };
}

function DateButton(props: {
  date: string;
  isOpen: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={props.onPress} style={styles.dateButton}>
      <Text style={styles.dateButtonText}>{props.date}</Text>
      <Text style={styles.dateButtonIcon}>{props.isOpen ? '⌃' : '⌄'}</Text>
    </Pressable>
  );
}

function DatePickerPanel(props: {
  isOpen: boolean;
  monthDate: Date;
  onChangeMonth: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  selectedDate: string;
}) {
  if (!props.isOpen) {
    return null;
  }

  const dates = getCalendarDates(props.monthDate);

  return (
    <View style={styles.datePickerPanel}>
      <DatePickerHeader monthDate={props.monthDate} onChangeMonth={props.onChangeMonth} />
      <DatePickerWeekDays />
      <DatePickerDays dates={dates} {...props} />
    </View>
  );
}

function DatePickerDays(props: {
  dates: Date[];
  monthDate: Date;
  onSelectDate: (date: Date) => void;
  selectedDate: string;
}) {
  return (
    <View style={styles.dateGrid}>
      {props.dates.map(date => (
        <DatePickerDay
          key={date.toISOString()}
          {...getDatePickerDayProps(date, props)}
          onPress={() => props.onSelectDate(date)}
        />
      ))}
    </View>
  );
}

function getDatePickerDayProps(
  date: Date,
  props: { monthDate: Date; selectedDate: string },
) {
  return {
    date,
    isCurrentMonth: isSameMonth(date, props.monthDate),
    isSelected: formatDateParts(date) === props.selectedDate,
  };
}

function DatePickerHeader(props: {
  monthDate: Date;
  onChangeMonth: (date: Date) => void;
}) {
  return (
    <View style={styles.datePickerHeader}>
      <DatePickerNavButton label="‹" onPress={() => props.onChangeMonth(shiftMonth(props.monthDate, -1))} />
      <Text style={styles.datePickerTitle}>{formatMonthTitle(props.monthDate)}</Text>
      <DatePickerNavButton label="›" onPress={() => props.onChangeMonth(shiftMonth(props.monthDate, 1))} />
    </View>
  );
}

function DatePickerNavButton(props: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={props.onPress} style={styles.datePickerNavButton}>
      <Text style={styles.datePickerNavText}>{props.label}</Text>
    </Pressable>
  );
}

function DatePickerWeekDays() {
  return (
    <View style={styles.dateWeekRow}>
      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
        <Text key={day} style={styles.dateWeekText}>{day}</Text>
      ))}
    </View>
  );
}

function DatePickerDay(props: {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.dateDayButton, props.isSelected && styles.dateDayButtonActive]}
    >
      <Text
        style={[
          styles.dateDayText,
          !props.isCurrentMonth && styles.dateDayTextMuted,
          props.isSelected && styles.dateDayTextActive,
        ]}
      >
        {props.date.getDate()}
      </Text>
    </Pressable>
  );
}

function SheetBody(props: {
  setters: SheetSetters;
  state: SheetState;
}) {
  if (props.state.step === 'categoryCreate') {
    return <CustomCategoryContent setters={props.setters} state={props.state} />;
  }

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
      <TransactionFormFields isTransfer={isTransfer} {...props} />
    </ScrollView>
  );
}

function TransactionFormFields(props: {
  isTransfer: boolean;
  setters: SheetSetters;
  state: SheetState;
}) {
  return (
    <>
      <AmountInput
        amount={props.state.amount}
        onChangeAmount={props.setters.setAmount}
      />
      <TransactionControls {...props} />
      <TransactionMetaFields {...props} />
    </>
  );
}

function TransactionMetaFields(props: {
  isTransfer: boolean;
  setters: SheetSetters;
  state: SheetState;
}) {
  return (
    <>
      <DateField date={props.state.occurredDate} onChangeDate={props.setters.setOccurredDate} />
      <TitleField onChangeTitle={props.setters.setTitle} title={props.state.title} />
      <NotesField
        note={props.state.note}
        onChangeNote={props.setters.setNote}
        placeholder={getNotePlaceholder(props.isTransfer)}
      />
    </>
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
      <CategoryPicker
        {...props.state}
        {...props.setters}
        onCreateCategory={() => props.setters.setStep('categoryCreate')}
      />
    </>
  );
}

function SheetFooter(props: {
  buttonLabel: string;
  destructiveLabel?: string;
  onDestructiveAction?: () => void;
  onSecondaryAction?: () => void;
  onSubmit: () => void;
  secondaryLabel?: string;
}) {
  return (
    <View style={styles.footer}>
      <DeleteFooterButton
        label={props.destructiveLabel}
        onPress={props.onDestructiveAction}
      />
      <SecondaryFooterButton
        label={props.secondaryLabel}
        onPress={props.onSecondaryAction}
      />
      <PrimaryFooterButton label={props.buttonLabel} onPress={props.onSubmit} />
    </View>
  );
}

function DeleteFooterButton(props: { label?: string; onPress?: () => void }) {
  if (!props.label || !props.onPress) {
    return null;
  }

  return (
    <Pressable onPress={props.onPress} style={styles.deleteButton}>
      <Text style={styles.deleteButtonText}>{props.label}</Text>
    </Pressable>
  );
}

function SecondaryFooterButton(props: { label?: string; onPress?: () => void }) {
  if (!props.label || !props.onPress) {
    return null;
  }

  return (
    <Pressable onPress={props.onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{props.label}</Text>
    </Pressable>
  );
}

function PrimaryFooterButton(props: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.saveButton}>
      <Text style={styles.saveText}>{props.label}</Text>
    </Pressable>
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
      {({ dragHandleProps }) => renderSheetLayout(props, sheet, dragHandleProps)}
    </BottomSheet>
  );
}

function renderSheetLayout(
  props: AddTransactionSheetProps,
  sheet: ReturnType<typeof useAddTransactionSheet>,
  dragHandleProps: BottomSheetDragHandleProps,
) {
  return (
    <SheetLayout
      dragHandleProps={dragHandleProps}
      isEditMode={Boolean(props.transaction)}
      onClose={props.onClose}
      onDelete={sheet.deleteTransaction}
      onHideSnackbar={() => sheet.setters.setErrorMessage('')}
      onReturnToForm={() => sheet.setters.setStep('form')}
      onSubmit={sheet.submit}
      snackbarMessage={sheet.snackbarMessage}
      state={sheet.state}
      setters={sheet.setters}
    />
  );
}

function SheetLayout(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isEditMode: boolean;
  onClose: () => void;
  onDelete: () => void;
  onHideSnackbar: () => void;
  onReturnToForm: () => void;
  onSubmit: () => void;
  setters: SheetSetters;
  snackbarMessage: string;
  state: SheetState;
}) {
  const isConfirmStep = props.state.step === 'confirm';
  const isCategoryCreateStep = props.state.step === 'categoryCreate';
  const headerProps = getSheetHeaderSectionProps(props, isConfirmStep);
  const contentProps = getSheetContentSectionProps(props, isConfirmStep);

  return (
    <>
      <SheetHeaderSection {...headerProps} isCategoryCreateStep={isCategoryCreateStep} />
      <SheetContentSection {...contentProps} />
    </>
  );
}

function SheetContentSection(props: {
  isConfirmStep: boolean;
  isEditMode: boolean;
  onDelete: () => void;
  onHideSnackbar: () => void;
  onReturnToForm: () => void;
  onSubmit: () => void;
  setters: SheetSetters;
  snackbarMessage: string;
  state: SheetState;
}) {
  return (
    <>
      <Snackbar message={props.snackbarMessage} onHide={props.onHideSnackbar} />
      <SheetBody setters={props.setters} state={props.state} />
      <SheetFooterSection {...getSheetFooterSectionProps(props)} />
    </>
  );
}

function getSheetFooterSectionProps(props: {
  isConfirmStep: boolean;
  isEditMode: boolean;
  onDelete: () => void;
  onReturnToForm: () => void;
  onSubmit: () => void;
  state: SheetState;
}) {
  return {
    isConfirmStep: props.isConfirmStep,
    isEditMode: props.isEditMode,
    onDelete: props.onDelete,
    onReturnToForm: props.onReturnToForm,
    onSubmit: props.onSubmit,
    state: props.state,
  };
}

function getSheetHeaderSectionProps(
  props: {
    dragHandleProps: BottomSheetDragHandleProps;
    isEditMode: boolean;
    onClose: () => void;
    onReturnToForm: () => void;
  },
  isConfirmStep: boolean,
) {
  return {
    dragHandleProps: props.dragHandleProps,
    isConfirmStep,
    isEditMode: props.isEditMode,
    onClose: props.onClose,
    onReturnToForm: props.onReturnToForm,
  };
}

function getSheetContentSectionProps(
  props: {
    isEditMode: boolean;
    onDelete: () => void;
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
    isEditMode: props.isEditMode,
    onDelete: props.onDelete,
    onReturnToForm: props.onReturnToForm,
    onSubmit: props.onSubmit,
    setters: props.setters,
    snackbarMessage: props.snackbarMessage,
    state: props.state,
  };
}

function SheetHeaderSection(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isCategoryCreateStep: boolean;
  isConfirmStep: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onReturnToForm: () => void;
}) {
  return (
    <SheetHeader
      dragHandleProps={props.dragHandleProps}
      onClose={props.onClose}
      onGoBack={
        props.isConfirmStep || props.isCategoryCreateStep
          ? props.onReturnToForm
          : undefined
      }
      title={getSheetTitle({
        isCategoryCreateStep: props.isCategoryCreateStep,
        isConfirmStep: props.isConfirmStep,
        isEditMode: props.isEditMode,
      })}
    />
  );
}

function getSheetTitle(params: {
  isCategoryCreateStep: boolean;
  isConfirmStep: boolean;
  isEditMode: boolean;
}) {
  if (params.isCategoryCreateStep) {
    return 'Tambah Kategori';
  }

  if (params.isConfirmStep) {
    return params.isEditMode ? 'Confirm Update' : 'Confirm Transaction';
  }

  return params.isEditMode ? 'Edit Transaction' : 'Add Transaction';
}

function SheetFooterSection(props: {
  isEditMode: boolean;
  isConfirmStep: boolean;
  state: SheetState;
  onDelete: () => void;
  onReturnToForm: () => void;
  onSubmit: () => void;
}) {
  const actionProps = getFooterActionProps(props);

  return (
    <SheetFooter
      buttonLabel={getFooterButtonLabel(props)}
      destructiveLabel={getDeleteButtonLabel(props)}
      onDestructiveAction={actionProps.onDestructiveAction}
      onSecondaryAction={actionProps.onSecondaryAction}
      onSubmit={props.onSubmit}
      secondaryLabel={actionProps.secondaryLabel}
    />
  );
}

function getFooterActionProps(props: {
  isEditMode: boolean;
  isConfirmStep: boolean;
  state: SheetState;
  onDelete: () => void;
  onReturnToForm: () => void;
}) {
  const canGoBack = props.isConfirmStep || props.state.step === 'categoryCreate';
  const canDelete = props.isEditMode && !props.isConfirmStep
    && props.state.step !== 'categoryCreate';

  return {
    onDestructiveAction: canDelete ? props.onDelete : undefined,
    onSecondaryAction: canGoBack ? props.onReturnToForm : undefined,
    secondaryLabel: canGoBack ? 'Kembali' : undefined,
  };
}

function getFooterButtonLabel(props: {
  isConfirmStep: boolean;
  state?: SheetState;
}) {
  if (props.state?.step === 'categoryCreate') {
    return 'Simpan Kategori';
  }

  return props.isConfirmStep ? 'Simpan  ✓' : 'Next';
}

function getDeleteButtonLabel(props: {
  isEditMode: boolean;
  isConfirmStep: boolean;
  state: SheetState;
}) {
  return props.isEditMode && !props.isConfirmStep && props.state.step !== 'categoryCreate'
    ? 'Hapus Transaksi'
    : undefined;
}

function useAddTransactionSheet(props: AddTransactionSheetProps) {
  const [state, setState] = useState(() => getInitialState(props.transaction));
  const setters = getSheetSetters(setState);
  const hydratedState = getHydratedState(state);

  useSheetOptions(props.visible, state.type, props.transaction, setState);
  useInitializeSheetOnOpen(props.visible, props.transaction, setState);
  useResetSheetStateOnClose(props.visible, props.transaction, setState);

  return {
    deleteTransaction: () => deleteCurrentTransaction(props, setState),
    setters,
    snackbarMessage: state.errorMessage,
    state: hydratedState,
    submit: () => handlePrimaryAction(hydratedState, props, setState),
  };
}

async function deleteCurrentTransaction(
  props: AddTransactionSheetProps,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  if (!props.transaction) {
    return;
  }

  try {
    await deleteTransactionRequest(props.transaction.id);
    setState(getInitialState(null));
    props.onChanged?.();
    props.onClose();
  } catch (error) {
    showSheetError(
      setState,
      error instanceof Error ? error.message : 'Transaksi belum bisa dihapus.',
    );
  }
}

async function deleteTransactionRequest(transactionId: string) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Sesi login kamu belum tersedia.');
  }

  await deleteTransaction(token, transactionId);
}

function useInitializeSheetOnOpen(
  visible: boolean,
  transaction: Transaction | null | undefined,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  useEffect(() => {
    if (visible) {
      setState(value => ({
        ...getInitialState(transaction),
        categories: value.categories,
        wallets: value.wallets,
      }));
    }
  }, [setState, transaction?.id, visible]);
}

function useSheetOptions(
  visible: boolean,
  type: TransactionTab,
  transaction: Transaction | null | undefined,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  useEffect(() => {
    if (visible) {
      loadSheetOptions(setState, type, transaction);
    }
  }, [setState, transaction, type, visible]);
}

function useResetSheetStateOnClose(
  visible: boolean,
  transaction: Transaction | null | undefined,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  useEffect(() => {
    if (!visible) {
      setState(getInitialState(transaction));
    }
  }, [setState, transaction, visible]);
}

function getInitialState(transaction?: Transaction | null): SheetState {
  return {
    amount: transaction ? formatMoneyInput(String(transaction.amount)) : '',
    categories: [],
    customCategoryColor: categoryColorPresets[0],
    customCategoryIcon: categoryIconPresets[0].icon,
    customCategoryName: '',
    errorMessage: '',
    fromWalletId: '',
    note: transaction?.note ?? '',
    occurredDate: formatDateForInput(transaction?.occurredAt),
    selectedCategoryId: transaction?.category?.id ?? '',
    selectedWalletId: '',
    step: 'form',
    title: transaction?.title ?? '',
    toWalletId: '',
    type: getTransactionTab(transaction),
    wallets: [],
  };
}

function getTransactionTab(transaction?: Transaction | null): TransactionTab {
  if (transaction?.type === 'INCOME') {
    return 'Pemasukan';
  }

  if (transaction?.type === 'TRANSFER') {
    return 'Pindah Dana';
  }

  return 'Pengeluaran';
}

function getSheetSetters(setState: Dispatch<SetStateAction<SheetState>>) {
  return {
    setAmount: (amount: string) => setState(value => ({ ...value, amount: formatMoneyInput(amount) })),
    setCustomCategoryColor: (customCategoryColor: string) => setState(value => ({ ...value, customCategoryColor })),
    setCustomCategoryIcon: (customCategoryIcon: string) => setState(value => ({ ...value, customCategoryIcon })),
    setCustomCategoryName: (customCategoryName: string) => setState(value => ({ ...value, customCategoryName })),
    setErrorMessage: (errorMessage: string) => setState(value => ({ ...value, errorMessage })),
    setFromWalletId: (fromWalletId: string) => setState(value => ({ ...value, fromWalletId })),
    setNote: (note: string) => setState(value => ({ ...value, note })),
    setOccurredDate: (occurredDate: string) => setState(value => ({ ...value, occurredDate })),
    setSelectedCategoryId: (selectedCategoryId: string) => setState(value => ({ ...value, selectedCategoryId })),
    setSelectedWalletId: (selectedWalletId: string) => setState(value => ({ ...value, selectedWalletId })),
    setStep: (step: SheetStep) => setState(value => ({ ...value, step })),
    setTitle: (title: string) => setState(value => ({ ...value, title })),
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
  transaction?: Transaction | null,
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
    ...getTransactionSelectionDefaults(transaction, wallets.data, categories.data),
    wallets: wallets.data,
  }));
}

function getTransactionSelectionDefaults(
  transaction: Transaction | null | undefined,
  wallets: Wallet[],
  categories: Category[],
) {
  if (!transaction) {
    return {};
  }

  return {
    fromWalletId: findWalletIdByName(wallets, transaction.fromWallet?.name),
    selectedCategoryId:
      categories.find(category => category.id === transaction.category?.id)?.id
      ?? categories[0]?.id
      ?? '',
    selectedWalletId: findWalletIdByName(wallets, transaction.wallet?.name),
    toWalletId: findWalletIdByName(wallets, transaction.toWallet?.name),
  };
}

function findWalletIdByName(wallets: Wallet[], walletName?: string) {
  return wallets.find(wallet => wallet.name === walletName)?.id ?? '';
}

function handlePrimaryAction(
  state: SheetState,
  props: AddTransactionSheetProps,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  if (state.step === 'categoryCreate') {
    submitCustomCategory(state, setState).catch(() => undefined);

    return;
  }

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
    await submitTransactionRequest(state, props.transaction);
    setState(getInitialState(props.transaction));
    props.onChanged?.();
    props.onClose();
  } catch (error) {
    showSheetError(
      setState,
      error instanceof Error ? error.message : 'Transaksi gagal disimpan.',
    );
  }
}

async function submitCustomCategory(
  state: SheetState,
  setState: Dispatch<SetStateAction<SheetState>>,
) {
  const categoryName = state.customCategoryName.trim();

  if (!categoryName) {
    showSheetError(setState, 'Nama kategori wajib diisi dulu ya.');

    return;
  }

  try {
    const category = await createCustomCategory(state, categoryName);
    applyCreatedCustomCategory(setState, category);
  } catch (error) {
    showCustomCategoryError(setState, error);
  }
}

function applyCreatedCustomCategory(
  setState: Dispatch<SetStateAction<SheetState>>,
  category: Category,
) {
  setState(value => ({
    ...value,
    categories: [...value.categories, category],
    customCategoryName: '',
    errorMessage: '',
    selectedCategoryId: category.id,
    step: 'form',
  }));
}

function showCustomCategoryError(
  setState: Dispatch<SetStateAction<SheetState>>,
  error: unknown,
) {
  showSheetError(
    setState,
    error instanceof Error ? error.message : 'Kategori belum bisa dibuat.',
  );
}

async function createCustomCategory(state: SheetState, categoryName: string) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Sesi login kamu belum tersedia.');
  }

  return (await createCategory(token, {
    color: state.customCategoryColor,
    icon: state.customCategoryIcon,
    name: categoryName,
    type: getCategoryType(state.type),
  })).data;
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

async function submitTransactionRequest(
  state: SheetState,
  transaction?: Transaction | null,
) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Sesi login kamu belum tersedia.');
  }

  const payload = getTransactionPayload(state, transaction);

  return transaction
    ? updateTransaction(token, transaction.id, payload)
    : createTransaction(token, payload);
}

function getTransactionPayload(
  state: SheetState,
  transaction?: Transaction | null,
): CreateTransactionPayload {
  if (state.type === 'Pindah Dana') {
    return getTransferPayload(state, transaction);
  }

  return getIncomeExpensePayload(state, transaction);
}

function getIncomeExpensePayload(
  state: SheetState,
  transaction?: Transaction | null,
): CreateTransactionPayload {
  return {
    amount: parseMoneyInput(state.amount),
    categoryId: state.selectedCategoryId,
    note: normalizeNote(state.note),
    occurredAt: getOccurredAtIso(state.occurredDate, transaction?.occurredAt),
    title: getTransactionTitle(state),
    type: getApiTransactionType(state.type),
    walletId: state.selectedWalletId,
  };
}

function getTransferPayload(
  state: SheetState,
  transaction?: Transaction | null,
): CreateTransactionPayload {
  return {
    amount: parseMoneyInput(state.amount),
    fromWalletId: state.fromWalletId,
    note: normalizeNote(state.note),
    occurredAt: getOccurredAtIso(state.occurredDate, transaction?.occurredAt),
    title: getTransactionTitle(state),
    toWalletId: state.toWalletId,
    type: 'TRANSFER',
  };
}

function getTransactionTitle(state: SheetState) {
  const normalizedTitle = normalizeTitle(state.title);

  if (normalizedTitle) {
    return normalizedTitle;
  }

  return state.type === 'Pindah Dana'
    ? 'Pindah Dana'
    : getSelectedCategory(state)?.name ?? state.type;
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
  return getCategoryIconValue(category.icon);
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

function formatDateForInput(value?: string | null) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return formatDateParts(new Date());
  }

  return formatDateParts(date);
}

function formatDateParts(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}

function getOccurredAtIso(value: string, existingOccurredAt?: string) {
  const date = parseDateInput(value);
  const timeSource = existingOccurredAt ? new Date(existingOccurredAt) : new Date();

  date.setHours(
    timeSource.getHours(),
    timeSource.getMinutes(),
    timeSource.getSeconds(),
    timeSource.getMilliseconds(),
  );

  return date.toISOString();
}

function parseDateInput(value: string) {
  const [day, month, year] = value.split('/').map(Number);

  return new Date(year, month - 1, day);
}

function isValidDateInput(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return false;
  }

  return isSameDateParts(parseDateInput(value), value);
}

function isSameDateParts(date: Date, value: string) {
  return !Number.isNaN(date.getTime()) && formatDateParts(date) === value;
}

function getCalendarDates(monthDate: Date) {
  const firstDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = new Date(firstDate);

  startDate.setDate(firstDate.getDate() - firstDate.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);

    date.setDate(startDate.getDate() + index);

    return date;
  });
}

function isSameMonth(date: Date, monthDate: Date) {
  return date.getFullYear() === monthDate.getFullYear()
    && date.getMonth() === monthDate.getMonth();
}

function shiftMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
}

function parseMoneyInput(value: string) {
  return Number(value.replace(/\D/g, ''));
}

function normalizeNote(note: string) {
  const trimmedNote = note.trim();

  return trimmedNote ? trimmedNote : undefined;
}

function normalizeTitle(title: string) {
  return title.trim();
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

  if (!isValidDateInput(state.occurredDate)) {
    return 'Tanggal transaksi harus valid, formatnya DD/MM/YYYY.';
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
    { label: 'Judul', value: getTransactionTitle(state) },
    { label: 'Nominal', value: amountValue },
    { label: 'Tanggal', value: state.occurredDate },
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
