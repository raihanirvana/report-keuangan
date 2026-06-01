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

import AddTransactionSheet from '../../Components/AddTransactionSheet';
import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../Components/BottomSheet';
import {
  createPeriod,
  deletePeriod,
  getDashboardSummary,
  getPeriods,
  getTransactions,
  updatePeriod,
  type DashboardSummary,
  type PayrollPeriod,
} from '../../Services';
import { colors } from '../../Theme';
import { getAuthToken } from '../../Utils/authStorage';

import { DashboardHeader } from './Components/DashboardHeader';
import {
  DashboardHistory,
  mapTransactionToHistoryItem,
} from './Components/DashboardHistory';
import {
  DashboardSpendingLimit,
  LimitDetailBottomSheet,
} from './Components/DashboardSpendingLimit';
import { DashboardSummaryCards } from './Components/DashboardSummaryCards';
import { DashboardUsageChart } from './Components/DashboardUsageChart';
import { DashboardWalletAssets } from './Components/DashboardWalletAssets';
import { monthOptions } from './DashboardScreen.data';
import styles from './DashboardScreen.styles';
import type {
  DashboardContentProps,
  DashboardDataSetters,
  DashboardMainContentProps,
  DashboardPeriod,
  DashboardScreenProps,
  DashboardScreenShellProps,
  DashboardSheetsProps,
  DashboardSheetState,
  DashboardSuccessOverlaysProps,
  DashboardSuccessSheetsProps,
  HistoryFilter,
  HistoryItemData,
  PeriodDateField,
  PeriodFormMode,
  PeriodFormParams,
  PeriodState,
  UsagePeriodBottomSheetProps,
  UsagePeriodContentProps,
} from './DashboardScreen.types';

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
function UsagePeriodContent(props: UsagePeriodContentProps) {
  const form = usePeriodForm(props);

  return (
    <View style={styles.periodContent}>
      <PeriodList
        isLoading={props.period.isLoading}
        onDelete={props.onDeletePeriod}
        onEdit={form.editPeriod}
        onSelect={props.period.setSelectedPeriodId}
        periods={props.period.periods}
        selectedPeriodId={props.period.selectedPeriodId}
      />
      <PeriodForm form={form} />
      <UsagePeriodApplyButton
        isLoading={props.period.isLoading}
        onApply={props.onApply}
      />
    </View>
  );
}

function UsagePeriodApplyButton(props: {
  isLoading: boolean;
  onApply: () => void;
}) {
  return (
    <Pressable
      disabled={props.isLoading}
      onPress={props.onApply}
      style={[
        styles.confirmButton,
        props.isLoading && styles.confirmButtonDisabled,
      ]}
    >
      <Text style={styles.confirmButtonText}>Terapkan</Text>
    </Pressable>
  );
}

function PeriodList(props: {
  isLoading: boolean;
  onDelete: (periodId: string) => Promise<void>;
  onEdit: (period: PayrollPeriod) => void;
  onSelect: (periodId: string) => void;
  periods: PayrollPeriod[];
  selectedPeriodId: string;
}) {
  if (props.isLoading && props.periods.length === 0) {
    return <Text style={styles.periodEmptyText}>Memuat periode...</Text>;
  }

  if (props.periods.length === 0) {
    return <Text style={styles.periodEmptyText}>Belum ada periode.</Text>;
  }

  return (
    <View>
      <Text style={styles.periodGroupTitle}>Periode Gajian</Text>
      <PeriodListItems {...props} />
    </View>
  );
}

function PeriodListItems(props: {
  onDelete: (periodId: string) => Promise<void>;
  onEdit: (period: PayrollPeriod) => void;
  onSelect: (periodId: string) => void;
  periods: PayrollPeriod[];
  selectedPeriodId: string;
}) {
  return (
    <View style={styles.periodList}>
      {props.periods.map(period => (
        <PeriodCard
          isActive={period.id === props.selectedPeriodId}
          key={period.id}
          onDelete={() => props.onDelete(period.id)}
          onEdit={() => props.onEdit(period)}
          onPress={() => props.onSelect(period.id)}
          period={period}
        />
      ))}
    </View>
  );
}

function PeriodCard(props: {
  isActive: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onPress: () => void;
  period: PayrollPeriod;
}) {
  return (
    <View style={[styles.periodCard, props.isActive && styles.periodCardActive]}>
      <Pressable onPress={props.onPress} style={styles.periodCardMain}>
        <Text style={[styles.periodOptionText, props.isActive && styles.periodOptionTextActive]}>
          {props.period.name || props.period.label}
        </Text>
        <Text style={[styles.periodOptionMeta, props.isActive && styles.periodOptionMetaActive]}>
          {props.period.label}
        </Text>
      </Pressable>
      <PeriodCardActions onDelete={props.onDelete} onEdit={props.onEdit} />
    </View>
  );
}

