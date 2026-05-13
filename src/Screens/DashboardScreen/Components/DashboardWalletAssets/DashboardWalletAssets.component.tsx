import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../../../Components/BottomSheet';
import {
  createWallet,
  deleteWallet,
  getWallets,
  updateWallet,
  type CreateWalletPayload,
  type DashboardSummary,
  type UpdateWalletPayload,
  type Wallet,
} from '../../../../Services';
import { getAuthToken } from '../../../../Utils/authStorage';
import { walletTypes } from '../../DashboardScreen.data';
import type {
  WalletActionMode,
  WalletFormDefaults,
  WalletFormState,
  WalletItem,
  WalletSheetView,
  WalletTone,
  WalletType,
} from '../../DashboardScreen.types';

import styles from './DashboardWalletAssets.styles';
import type {
  DashboardWalletAssetsProps,
  WalletSheetState,
} from './DashboardWalletAssets.types';

function DashboardWalletAssets(props: DashboardWalletAssetsProps) {
  const [isWalletSheetVisible, setWalletSheetVisible] = useState(false);

  return (
    <>
      <BalanceCard
        balanceFormatted={props.dashboardSummary?.balance.formatted ?? 'Rp 0'}
        isLoading={props.isLoading}
        onOpenWalletSheet={() => setWalletSheetVisible(true)}
        selectedWalletName={getSelectedWalletName(props.dashboardSummary)}
      />
      <WalletBottomSheet
        onChanged={props.onChanged}
        onClose={() => setWalletSheetVisible(false)}
        totalAmount={props.dashboardSummary?.balance.formatted ?? 'Rp 0'}
        visible={isWalletSheetVisible}
      />
    </>
  );
}

function getSelectedWalletName(summary: DashboardSummary | null) {
  return summary?.selectedWallet.name ?? 'Total Asset Saya';
}

function BalanceCard(props: {
  balanceFormatted: string;
  isLoading: boolean;
  onOpenWalletSheet: () => void;
  selectedWalletName: string;
}) {
  if (props.isLoading) {
    return <BalanceCardLoadingState />;
  }

  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balancePattern}>· · ·</Text>
      <View style={styles.balanceHeader}>
        <Text style={styles.balanceLabel}>SISA UANG JAJAN KAMU</Text>
        <Pressable onPress={props.onOpenWalletSheet} style={styles.balanceBadge}>
          <Text style={styles.balanceBadgeText}>{props.selectedWalletName}</Text>
        </Pressable>
      </View>
      <Text style={styles.balanceValue}>{props.balanceFormatted}</Text>
      <Text style={styles.balanceNote}>Semangat menabung! ✨</Text>
    </View>
  );
}

function BalanceCardLoadingState() {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balancePattern}>· · ·</Text>
      <View style={styles.balanceLoadingState}>
        <ActivityIndicator color={styles.balanceLoadingSpinner.color} size="large" />
        <Text style={styles.balanceLoadingText}>Memuat total aset...</Text>
      </View>
    </View>
  );
}

function WalletBottomSheet(props: {
  onChanged: () => void;
  onClose: () => void;
  totalAmount: string;
  visible: boolean;
}) {
  const sheet = useWalletBottomSheetContent(props);

  return (
    <BottomSheet
      containerStyle={styles.sheetContainer}
      disableClose={sheet.isBusy}
      isLoading={sheet.isBusy}
      loadingLabel={sheet.loadingLabel}
      onClose={props.onClose}
      visible={props.visible}
    >
      {sheet.renderContent}
    </BottomSheet>
  );
}

