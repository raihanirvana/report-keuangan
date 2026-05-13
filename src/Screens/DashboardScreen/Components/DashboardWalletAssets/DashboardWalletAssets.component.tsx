import {
  type ReactNode,
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
  onOpenWalletSheet: () => void;
  selectedWalletName: string;
}) {
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

function WalletBottomSheet(props: {
  onChanged: () => void;
  onClose: () => void;
  totalAmount: string;
  visible: boolean;
}) {
  const renderContent = useWalletBottomSheetContent(props);

  return (
    <BottomSheet containerStyle={styles.sheetContainer} onClose={props.onClose} visible={props.visible}>
      {renderContent}
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
  const handleDelete = getWalletDeleteHandler(walletItems.remove, handleChanged);

  return ({ dragHandleProps }: { dragHandleProps: BottomSheetDragHandleProps }) => (
    <WalletSheetContent
      dragHandleProps={dragHandleProps}
      onChanged={handleChanged}
      onClose={props.onClose}
      onDeleteWallet={handleDelete}
      totalAmount={props.totalAmount}
      walletItems={walletItems.items}
    />
  );
}

function WalletSheetContent(props: {
  dragHandleProps: BottomSheetDragHandleProps;
  onChanged: () => void;
  onClose: () => void;
  onDeleteWallet: (walletId: string) => void;
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
  onClose: () => void;
  walletItems: WalletItem[];
  walletSheet: WalletSheetState;
}) {
  return (
    <WalletSheetHeader
      dragHandleProps={props.dragHandleProps}
      onBack={() => resetWalletSheetToList(props.walletSheet)}
      onClose={props.onClose}
      walletItems={props.walletItems}
      walletSheet={props.walletSheet}
    />
  );
}

function WalletSheetHeader(props: {
  dragHandleProps: BottomSheetDragHandleProps;
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
      onClose={props.onClose}
      onGoBack={props.onBack}
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

function WalletSheetCurrentContent(props: {
  onChanged: () => void;
  onDeleteWallet: (walletId: string) => void;
  onEditWallet: (wallet: WalletItem) => void;
  totalAmount: string;
  walletItems: WalletItem[];
  walletSheet: WalletSheetState;
}) {
  if (props.walletSheet.view === 'create') {
    return <WalletCreateContent onChanged={props.onChanged} onSuccess={() => resetWalletSheetToList(props.walletSheet)} />;
  }

  if (props.walletSheet.view === 'edit') {
    return <WalletSheetEditContent {...props} />;
  }

  return <WalletSheetListContent {...props} />;
}

function WalletSheetEditContent(props: {
  onChanged: () => void;
  walletSheet: WalletSheetState;
}) {
  if (!props.walletSheet.selectedWallet) {
    return null;
  }

  return (
    <WalletEditContent
      key={props.walletSheet.selectedWallet.id}
      onChanged={props.onChanged}
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

function WalletCreateContent(props: { onChanged: () => void; onSuccess: () => void }) {
  const state = useWalletFormState();

  return (
    <View style={styles.walletForm}>
      <WalletFormFields state={state} />
      <WalletSaveButton onPress={async () => submitWalletForm(getWalletCreateSubmitParams({ ...props, state }))} state={state} />
    </View>
  );
}

function WalletEditContent(props: {
  onChanged: () => void;
  onSuccess: () => void;
  wallet: WalletItem;
}) {
  const state = useWalletFormState(getWalletEditDefaults(props.wallet));

  return (
    <View style={styles.walletForm}>
      <WalletFormFields amountLabel="Saldo Sekarang" state={state} />
      <WalletSaveButton buttonLabel="Simpan Perubahan" onPress={async () => submitWalletEditState(props, state)} state={state} />
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

function WalletSaveButton(props: { buttonLabel?: string; onPress: () => Promise<void>; state: WalletFormState }) {
  return (
    <>
      {!!props.state.errorMessage && <Text style={styles.walletFormError}>{props.state.errorMessage}</Text>}
      <Pressable onPress={props.onPress} style={styles.saveWalletButton}>
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

function getWalletCreateSubmitParams(props: { onChanged: () => void; onSuccess: () => void; state: WalletFormState }) {
  return getWalletSubmitActionParams(props);
}

function getWalletEditSubmitParams(props: { onChanged: () => void; onSuccess: () => void; state: WalletFormState; walletId: string }) {
  return { ...getWalletSubmitActionParams(props), walletId: props.walletId };
}

function getWalletSubmitActionParams(props: { onChanged: () => void; onSuccess: () => void; state: WalletFormState }) {
  return {
    balance: props.state.balance,
    name: props.state.name,
    onChanged: props.onChanged,
    onSuccess: props.onSuccess,
    selectedType: props.state.selectedType,
    setErrorMessage: props.state.setErrorMessage,
  };
}

async function submitWalletForm(params: WalletFormDefaults & {
  onChanged: () => void;
  onSuccess: () => void;
  setErrorMessage: (message: string) => void;
}) {
  const token = await getAuthToken();
  if (!isWalletFormValid({ ...params, token }) || !token) return;

  try {
    await createWallet(token, getWalletSubmitPayload(params));
    handleWalletMutationSuccess(params);
  } catch (error) {
    params.setErrorMessage(getWalletMutationErrorMessage(error, 'Gagal menyimpan dompet.'));
  }
}

async function submitWalletEditForm(params: WalletFormDefaults & {
  onChanged: () => void;
  onSuccess: () => void;
  setErrorMessage: (message: string) => void;
  walletId: string;
}) {
  const token = await getAuthToken();
  if (!isWalletFormValid({ ...params, token }) || !token) return;

  try {
    await updateWallet(token, params.walletId, getWalletUpdatePayload(params));
    handleWalletMutationSuccess(params);
  } catch (error) {
    params.setErrorMessage(getWalletMutationErrorMessage(error, 'Gagal memperbarui dompet.'));
  }
}

function submitWalletEditState(
  props: { onChanged: () => void; onSuccess: () => void; wallet: WalletItem },
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

function getWalletDeleteHandler(removeWallet: (walletId: string) => void, onChanged: () => void) {
  return (walletId: string) => {
    removeWallet(walletId);
    handleDeleteWallet(walletId).then(onChanged).catch(onChanged);
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
  const [items, setItems] = useState<WalletItem[]>([]);
  const remove = (walletId: string) => setItems(value => value.filter(item => item.id !== walletId));

  useEffect(() => {
    if (visible) loadWalletItems(setItems).catch(() => undefined);
  }, [refreshKey, visible]);

  return { items, remove };
}

async function loadWalletItems(setItems: (items: WalletItem[]) => void) {
  try {
    setItems(await fetchWalletItems());
  } catch {
    setItems([]);
  }
}

export default DashboardWalletAssets;