function PeriodCardActions(props: { onDelete: () => void; onEdit: () => void }) {
  return (
    <View style={styles.periodActionRow}>
      <Pressable onPress={props.onEdit} style={styles.periodActionButton}>
        <Text style={styles.periodActionText}>Edit</Text>
      </Pressable>
      <Pressable onPress={props.onDelete} style={styles.periodActionButton}>
        <Text style={styles.periodActionDangerText}>Hapus</Text>
      </Pressable>
    </View>
  );
}

function PeriodForm(props: { form: ReturnType<typeof usePeriodForm> }) {
  return (
    <View style={styles.periodCreateBox}>
      <PeriodFormTitle form={props.form} />
      <PeriodNameInput form={props.form} />
      <PeriodDateInputs form={props.form} />
      <PeriodFormMessage message={props.form.errorMessage} />
      <PeriodCreateButton form={props.form} />
    </View>
  );
}

function PeriodFormTitle(props: { form: ReturnType<typeof usePeriodForm> }) {
  return (
    <View style={styles.periodFormTitleRow}>
      <Text style={styles.periodGroupTitle}>
        {props.form.mode === 'edit' ? 'Edit Periode' : 'Buat Periode Baru'}
      </Text>
      <PeriodCancelEditButton form={props.form} />
    </View>
  );
}

function PeriodCancelEditButton(props: { form: ReturnType<typeof usePeriodForm> }) {
  if (props.form.mode !== 'edit') {
    return null;
  }

  return (
    <Pressable onPress={props.form.cancelEdit}>
      <Text style={styles.periodCancelText}>Batal</Text>
    </Pressable>
  );
}

function PeriodNameInput(props: { form: ReturnType<typeof usePeriodForm> }) {
  return (
    <TextInput
      onChangeText={props.form.setName}
      placeholder="Nama periode, mis. Gajian Juni"
      placeholderTextColor={colors.slate400}
      style={styles.periodInput}
      value={props.form.name}
    />
  );
}

function PeriodDateInputs(props: { form: ReturnType<typeof usePeriodForm> }) {
  return (
    <>
      <View style={styles.periodDateRow}>
        <PeriodDateButton field="start" form={props.form} label="Mulai" />
        <PeriodDateButton field="end" form={props.form} label="Sampai" />
      </View>
      <PeriodDatePickerPanel form={props.form} />
    </>
  );
}

function PeriodDateButton(props: {
  field: 'end' | 'start';
  form: ReturnType<typeof usePeriodForm>;
  label: string;
}) {
  const value = props.field === 'start' ? props.form.startDate : props.form.endDate;

  return (
    <Pressable
      onPress={() => props.form.openDatePicker(props.field)}
      style={[styles.periodDateButton, styles.periodDateInput]}
    >
      <Text style={styles.periodDateLabel}>{props.label}</Text>
      <Text style={styles.periodDateValue}>{formatReadableDate(value)}</Text>
    </Pressable>
  );
}

function PeriodFormMessage(props: { message: string }) {
  if (!props.message) {
    return null;
  }

  return <Text style={styles.periodErrorText}>{props.message}</Text>;
}

function PeriodCreateButton(props: { form: ReturnType<typeof usePeriodForm> }) {
  return (
    <Pressable
      disabled={props.form.isSaving}
      onPress={props.form.save}
      style={styles.periodCreateButton}
    >
      <Text style={styles.periodCreateButtonText}>
        {getPeriodSaveLabel(props.form)}
      </Text>
    </Pressable>
  );
}

function getPeriodSaveLabel(form: ReturnType<typeof usePeriodForm>) {
  if (form.isSaving) {
    return 'Menyimpan...';
  }

  return form.mode === 'edit' ? 'Simpan Periode' : 'Tambah Periode';
}

function PeriodDatePickerPanel(props: { form: ReturnType<typeof usePeriodForm> }) {
  if (!props.form.activeDateField) {
    return null;
  }

  return (
    <View style={styles.periodDatePickerPanel}>
      <PeriodDatePickerHeader form={props.form} />
      <PeriodDateWeekRow />
      <View style={styles.periodDateGrid}>
        {getCalendarDates(props.form.monthDate).map(date => (
          <PeriodDateDay
            date={date}
            form={props.form}
            key={date.toISOString()}
          />
        ))}
      </View>
    </View>
  );
}