function useWalletBottomSheetContent(props: {
  onChanged: () => void;
  onClose: () => void;
  totalAmount: string;
  visible: boolean;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const walletItems = useWalletItems(props.visible, refreshKey);
  const handleChanged = getWalletChangedHandler(setRefreshKey, props.onChanged);
  const walletMutation = useWalletMutationState();
  const handleDelete = getWalletDeleteHandler(walletItems.remove, handleChanged, walletMutation.setState);
  const isBusy = walletItems.isFetching || walletMutation.count > 0;

  return buildWalletBottomSheetContent({
    handleChanged,
    handleDelete,
    isBusy,
    isFetching: walletItems.isFetching,
    loadingLabel: walletMutation.loadingLabel,
    onClose: props.onClose,
    setMutationState: walletMutation.setState,
    totalAmount: props.totalAmount,
    walletItems: walletItems.items,
  });
}

function useWalletMutationState() {
  const [loadingLabel, setLoadingLabel] = useState('Memuat dompet...');
  const [count, setCount] = useState(0);

  return {
    count,
    loadingLabel,
    setState: createWalletMutationStateSetter(
      setLoadingLabel,
      setCount,
    ),
  };
}

function buildWalletBottomSheetContent(props: {
  handleChanged: () => void;
  handleDelete: (walletId: string) => void;
  isBusy: boolean;
  isFetching: boolean;
  loadingLabel: string;
  onClose: () => void;
  setMutationState: (value: boolean, label: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  return {
    isBusy: props.isBusy,
    loadingLabel: props.loadingLabel,
    renderContent: createWalletSheetRenderer(props),
  };
}

function createWalletSheetRenderer(props: {
  handleChanged: () => void;
  handleDelete: (walletId: string) => void;
  isBusy: boolean;
  isFetching: boolean;
  onClose: () => void;
  setMutationState: (value: boolean, label: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  return ({ dragHandleProps }: { dragHandleProps: BottomSheetDragHandleProps }) =>
    renderWalletSheetContent({
      dragHandleProps,
      isBusy: props.isBusy,
      isFetching: props.isFetching,
      onChanged: props.handleChanged,
      onClose: props.onClose,
      onDeleteWallet: props.handleDelete,
      onSetMutation: props.setMutationState,
      totalAmount: props.totalAmount,
      walletItems: props.walletItems,
    });
}

function renderWalletCurrentView(props: {
  isBusy: boolean;
  onChanged: () => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  onSetMutation: (value: boolean, label: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
  walletSheet: WalletSheetState;
}) {
  if (props.walletSheet.view === 'create') {
    return renderWalletCreateContent(props);
  }

  if (props.walletSheet.view === 'edit') {
    return <WalletSheetEditContent {...props} />;
  }

  return <WalletSheetListContent {...props} />;
}

function renderWalletCreateContent(props: {
  isBusy: boolean;
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  walletSheet: WalletSheetState;
}) {
  return (
    <WalletCreateContent
      isBusy={props.isBusy}
      onChanged={props.onChanged}
      onSetMutation={props.onSetMutation}
      onSuccess={() => resetWalletSheetToList(props.walletSheet)}
    />
  );
}

function WalletSheetCurrentContent(props: {
  isBusy: boolean;
  isFetching: boolean;
  onChanged: () => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  onSetMutation: (value: boolean, label: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
  walletSheet: WalletSheetState;
}) {
  if (props.walletSheet.view === 'list' && props.isFetching) {
    return <WalletSheetLoadingState />;
  }

  return renderWalletCurrentView(props);
}

function renderWalletSheetContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isBusy: boolean;
  isFetching: boolean;
  onChanged: () => void;
  onClose: () => void;
  onDeleteWallet: (walletId: string) => void;
  onSetMutation: (value: boolean, label: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  return <WalletSheetContent {...props} />;
}

function WalletSheetContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isBusy: boolean;
  isFetching: boolean;
  onChanged: () => void;
  onClose: () => void;
  onDeleteWallet: (walletId: string) => void;
  onSetMutation: (value: boolean, label: string) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  const walletSheet = useWalletSheetState();

  return (
    <>
      <WalletSheetHeaderContent {...props} walletSheet={walletSheet} />
      <WalletSheetCurrentContent
        {...props}
        onEditWallet={wallet => openWalletEditView(walletSheet, wallet)}
        walletSheet={walletSheet}
      />
    </>
  );
}

function useWalletSheetState() {
  const [actionMode, setActionMode] = useState<WalletActionMode>('idle');
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [view, setView] = useState<WalletSheetView>('list');

  return {
    actionMode,
    selectedWallet,
    setActionMode,
    setSelectedWallet,
    setView,
    view,
  };
}

function WalletSheetHeaderContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isBusy: boolean;
  onClose: () => void;
  walletItems: WalletItem[];
  walletSheet: WalletSheetState;
}) {
  return (
    <WalletSheetHeader
      dragHandleProps={props.dragHandleProps}
      onBack={() => resetWalletSheetToList(props.walletSheet)}
      onClose={props.onClose}
      isBusy={props.isBusy}
      walletItems={props.walletItems}
      walletSheet={props.walletSheet}
    />
  );
}

function WalletSheetHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  isBusy: boolean;
  onBack: () => void;
  onClose: () => void;
  walletItems: WalletItem[];
  walletSheet: WalletSheetState;
}) {
  return (
    <SheetHeader
      action={getWalletHeaderAction(props.walletItems, props.walletSheet)}
      canGoBack={props.walletSheet.view !== 'list'}
      dragHandleProps={props.dragHandleProps}
      onClose={props.isBusy ? () => undefined : props.onClose}
      onGoBack={props.isBusy ? () => undefined : props.onBack}
      title={getWalletSheetTitle(props.walletSheet.view)}
    />
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
        <SheetBackButton isVisible={props.canGoBack} onPress={props.onGoBack} />
        <View style={styles.sheetTitleArea} {...props.dragHandleProps}>
          <Text style={styles.sheetTitle}>{props.title}</Text>
        </View>
        {props.action}
        <SheetCloseButton onClose={props.onClose} />
      </View>
    </View>
  );
}

function SheetHandle(props: { dragHandleProps: BottomSheetDragHandleProps }) {
  return (
    <View {...props.dragHandleProps}>
      <View style={styles.sheetHandle} />
    </View>
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

function SheetCloseButton(props: { onClose: () => void }) {
  return (
    <Pressable onPress={props.onClose} style={styles.sheetCloseButton}>
      <Text style={styles.sheetCloseText}>×</Text>
    </Pressable>
  );
}

function WalletSheetLoadingState() {
  return (
    <View style={styles.walletLoadingState}>
      <ActivityIndicator color={styles.walletLoadingSpinner.color} size="large" />
      <Text style={styles.walletLoadingText}>Memuat daftar dompet...</Text>
    </View>
  );
}

function WalletSheetEditContent(props: {
  isBusy: boolean;
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  walletSheet: WalletSheetState;
}) {
  if (!props.walletSheet.selectedWallet) {
    return null;
  }

  return (
    <WalletEditContent
      isBusy={props.isBusy}
      key={props.walletSheet.selectedWallet.id}
      onChanged={props.onChanged}
      onSetMutation={props.onSetMutation}
      onSuccess={() => resetWalletSheetToList(props.walletSheet)}
      wallet={props.walletSheet.selectedWallet}
    />
  );
}

function WalletSheetListContent(props: {
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  totalAmount: string;
  walletItems: WalletItem[];
  walletSheet: WalletSheetState;
}) {
  return (
    <WalletListContent
      actionMode={props.walletSheet.actionMode}
      onCreateWallet={() => openWalletCreateView(props.walletSheet)}
      onDeleteWallet={props.onDeleteWallet}
      onEditWallet={props.onEditWallet}
      totalAmount={props.totalAmount}
      walletItems={props.walletItems}
    />
  );
}

function openWalletCreateView(walletSheet: WalletSheetState) {
  walletSheet.setActionMode('idle');
  walletSheet.setSelectedWallet(null);
  walletSheet.setView('create');
}

function openWalletEditView(walletSheet: WalletSheetState, wallet: WalletItem) {
  walletSheet.setActionMode('idle');
  walletSheet.setSelectedWallet(wallet);
  walletSheet.setView('edit');
}

function resetWalletSheetToList(walletSheet: WalletSheetState) {
  walletSheet.setActionMode('idle');
  walletSheet.setSelectedWallet(null);
  walletSheet.setView('list');
}

function WalletListContent(props: {
  actionMode: WalletActionMode;
  onCreateWallet: () => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  totalAmount: string;
  walletItems: WalletItem[];
}) {
  return (
    <>
      {!!props.walletItems.length && <TotalWalletOption amount={props.totalAmount} />}
      <WalletGrid {...props} />
      <AddWalletButton onPress={props.onCreateWallet} />
    </>
  );
}

function TotalWalletOption(props: { amount: string }) {
  return (
    <Pressable style={styles.totalWalletOption}>
      <View style={styles.totalWalletIcon}><Text style={styles.sheetIconText}>▣</Text></View>
      <View style={styles.totalWalletCopy}>
        <Text style={styles.totalWalletTitle}>Semua Dompet</Text>
        <Text style={styles.totalWalletSubtitle}>Lihat total keseluruhan</Text>
      </View>
      <Text style={styles.totalWalletAmount}>{props.amount}</Text>
    </Pressable>
  );
}

function WalletGrid(props: {
  actionMode: WalletActionMode;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  walletItems: WalletItem[];
}) {
  if (!props.walletItems.length) {
    return <WalletEmptyState />;
  }

  return (
    <View style={styles.walletGrid}>
      {props.walletItems.map(wallet => (
        <WalletOption
          actionMode={props.actionMode}
          key={wallet.id}
          onDelete={() => props.onDeleteWallet(wallet.id)}
          onEdit={() => props.onEditWallet(wallet)}
          wallet={wallet}
        />
      ))}
    </View>
  );
}

function WalletEmptyState() {
  return (
    <View style={styles.walletEmptyState}>
      <Text style={styles.walletEmptyTitle}>Belum ada dompet</Text>
      <Text style={styles.walletEmptyText}>Tambahkan dompet atau ATM pertamamu dulu.</Text>
    </View>
  );
}

function WalletOption(props: {
  actionMode: WalletActionMode;
  onDelete: () => void;
  onEdit: () => void;
  wallet: WalletItem;
}) {
  const optionStyle = styles[`${props.wallet.tone}WalletOption`];

  return (
    <Pressable style={[styles.walletOption, optionStyle]}>
      <WalletOptionOverlay {...props} />
      <WalletOptionIconBox wallet={props.wallet} />
      <WalletOptionCopy wallet={props.wallet} />
    </Pressable>
  );
}

function WalletOptionOverlay(props: {
  actionMode: WalletActionMode;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <>
      <WalletDeleteButton isVisible={props.actionMode === 'delete'} onPress={props.onDelete} />
      <WalletEditButton isVisible={props.actionMode === 'edit'} onPress={props.onEdit} />
    </>
  );
}

function WalletDeleteButton(props: { isVisible: boolean; onPress: () => void }) {
  if (!props.isVisible) {
    return null;
  }

  return <Pressable onPress={props.onPress} style={styles.walletDeleteButton}><Text style={styles.walletDeleteText}>×</Text></Pressable>;
}

function WalletEditButton(props: { isVisible: boolean; onPress: () => void }) {
  if (!props.isVisible) {
    return null;
  }

  return <Pressable onPress={props.onPress} style={styles.walletEditButton}><Text style={styles.walletEditText}>✎</Text></Pressable>;
}

function WalletOptionIconBox(props: { wallet: WalletItem }) {
  const iconStyle = styles[`${props.wallet.tone}WalletIcon`];

  return <View style={[styles.walletOptionIcon, iconStyle]}><Text style={styles.sheetIconText}>{props.wallet.icon}</Text></View>;
}

function WalletOptionCopy(props: { wallet: WalletItem }) {
  const amountStyle = styles[`${props.wallet.tone}WalletAmount`];

  return (
    <>
      <Text style={styles.walletOptionName}>{props.wallet.name}</Text>
      <Text style={[styles.walletOptionAmount, amountStyle]}>{props.wallet.amount}</Text>
    </>
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

function getWalletHeaderAction(walletItems: WalletItem[], walletSheet: WalletSheetState) {
  if (walletSheet.view !== 'list' || !walletItems.length) {
    return null;
  }

  return (
    <View style={styles.walletHeaderActions}>
      <WalletModeButton active={walletSheet.actionMode === 'edit'} icon="✎" onPress={() => toggleWalletMode(walletSheet, 'edit')} />
      <WalletModeButton active={walletSheet.actionMode === 'delete'} icon="🗑" onPress={() => toggleWalletMode(walletSheet, 'delete')} />
    </View>
  );
}

function WalletModeButton(props: { active: boolean; icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={[styles.walletTrashButton, props.active && styles.walletTrashButtonActive]}>
      <Text style={styles.walletTrashText}>{props.icon}</Text>
    </Pressable>
  );
}

function toggleWalletMode(walletSheet: WalletSheetState, mode: WalletActionMode) {
  walletSheet.setActionMode(value => (value === mode ? 'idle' : mode));
}

function WalletCreateContent(props: {
  isBusy: boolean;
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  onSuccess: () => void;
}) {
  const state = useWalletFormState();

  return (
    <View style={styles.walletForm}>
      <WalletFormFields state={state} />
      <WalletSaveButton
        isBusy={props.isBusy}
        onPress={async () => submitWalletForm(getWalletCreateSubmitParams({ ...props, state }))}
        state={state}
      />
    </View>
  );
}

function WalletEditContent(props: {
  isBusy: boolean;
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  onSuccess: () => void;
  wallet: WalletItem;
}) {
  const state = useWalletFormState(getWalletEditDefaults(props.wallet));

  return (
    <View style={styles.walletForm}>
      <WalletFormFields amountLabel="Saldo Sekarang" state={state} />
      <WalletSaveButton
        buttonLabel="Simpan Perubahan"
        isBusy={props.isBusy}
        onPress={async () => submitWalletEditState(props, state)}
        state={state}
      />
    </View>
  );
}

function WalletFormFields(props: { amountLabel?: string; state: WalletFormState }) {
  return (
    <>
      <WalletFormField label="Nama Dompet" onChangeText={props.state.setName} placeholder="BCA Saya" value={props.state.name} />
      <WalletTypeField state={props.state} />
      <WalletFormField keyboardType="number-pad" label={props.amountLabel ?? 'Saldo Awal'} onChangeText={props.state.setBalance} onFocus={props.state.focusBalance} placeholder="Rp 0" value={props.state.balance} />
    </>
  );
}

function WalletFormField(props: {
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
      <TextInput keyboardType={props.keyboardType} onChangeText={props.onChangeText} onFocus={props.onFocus} placeholder={props.placeholder} placeholderTextColor="#94A3B8" style={styles.walletFormInput} value={props.value} />
    </View>
  );
}

function WalletTypeField({ state }: { state: WalletFormState }) {
  return (
    <View style={styles.walletFormField}>
      <Text style={styles.walletFormLabel}>Tipe Dompet</Text>
      <WalletTypeOptions onSelectType={state.setSelectedType} selectedType={state.selectedType} />
    </View>
  );
}

function WalletTypeOptions(props: { onSelectType: (type: WalletType) => void; selectedType: WalletType }) {
  return (
    <View style={styles.walletTypeRow}>
      {walletTypes.map(type => <WalletTypeChip isActive={type === props.selectedType} key={type} onPress={() => props.onSelectType(type)} type={type} />)}
    </View>
  );
}

function WalletTypeChip(props: { isActive: boolean; onPress: () => void; type: WalletType }) {
  return (
    <Pressable onPress={props.onPress} style={[styles.walletTypeChip, props.isActive && styles.walletTypeChipActive]}>
      <Text style={[styles.walletTypeText, props.isActive && styles.walletTypeTextActive]}>{props.type}</Text>
    </Pressable>
  );
}

function WalletSaveButton(props: {
  buttonLabel?: string;
  isBusy: boolean;
  onPress: () => Promise<void>;
  state: WalletFormState;
}) {
  return (
    <>
      {!!props.state.errorMessage && <Text style={styles.walletFormError}>{props.state.errorMessage}</Text>}
      <Pressable
        disabled={props.isBusy}
        onPress={props.onPress}
        style={[styles.saveWalletButton, props.isBusy && styles.walletButtonDisabled]}
      >
        <Text style={styles.saveWalletButtonText}>{props.buttonLabel ?? 'Simpan Dompet'}</Text>
      </Pressable>
    </>
  );
}

function useWalletFormState(defaults?: WalletFormDefaults): WalletFormState {
  const initialValues = getWalletFormDefaults(defaults);
  const [balance, setBalance] = useState(initialValues.balance);
  const [errorMessage, setErrorMessage] = useState('');
  const [name, setName] = useState(initialValues.name);
  const [selectedType, setSelectedType] = useState<WalletType>(initialValues.selectedType);

  return {
    balance,
    errorMessage,
    focusBalance: () => setBalance(value => value || 'Rp '),
    name,
    selectedType,
    setBalance: value => setBalance(formatMoneyInput(value)),
    setErrorMessage,
    setName,
    setSelectedType,
  };
}

function getWalletFormDefaults(defaults?: WalletFormDefaults): WalletFormDefaults {
  return {
    balance: defaults?.balance ?? '',
    name: defaults?.name ?? '',
    selectedType: defaults?.selectedType ?? 'Bank',
  };
}

function getWalletEditDefaults(wallet: WalletItem): WalletFormDefaults {
  return {
    balance: formatMoneyInput(String(wallet.balance)),
    name: wallet.name,
    selectedType: wallet.selectedType,
  };
}

function getWalletTypePayload(type: WalletType): Pick<CreateWalletPayload, 'color' | 'icon' | 'type'> {
  if (type === 'E-Wallet') return { color: '#EE2B6C', icon: 'qr_code_2', type: 'EWALLET' };
  if (type === 'Cash') return { color: '#FBCF33', icon: 'payments', type: 'CASH' };
  if (type === 'Savings') return { color: '#A29BFE', icon: 'savings', type: 'SAVINGS' };
  if (type === 'Other') return { color: '#4EA8DE', icon: 'account_balance_wallet', type: 'OTHER' };

  return { color: '#4EA8DE', icon: 'account_balance', type: 'BANK' };
}

function getWalletSubmitPayload(params: WalletFormDefaults): CreateWalletPayload {
  return {
    ...getWalletTypePayload(params.selectedType),
    initialBalance: parseWalletBalance(params.balance),
    name: params.name.trim(),
  };
}

function getWalletUpdatePayload(params: WalletFormDefaults): UpdateWalletPayload {
  return {
    ...getWalletTypePayload(params.selectedType),
    balance: parseWalletBalance(params.balance),
    name: params.name.trim(),
  };
}

function getWalletCreateSubmitParams(props: {
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  onSuccess: () => void;
  state: WalletFormState;
}) {
  return getWalletSubmitActionParams(props);
}

function getWalletEditSubmitParams(props: {
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  onSuccess: () => void;
  state: WalletFormState;
  walletId: string;
}) {
  return { ...getWalletSubmitActionParams(props), walletId: props.walletId };
}

function getWalletSubmitActionParams(props: {
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  onSuccess: () => void;
  state: WalletFormState;
}) {
  return {
    balance: props.state.balance,
    name: props.state.name,
    onChanged: props.onChanged,
    onSetMutation: props.onSetMutation,
    onSuccess: props.onSuccess,
    selectedType: props.state.selectedType,
    setErrorMessage: props.state.setErrorMessage,
  };
}

async function submitWalletForm(params: WalletFormDefaults & {
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  onSuccess: () => void;
  setErrorMessage: (message: string) => void;
}) {
  const token = await getAuthToken();
  if (!isWalletFormValid({ ...params, token }) || !token) return;

  try {
    params.onSetMutation(true, 'Menyimpan dompet...');
    await createWallet(token, getWalletSubmitPayload(params));
    handleWalletMutationSuccess(params);
  } catch (error) {
    params.setErrorMessage(getWalletMutationErrorMessage(error, 'Gagal menyimpan dompet.'));
  } finally {
    params.onSetMutation(false, '');
  }
}

async function submitWalletEditForm(params: WalletFormDefaults & {
  onChanged: () => void;
  onSetMutation: (value: boolean, label: string) => void;
  onSuccess: () => void;
  setErrorMessage: (message: string) => void;
  walletId: string;
}) {
  const token = await getAuthToken();
  if (!isWalletFormValid({ ...params, token }) || !token) return;

  try {
    params.onSetMutation(true, 'Menyimpan perubahan dompet...');
    await updateWallet(token, params.walletId, getWalletUpdatePayload(params));
    handleWalletMutationSuccess(params);
  } catch (error) {
    params.setErrorMessage(getWalletMutationErrorMessage(error, 'Gagal memperbarui dompet.'));
  } finally {
    params.onSetMutation(false, '');
  }
}

function submitWalletEditState(
  props: {
    onChanged: () => void;
    onSetMutation: (value: boolean, label: string) => void;
    onSuccess: () => void;
    wallet: WalletItem;
  },
  state: WalletFormState,
) {
  return submitWalletEditForm(getWalletEditSubmitParams({ ...props, state, walletId: props.wallet.id }));
}

function handleWalletMutationSuccess(params: { onChanged: () => void; onSuccess: () => void }) {
  params.onChanged();
  params.onSuccess();
}

function getWalletMutationErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function isWalletFormValid(params: {
  name: string;
  setErrorMessage: (message: string) => void;
  token: string | null;
}) {
  const isValid = !!params.token && params.name.trim().length >= 2;
  if (!isValid) params.setErrorMessage('Nama dompet minimal 2 karakter.');

  return isValid;
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

  return digits ? `Rp ${Number(digits).toLocaleString('id-ID')}` : '';
}

function getWalletDeleteHandler(
  removeWallet: (walletId: string) => void,
  onChanged: () => void,
  onSetMutation: (value: boolean, label: string) => void,
) {
  return async (walletId: string) => {
    try {
      onSetMutation(true, 'Menghapus dompet...');
      await handleDeleteWallet(walletId);
      removeWallet(walletId);
      onChanged();
    } catch {
      onChanged();
    } finally {
      onSetMutation(false, '');
    }
  };
}

async function handleDeleteWallet(walletId: string) {
  const token = await getAuthToken();

  if (token) {
    await deleteWallet(token, walletId);
  }
}

function getWalletChangedHandler(
  setRefreshKey: (setter: (value: number) => number) => void,
  onChanged: () => void,
) {
  return () => {
    setRefreshKey(value => value + 1);
    onChanged();
  };
}

function getWalletSheetTitle(view: WalletSheetView) {
  if (view === 'create') return 'Tambah Dompet 💳';
  if (view === 'edit') return 'Edit Dompet ✏️';

  return 'Pilih Dompet 👛';
}

function getWalletTone(wallet: Wallet): WalletTone {
  if (wallet.type === 'EWALLET') return 'primary';
  if (wallet.type === 'SAVINGS') return 'purple';

  return wallet.type === 'CASH' ? 'yellow' : 'blue';
}

function getWalletIcon(wallet: Wallet) {
  if (wallet.type === 'EWALLET') return '▦';
  if (wallet.type === 'SAVINGS') return '★';

  return wallet.type === 'CASH' ? '▤' : '▥';
}

function getWalletFormType(wallet: Wallet): WalletType {
  if (wallet.type === 'EWALLET') return 'E-Wallet';
  if (wallet.type === 'CASH') return 'Cash';
  if (wallet.type === 'SAVINGS') return 'Savings';
  if (wallet.type === 'OTHER') return 'Other';

  return 'Bank';
}

function mapWalletToItem(wallet: Wallet): WalletItem {
  return {
    amount: wallet.formattedBalance,
    balance: wallet.balance,
    icon: getWalletIcon(wallet),
    id: wallet.id,
    name: wallet.name,
    selectedType: getWalletFormType(wallet),
    tone: getWalletTone(wallet),
  };
}

async function fetchWalletItems() {
  const token = await getAuthToken();
  if (!token) return [];

  const response = await getWallets(token);

  return response.data.map(mapWalletToItem);
}

function useWalletItems(visible: boolean, refreshKey: number) {
  const [isFetching, setFetching] = useState(false);
  const [items, setItems] = useState<WalletItem[]>([]);
  const remove = (walletId: string) => setItems(value => value.filter(item => item.id !== walletId));

  useEffect(() => {
    if (visible) {
      loadWalletItems({
        setFetching,
        setItems,
      }).catch(() => undefined);
    }
  }, [refreshKey, visible]);

  return {
    isFetching,
    items,
    remove,
  };
}

async function loadWalletItems(props: {
  setFetching: (value: boolean) => void;
  setItems: (items: WalletItem[]) => void;
}) {
  try {
    props.setFetching(true);
    props.setItems(await fetchWalletItems());
  } catch {
    props.setItems([]);
  } finally {
    props.setFetching(false);
  }
}

function createWalletMutationStateSetter(
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

export default DashboardWalletAssets;