function PeriodDatePickerHeader(props: { form: ReturnType<typeof usePeriodForm> }) {
  return (
    <View style={styles.periodDatePickerHeader}>
      <PeriodMonthButton label="‹" onPress={() => props.form.shiftMonth(-1)} />
      <Text style={styles.periodDatePickerTitle}>
        {formatMonthTitle(props.form.monthDate)}
      </Text>
      <PeriodMonthButton label="›" onPress={() => props.form.shiftMonth(1)} />
    </View>
  );
}

function PeriodMonthButton(props: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={styles.periodDatePickerNav}>
      <Text style={styles.periodDatePickerNavText}>{props.label}</Text>
    </Pressable>
  );
}

function PeriodDateWeekRow() {
  return (
    <View style={styles.periodDateWeekRow}>
      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
        <Text key={day} style={styles.periodDateWeekText}>{day}</Text>
      ))}
    </View>
  );
}

function PeriodDateDay(props: {
  date: Date;
  form: ReturnType<typeof usePeriodForm>;
}) {
  const dateValue = formatInputDate(props.date);
  const isSelected = props.form.activeDateField === 'start'
    ? dateValue === props.form.startDate
    : dateValue === props.form.endDate;

  return (
    <Pressable
      onPress={() => props.form.selectDate(props.date)}
      style={[styles.periodDateDay, isSelected && styles.periodDateDayActive]}
    >
      <Text style={[styles.periodDateDayText, isSelected && styles.periodDateDayTextActive]}>
        {props.date.getDate()}
      </Text>
    </Pressable>
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

function UsagePeriodBottomSheet(props: UsagePeriodBottomSheetProps) {
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
      onChanged={props.onDashboardChanged}
      onClose={props.onCloseAddSheet}
      visible={props.isAddSheetVisible}
    />
  );
}

function DashboardSheets(props: DashboardSheetsProps) {
  return (
    <>
      <LimitDetailBottomSheet
        month={props.apiMonth}
        onChanged={props.onDashboardChanged}
        onClose={props.onCloseLimitDetail}
        periodId={props.periodId}
        visible={props.isLimitDetailVisible}
      />
      <AddSheetOverlay {...props} />
    </>
  );
}

function DashboardContent(props: DashboardContentProps) {
  return (
    <ScrollView
      alwaysBounceVertical
      contentContainerStyle={styles.pageContent}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={props.onRefresh}
          refreshing={props.isRefreshing}
          tintColor={colors.primary}
        />
      }
      style={styles.pageScroll}
    >
      <DashboardHeader
        onLogout={props.onLogout}
        onUpdateUser={props.onUpdateUser}
        user={props.user}
      />
      <DashboardBodySections {...props} />
    </ScrollView>
  );
}

function DashboardBodySections(props: DashboardContentProps) {
  return (
    <>
      <DashboardWalletAssets
        dashboardSummary={props.dashboardSummary}
        isLoading={props.isRefreshing}
        onChanged={props.onRefresh}
      />
      <DashboardMiddleSections {...props} />
      <DashboardFooterSections {...props} />
    </>
  );
}

function DashboardMiddleSections(props: DashboardContentProps) {
  return (
    <>
      <DashboardSummaryCards
        apiMonth={props.apiMonth}
        dashboardSummary={props.dashboardSummary}
        isLoading={props.isRefreshing}
        onOpenHistory={props.onOpenFullHistory}
        periodId={props.periodId}
        periodLabel={props.filterLabel}
      />
      <DashboardUsageChart
        apiMonth={props.apiMonth}
        chartAnimationKey={props.chartAnimationKey}
        dashboardSummary={props.dashboardSummary}
        filterLabel={props.filterLabel}
        isLoading={props.isRefreshing}
        onOpenUsagePeriod={props.onOpenUsagePeriod}
        periodId={props.periodId}
      />
    </>
  );
}

function DashboardFooterSections(props: DashboardContentProps) {
  return (
    <>
      <DashboardSpendingLimit
        budgetRefreshKey={props.budgetRefreshKey}
        dashboardSummary={props.dashboardSummary}
        isLoading={props.isRefreshing}
        month={props.apiMonth}
        onOpenLimitDetail={props.onOpenLimitDetail}
        periodId={props.periodId}
      />
      <DashboardHistorySection {...props} />
    </>
  );
}

function DashboardHistorySection(props: DashboardContentProps) {
  return (
    <DashboardHistory
      availablePeriod={props.availablePeriod}
      histories={props.historyItems}
      historyMonth={props.historyMonth}
      historyMonthLabel={props.historyMonthLabel}
      historyPeriod={props.historyPeriod}
      isFullHistoryVisible={props.isFullHistoryVisible}
      isLoading={props.isRefreshing}
      onChanged={props.onChanged}
      onCloseFullHistory={props.onCloseFullHistory}
      onOpenFullHistory={() => props.onOpenFullHistory()}
      onSelectHistoryFilter={props.onSelectHistoryFilter}
      periodId={props.historyPeriodId}
      selectedHistoryFilter={props.selectedHistoryFilter}
      selectedHistoryWalletId={props.selectedHistoryWalletId}
    />
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
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={props.onRefresh}
          refreshing={props.isRefreshing}
          tintColor={colors.primary}
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

function useSheetVisibilityState() {
  const [isAddSheetVisible, setAddSheetVisible] = useState(false);
  const [isFullHistoryVisible, setFullHistoryVisible] = useState(false);
  const [isLimitDetailVisible, setLimitDetailVisible] = useState(false);
  const [isUsagePeriodVisible, setUsagePeriodVisible] = useState(false);

  return {
    isAddSheetVisible,
    isFullHistoryVisible,
    isLimitDetailVisible,
    isUsagePeriodVisible,
    setAddSheetVisible,
    setFullHistoryVisible,
    setLimitDetailVisible,
    setUsagePeriodVisible,
  };
}

function useHistoryFilterState(setFullHistoryVisible: (value: boolean) => void) {
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState<HistoryFilter>(
    'Semua',
  );
  const [selectedHistoryWalletId, setSelectedHistoryWalletId] = useState('all');
  const openFullHistory = (filter: HistoryFilter = 'Semua', walletId = 'all') => {
    setSelectedHistoryFilter(filter);
    setSelectedHistoryWalletId(walletId);
    setFullHistoryVisible(true);
  };

  return {
    openFullHistory,
    selectedHistoryFilter,
    selectedHistoryWalletId,
    setSelectedHistoryFilter,
  };
}

function useDashboardSheetState() {
  const visibility = useSheetVisibilityState();
  const history = useHistoryFilterState(visibility.setFullHistoryVisible);

  return {
    ...visibility,
    selectedHistoryFilter: history.selectedHistoryFilter,
    selectedHistoryWalletId: history.selectedHistoryWalletId,
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
}) {
  return {
    ...getDashboardSheetCloseActions(params),
    ...getDashboardSheetOpenActions(params),
    onSelectHistoryFilter: params.setSelectedHistoryFilter,
  };
}

function getDashboardSheetCloseActions(params: {
  setAddSheetVisible: (value: boolean) => void;
  setFullHistoryVisible: (value: boolean) => void;
  setLimitDetailVisible: (value: boolean) => void;
  setUsagePeriodVisible: (value: boolean) => void;
}) {
  return {
    onCloseAddSheet: () => params.setAddSheetVisible(false),
    onCloseFullHistory: () => params.setFullHistoryVisible(false),
    onCloseLimitDetail: () => params.setLimitDetailVisible(false),
    onCloseUsagePeriod: () => params.setUsagePeriodVisible(false),
  };
}

function getDashboardSheetOpenActions(params: {
  openFullHistory: (filter?: HistoryFilter) => void;
  setAddSheetVisible: (value: boolean) => void;
  setLimitDetailVisible: (value: boolean) => void;
  setUsagePeriodVisible: (value: boolean) => void;
}) {
  return {
    onOpenAddSheet: () => params.setAddSheetVisible(true),
    onOpenFullHistory: params.openFullHistory,
    onOpenLimitDetail: () => params.setLimitDetailVisible(true),
    onOpenUsagePeriod: () => params.setUsagePeriodVisible(true),
  };
}

function usePeriodState(initialApiMonth = getCurrentApiMonth()) {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getMonthLabel(initialApiMonth),
  );
  const [selectedYear, setSelectedYear] = useState(getYearLabel(initialApiMonth));
  const [isLoading, setLoading] = useState(false);

  usePeriodOptionsLoader(setPeriods, setSelectedPeriodId, setLoading);

  return {
    isLoading,
    periods,
    selectedPeriodId,
    selectedMonth,
    selectedYear,
    setLoading,
    setPeriods,
    setSelectedPeriodId,
    setSelectedMonth,
    setSelectedYear,
  };
}

function usePeriodForm(actions: UsagePeriodContentProps) {
  const [mode, setMode] = useState<PeriodFormMode>('create');
  const [editingPeriodId, setEditingPeriodId] = useState('');
  const [name, setName] = useState('');
  const dateState = usePeriodDateState();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setSaving] = useState(false);

  return getPeriodFormState({
    actions,
    ...dateState,
    editingPeriodId,
    errorMessage,
    isSaving,
    mode,
    name,
    setEditingPeriodId,
    setErrorMessage,
    setMode,
    setName,
    setSaving,
  });
}

function usePeriodDateState() {
  const [startDate, setStartDate] = useState(getTodayInputDate());
  const [endDate, setEndDate] = useState(getNextMonthInputDate());
  const [startTime, setStartTime] = useState(getCurrentInputTime());
  const [endTime, setEndTime] = useState(getCurrentInputTime());
  const [activeDateField, setActiveDateField] = useState<PeriodDateField | null>(null);
  const [monthDate, setMonthDate] = useState(() => new Date());

  return {
    activeDateField,
    endDate,
    endTime,
    monthDate,
    setActiveDateField,
    setEndDate,
    setEndTime,
    setMonthDate,
    setStartDate,
    setStartTime,
    startDate,
    startTime,
  };
}

function getPeriodFormState(params: PeriodFormParams) {
  return {
    ...getPeriodFormValues(params),
    ...getPeriodFormActions(params),
  };
}

function getPeriodFormValues(params: PeriodFormParams) {
  return {
    activeDateField: params.activeDateField,
    endDate: params.endDate,
    endTime: params.endTime,
    errorMessage: params.errorMessage,
    isSaving: params.isSaving,
    mode: params.mode,
    monthDate: params.monthDate,
    name: params.name,
    startDate: params.startDate,
    startTime: params.startTime,
  };
}

function getPeriodFormActions(params: PeriodFormParams) {
  return {
    cancelEdit: () => resetPeriodForm(params),
    editPeriod: (period: PayrollPeriod) => editPeriodForm(params, period),
    openDatePicker: (field: PeriodDateField) => openPeriodDatePicker(params, field),
    save: () => savePeriodForm(params),
    selectDate: (date: Date) => selectPeriodDate(params, date),
    setName: params.setName,
    shiftMonth: (amount: number) => params.setMonthDate(shiftMonth(params.monthDate, amount)),
  };
}

async function savePeriodForm(params: PeriodFormParams) {
  if (!validatePeriodForm(params)) {
    return;
  }

  params.setSaving(true);
  params.setErrorMessage('');
  await submitPeriodForm(params);
}

async function submitPeriodForm(params: PeriodFormParams) {
  try {
    await runPeriodSave(params);
    resetPeriodForm(params);
  } catch {
    params.setErrorMessage('Periode belum bisa disimpan. Coba lagi sebentar ya.');
  } finally {
    params.setSaving(false);
  }
}

function validatePeriodForm(params: {
  endDate: string;
  endTime: string;
  setErrorMessage: (value: string) => void;
  startDate: string;
  startTime: string;
}) {
  if (isValidPeriodInput(params)) {
    return true;
  }

  params.setErrorMessage('Waktu selesai harus setelah waktu mulai.');

  return false;
}

async function runPeriodSave(params: PeriodFormParams) {
  const payload = getPeriodPayload(params);

  if (params.mode === 'edit' && params.editingPeriodId) {
    await params.actions.onUpdatePeriod(params.editingPeriodId, payload);

    return;
  }

  await params.actions.onCreatePeriod(payload);
}

function getPeriodPayload(params: {
  endDate: string;
  endTime: string;
  mode: PeriodFormMode;
  name: string;
  startDate: string;
  startTime: string;
}) {
  const boundaryTime = params.mode === 'create'
    ? getCurrentInputTime()
    : params.startTime;
  const endTime = params.mode === 'create'
    ? boundaryTime
    : params.endTime;

  return {
    endDate: toPeriodBoundaryIso(params.endDate, endTime),
    name: params.name.trim() || undefined,
    startDate: toPeriodBoundaryIso(params.startDate, boundaryTime),
  };
}

function editPeriodForm(
  params: PeriodFormParams,
  period: PayrollPeriod,
) {
  params.setMode('edit');
  params.setEditingPeriodId(period.id);
  params.setName(period.name);
  params.setStartDate(formatInputDate(new Date(period.startDate)));
  params.setEndDate(formatInputDate(new Date(period.endDate)));
  params.setStartTime(formatInputTime(new Date(period.startDate)));
  params.setEndTime(formatInputTime(new Date(period.endDate)));
  params.setMonthDate(new Date(period.startDate));
}

function openPeriodDatePicker(
  params: PeriodFormParams,
  field: PeriodDateField,
) {
  params.setActiveDateField(field);
  params.setMonthDate(parseInputDate(
    field === 'start' ? params.startDate : params.endDate,
  ));
}

function selectPeriodDate(
  params: PeriodFormParams,
  date: Date,
) {
  const formattedDate = formatInputDate(date);

  if (params.activeDateField === 'start') {
    params.setStartDate(formattedDate);
  } else {
    params.setEndDate(formattedDate);
  }

  params.setActiveDateField(null);
}

function resetPeriodForm(params: PeriodFormParams) {
  const currentTime = getCurrentInputTime();

  params.setMode('create');
  params.setEditingPeriodId('');
  params.setName('');
  params.setStartDate(getTodayInputDate());
  params.setEndDate(getNextMonthInputDate());
  params.setStartTime(currentTime);
  params.setEndTime(currentTime);
  params.setActiveDateField(null);
}

function isValidPeriodInput(params: {
  endDate: string;
  endTime: string;
  startDate: string;
  startTime: string;
}) {
  if (!isValidDateTimeInput(params)) {
    return false;
  }

  return toPeriodBoundaryDate(params.endDate, params.endTime).getTime()
    > toPeriodBoundaryDate(params.startDate, params.startTime).getTime();
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function getNextMonthInputDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);

  return date.toISOString().slice(0, 10);
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatInputTime(date: Date) {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${hour}:${minute}`;
}

function getCurrentInputTime() {
  return formatInputTime(new Date());
}

function isValidDateTimeInput(params: {
  endDate: string;
  endTime: string;
  startDate: string;
  startTime: string;
}) {
  return isValidDateInput(params.startDate)
    && isValidDateInput(params.endDate)
    && isValidTimeInput(params.startTime)
    && isValidTimeInput(params.endTime);
}

function isValidDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimeInput(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function toPeriodBoundaryIso(date: string, time: string) {
  return toPeriodBoundaryDate(date, time).toISOString();
}

function toPeriodBoundaryDate(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function parseInputDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatReadableDate(value: string) {
  return parseInputDate(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getCalendarDates(monthDate: Date) {
  const startDate = getCalendarStartDate(monthDate);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return date;
  });
}

function getCalendarStartDate(monthDate: Date) {
  const firstDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = new Date(firstDate);
  startDate.setDate(firstDate.getDate() - firstDate.getDay());

  return startDate;
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

function getDashboardPeriod(period: PeriodState) {
  const selectedPeriod = period.periods.find(
    item => item.id === period.selectedPeriodId,
  );
  const monthIndex = getMonthNumber(period.selectedMonth);

  return {
    apiMonth: `${period.selectedYear}-${String(monthIndex).padStart(2, '0')}`,
    label: selectedPeriod?.label ?? `${period.selectedMonth} ${period.selectedYear}`,
    periodId: selectedPeriod?.id,
  };
}

function usePeriodOptionsLoader(
  setPeriods: (periods: PayrollPeriod[]) => void,
  setSelectedPeriodId: (periodId: string) => void,
  setLoading: (value: boolean) => void,
) {
  useEffect(() => {
    loadPeriodOptions(setPeriods, setSelectedPeriodId, setLoading)
      .catch(() => undefined);
  }, [setLoading, setPeriods, setSelectedPeriodId]);
}

async function loadPeriodOptions(
  setPeriods: (periods: PayrollPeriod[]) => void,
  setSelectedPeriodId: (periodId: string) => void,
  setLoading: (value: boolean) => void,
) {
  const token = await getAuthToken();

  if (!token) {
    return;
  }

  setLoading(true);
  try {
    const response = await getPeriods(token);
    const periods = response.data;
    const currentPeriod = periods.find(period => period.isCurrent) ?? periods[0];

    setPeriods(periods);
    setSelectedPeriodId(currentPeriod?.id ?? '');
  } finally {
    setLoading(false);
  }
}

function UsagePeriodOverlay(props: {
  availablePeriod?: DashboardSummary['availablePeriod'];
  period: PeriodState;
  sheets: DashboardSheetState;
}) {
  return (
    <UsagePeriodBottomSheet
      onApply={props.sheets.onCloseUsagePeriod}
      onCreatePeriod={payload => createAndSelectPeriod(props.period, payload)}
      onDeletePeriod={periodId => deleteAndReloadPeriod(props.period, periodId)}
      onClose={props.sheets.onCloseUsagePeriod}
      onUpdatePeriod={(periodId, payload) => updateAndSelectPeriod(
        props.period,
        periodId,
        payload,
      )}
      period={props.period}
      visible={props.sheets.isUsagePeriodVisible}
    />
  );
}

async function createAndSelectPeriod(
  period: PeriodState,
  payload: Parameters<UsagePeriodContentProps['onCreatePeriod']>[0],
) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Missing token');
  }

  period.setLoading(true);
  try {
    const created = await createPeriod(token, payload);
    await reloadPeriods(period, created.data.id);
  } finally {
    period.setLoading(false);
  }
}

async function updateAndSelectPeriod(
  period: PeriodState,
  periodId: string,
  payload: Parameters<UsagePeriodContentProps['onUpdatePeriod']>[1],
) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Missing token');
  }

  period.setLoading(true);
  try {
    await updatePeriod(token, periodId, payload);
    await reloadPeriods(period, periodId);
  } finally {
    period.setLoading(false);
  }
}

async function deleteAndReloadPeriod(period: PeriodState, periodId: string) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Missing token');
  }

  period.setLoading(true);
  try {
    await deletePeriod(token, periodId);
    await reloadPeriods(period);
  } finally {
    period.setLoading(false);
  }
}

async function reloadPeriods(period: PeriodState, selectedPeriodId?: string) {
  const token = await getAuthToken();

  if (!token) {
    return;
  }

  const response = await getPeriods(token);
  const fallback = response.data.find(item => item.isCurrent) ?? response.data[0];

  period.setPeriods(response.data);
  period.setSelectedPeriodId(selectedPeriodId ?? fallback?.id ?? '');
}

function getCurrentApiMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getMonthLabel(apiMonth: string) {
  const monthIndex = Number(apiMonth.slice(5, 7)) - 1;

  return monthOptions[monthIndex] ?? monthOptions[0];
}

function getYearLabel(apiMonth: string) {
  return apiMonth.slice(0, 4);
}

function getMonthNumber(monthLabel: string) {
  return monthOptions.indexOf(
    monthLabel as (typeof monthOptions)[number],
  ) + 1;
}

async function fetchDashboardSummary(month: string, periodId?: string) {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  const response = await getDashboardSummary(token, month, 'all', periodId);

  return response.data;
}

async function fetchRecentHistoryItems(month: string, periodId?: string) {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  const response = await getTransactions(token, {
    limit: 4,
    month,
    page: 1,
    periodId,
  });

  return response.data.map(mapTransactionToHistoryItem);
}

function useDashboardData(month: string, periodId?: string) {
  const state = useDashboardLocalState();
  const refreshDashboard = () => (
    loadDashboardData(month, periodId, getDashboardDataSetters(state))
  );
  useInitialDashboardRefresh(refreshDashboard, month, periodId);

  return { ...state, refreshDashboard };
}

function useDashboardLocalState() {
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);
  const [chartAnimationKey, setChartAnimationKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItemData[]>([]);
  const [isRefreshing, setRefreshing] = useState(false);

  return {
    budgetRefreshKey,
    chartAnimationKey,
    dashboardSummary,
    errorMessage,
    historyItems,
    isRefreshing,
    setBudgetRefreshKey,
    setChartAnimationKey,
    setDashboardSummary,
    setErrorMessage,
    setHistoryItems,
    setRefreshing,
  };
}

function getDashboardDataSetters(
  state: ReturnType<typeof useDashboardLocalState>,
) {
  return {
    setBudgetRefreshKey: state.setBudgetRefreshKey,
    setChartAnimationKey: state.setChartAnimationKey,
    setDashboardSummary: state.setDashboardSummary,
    setErrorMessage: state.setErrorMessage,
    setHistoryItems: state.setHistoryItems,
    setRefreshing: state.setRefreshing,
  };
}

function useInitialDashboardRefresh(
  refreshDashboard: () => Promise<void>,
  month: string,
  periodId?: string,
) {
  useEffect(() => {
    refreshDashboard().catch(() => undefined);
  }, [month, periodId]);
}

async function loadDashboardData(
  month: string,
  periodId: string | undefined,
  setters: DashboardDataSetters,
) {
  setters.setRefreshing(true);

  try {
    const [summary, historyItems] = await fetchDashboardHomeData(month, periodId);
    setters.setDashboardSummary(summary);
    setters.setHistoryItems(historyItems);
    setters.setBudgetRefreshKey(key => key + 1);
    setters.setChartAnimationKey(key => key + 1);
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

async function fetchDashboardHomeData(month: string, periodId?: string) {
  const [summary, historyItems] = await Promise.all([
    fetchDashboardSummary(month, periodId),
    fetchRecentHistoryItems(month, periodId).catch(() => []),
  ]);

  return [summary, historyItems] as const;
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
    <View style={styles.mainContent}>
      <DashboardContent {...getDashboardContentProps(props)} />
      <FloatingAddButton onPress={props.sheets.onOpenAddSheet} />
    </View>
  );
}

function getDashboardContentProps(
  props: DashboardMainContentProps,
): DashboardContentProps {
  return {
    ...getDashboardContentDataProps(props),
    ...getDashboardContentActionProps(props),
    onLogout: props.onLogout,
    onUpdateUser: props.onUpdateUser,
    user: props.user,
  };
}

function getDashboardContentDataProps(props: DashboardMainContentProps) {
  return {
    availablePeriod: props.dashboardData.dashboardSummary?.availablePeriod,
    apiMonth: props.apiMonth,
    budgetRefreshKey: props.dashboardData.budgetRefreshKey,
    chartAnimationKey: props.dashboardData.chartAnimationKey,
    dashboardSummary: props.dashboardData.dashboardSummary,
    filterLabel: props.filterLabel,
    historyItems: props.dashboardData.historyItems,
    historyMonth: props.historyPeriodFilter.apiMonth,
    historyMonthLabel: props.historyPeriodFilter.label,
    historyPeriodId: props.historyPeriodFilter.periodId,
    historyPeriod: props.historyPeriod,
    isFullHistoryVisible: props.sheets.isFullHistoryVisible,
    isRefreshing: props.dashboardData.isRefreshing,
    periodId: props.periodId,
    selectedHistoryFilter: props.sheets.selectedHistoryFilter,
    selectedHistoryWalletId: props.sheets.selectedHistoryWalletId,
  };
}

function getDashboardContentActionProps(props: DashboardMainContentProps) {
  return {
    onChanged: props.dashboardData.refreshDashboard,
    onCloseFullHistory: props.sheets.onCloseFullHistory,
    onOpenFullHistory: props.sheets.onOpenFullHistory,
    onOpenLimitDetail: props.sheets.onOpenLimitDetail,
    onOpenUsagePeriod: props.sheets.onOpenUsagePeriod,
    onRefresh: props.dashboardData.refreshDashboard,
    onSelectHistoryFilter: props.sheets.onSelectHistoryFilter,
  };
}

function DashboardScreen({ onLogout, onUpdateUser, user }: DashboardScreenProps) {
  const sheets = useDashboardSheetState();
  const period = usePeriodState();
  const historyPeriod = usePeriodState();
  const dashboardPeriod = getDashboardPeriod(period);
  const dashboardData = useDashboardData(
    dashboardPeriod.apiMonth,
    dashboardPeriod.periodId,
  );

  return (
    <DashboardScreenShell
      dashboardData={dashboardData}
      historyPeriod={historyPeriod}
      periodFilter={dashboardPeriod}
      onLogout={onLogout}
      onUpdateUser={onUpdateUser}
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
  const historyPeriod = getDashboardPeriod(props.historyPeriod);

  return (
    <View style={styles.container}>
      <DashboardSuccessMainContent {...props} historyPeriodFilter={historyPeriod} />
      <DashboardSuccessOverlays
        availablePeriod={props.dashboardData.dashboardSummary?.availablePeriod}
        dashboardData={props.dashboardData}
        historyPeriodFilter={historyPeriod}
        historyPeriodState={props.historyPeriod}
        period={props.period}
        periodFilter={props.periodFilter}
        sheets={props.sheets}
      />
    </View>
  );
}

function DashboardSuccessMainContent(
  props: DashboardScreenShellProps & { historyPeriodFilter: DashboardPeriod },
) {
  return (
    <DashboardMainContent
      dashboardData={props.dashboardData}
      apiMonth={props.periodFilter.apiMonth}
      filterLabel={props.periodFilter.label}
      historyPeriod={props.historyPeriod}
      historyPeriodFilter={props.historyPeriodFilter}
      periodId={props.periodFilter.periodId}
      onLogout={props.onLogout}
      onUpdateUser={props.onUpdateUser}
      sheets={props.sheets}
      user={props.user}
    />
  );
}

function DashboardSuccessOverlays(props: DashboardSuccessOverlaysProps) {
  return (
    <>
      <DashboardSuccessSheets
        availablePeriod={props.availablePeriod}
        dashboardData={props.dashboardData}
        historyPeriodFilter={props.historyPeriodFilter}
        historyPeriodState={props.historyPeriodState}
        periodFilter={props.periodFilter}
        sheets={props.sheets}
      />
      <UsagePeriodOverlay
        availablePeriod={props.availablePeriod}
        period={props.period}
        sheets={props.sheets}
      />
    </>
  );
}

function DashboardSuccessSheets(props: DashboardSuccessSheetsProps) {
  return (
    <DashboardSheets
      {...props.sheets}
      apiMonth={props.periodFilter.apiMonth}
      onDashboardChanged={props.dashboardData.refreshDashboard}
      periodId={props.periodFilter.periodId}
    />
  );
}

export default DashboardScreen;
