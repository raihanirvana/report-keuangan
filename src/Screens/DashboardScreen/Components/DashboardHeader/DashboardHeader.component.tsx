import { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  BottomSheet,
  type BottomSheetDragHandleProps,
} from '../../../../Components/BottomSheet';
import type { AuthUser } from '../../../../Services';

import styles from './DashboardHeader.styles';
import type {
  DashboardHeaderProps,
  EditNameSheetProps,
} from './DashboardHeader.types';

function getDisplayName(user?: AuthUser | null) {
  return user?.name?.trim() || 'Sahabat Cuan';
}

function getInitial(displayName: string) {
  return displayName.trim().charAt(0).toUpperCase() || 'K';
}

function DashboardHeader(props: DashboardHeaderProps) {
  const headerState = useDashboardHeaderViewModel(props);

  return (
    <>
      <View style={styles.header}>
        <HeaderIntro displayName={headerState.displayName} />
        <HeaderActions
          onEdit={headerState.state.openEdit}
          onLogout={headerState.state.openLogout}
        />
      </View>
      <DashboardHeaderSheets
        currentName={headerState.displayName}
        handleConfirmLogout={headerState.handleConfirmLogout}
        handleSaveName={headerState.handleSaveName}
        state={headerState.state}
      />
    </>
  );
}

function useDashboardHeaderViewModel(props: DashboardHeaderProps) {
  const state = useDashboardHeaderState();
  const displayName = getDisplayName(props.user);

  return {
    displayName,
    handleConfirmLogout: createConfirmLogoutHandler(props.onLogout, state.closeLogout),
    handleSaveName: createSaveHeaderNameHandler(
      props.user,
      props.onUpdateUser,
      state.closeEdit,
    ),
    state,
  };
}

function useDashboardHeaderState() {
  const [isEditVisible, setEditVisible] = useState(false);
  const [isLogoutVisible, setLogoutVisible] = useState(false);

  return {
    closeEdit: () => setEditVisible(false),
    closeLogout: () => setLogoutVisible(false),
    isEditVisible,
    isLogoutVisible,
    openEdit: () => setEditVisible(true),
    openLogout: () => setLogoutVisible(true),
  };
}

function DashboardHeaderSheets(props: {
  currentName: string;
  handleConfirmLogout: () => Promise<void>;
  handleSaveName: (name: string) => Promise<void>;
  state: ReturnType<typeof useDashboardHeaderState>;
}) {
  return (
    <>
      <EditNameSheet
        currentName={props.currentName}
        onClose={props.state.closeEdit}
        onSave={props.handleSaveName}
        visible={props.state.isEditVisible}
      />
      <LogoutConfirmModal
        onCancel={props.state.closeLogout}
        onConfirm={props.handleConfirmLogout}
        visible={props.state.isLogoutVisible}
      />
    </>
  );
}

function createSaveHeaderNameHandler(
  user: AuthUser | null | undefined,
  onUpdateUser: DashboardHeaderProps['onUpdateUser'],
  onDone: () => void,
) {
  return async (name: string) => {
    if (user) {
      await onUpdateUser?.({ ...user, name });
    }
    onDone();
  };
}

function createConfirmLogoutHandler(
  onLogout: DashboardHeaderProps['onLogout'],
  onDone: () => void,
) {
  return async () => {
    await onLogout?.();
    onDone();
  };
}

function HeaderIntro({ displayName }: { displayName: string }) {
  return (
    <View style={styles.intro}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(displayName)}</Text>
      </View>
      <View style={styles.nameBlock}>
        <Text style={styles.hello}>HALO, KAK!</Text>
        <Text numberOfLines={1} style={styles.name}>{displayName} ✨</Text>
      </View>
    </View>
  );
}

function HeaderActions(props: {
  onEdit: () => void;
  onLogout?: () => void;
}) {
  return (
    <View style={styles.actionGroup}>
      <Pressable
        accessibilityLabel="Edit nama"
        onPress={props.onEdit}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>✎</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Logout"
        onPress={props.onLogout}
        style={styles.logoutButton}
      >
        <HeaderLogoutIcon />
        <Text style={styles.logoutText}>Keluar</Text>
      </Pressable>
    </View>
  );
}

function HeaderLogoutIcon() {
  return (
    <View style={styles.logoutIcon}>
      <Text style={styles.logoutArrow}>↗</Text>
    </View>
  );
}

function EditNameSheet(props: EditNameSheetProps) {
  const [isSaving, setSaving] = useState(false);

  return (
    <BottomSheet
      containerStyle={styles.sheet}
      disableClose={isSaving}
      isLoading={isSaving}
      loadingLabel="Menyimpan nama..."
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <EditNameSheetContent
          {...props}
          dragHandleProps={dragHandleProps}
          isSaving={isSaving}
          key={`${props.visible ? 'open' : 'closed'}-${props.currentName}`}
          setSaving={setSaving}
        />
      )}
    </BottomSheet>
  );
}

function EditNameSheetContent(
  props: EditNameSheetProps & {
    dragHandleProps: BottomSheetDragHandleProps;
    isSaving: boolean;
    setSaving: (value: boolean) => void;
  },
) {
  const [name, setName] = useState(props.currentName);
  const [errorMessage, setErrorMessage] = useState('');
  const onChangeName = createChangeNameHandler(setName, setErrorMessage);

  return (
    <>
      <View style={styles.handle} {...props.dragHandleProps} />
      <EditNameTitle />
      <EditNameField name={name} onChangeName={onChangeName} />
      {Boolean(errorMessage) && <Text style={styles.errorText}>{errorMessage}</Text>}
      <EditNameActions
        isDisabled={props.isSaving}
        onClose={props.onClose}
        onSave={() => saveName(name, props.onSave, setErrorMessage, props.setSaving)}
      />
    </>
  );
}

function createChangeNameHandler(
  setName: (value: string) => void,
  setErrorMessage: (message: string) => void,
) {
  return (value: string) => {
    setName(value);
    setErrorMessage('');
  };
}

function EditNameTitle() {
  return (
    <>
      <Text style={styles.sheetTitle}>Edit Nama ✨</Text>
      <Text style={styles.sheetSubtitle}>
        Nama ini dipakai untuk sapaan di dashboard kamu.
      </Text>
    </>
  );
}

function EditNameField(props: {
  name: string;
  onChangeName: (name: string) => void;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>Nama</Text>
      <TextInput
        autoCapitalize="words"
        onChangeText={props.onChangeName}
        placeholder="Nama kamu"
        style={styles.formInput}
        value={props.name}
      />
    </View>
  );
}

function EditNameActions(props: {
  isDisabled: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.formActions}>
      <Pressable
        disabled={props.isDisabled}
        onPress={props.onClose}
        style={[styles.cancelButton, props.isDisabled && styles.disabledButton]}
      >
        <Text style={styles.cancelButtonText}>Batal</Text>
      </Pressable>
      <Pressable
        disabled={props.isDisabled}
        onPress={props.onSave}
        style={[styles.saveButton, props.isDisabled && styles.disabledButton]}
      >
        <Text style={styles.saveButtonText}>Simpan</Text>
      </Pressable>
    </View>
  );
}

async function saveName(
  name: string,
  onSave: (name: string) => Promise<void> | void,
  setErrorMessage: (message: string) => void,
  setSaving: (value: boolean) => void,
) {
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    setErrorMessage('Nama minimal 2 karakter ya.');

    return;
  }

  try {
    setSaving(true);
    await onSave(trimmedName);
  } finally {
    setSaving(false);
  }
}

function LogoutConfirmModal(props: {
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  visible: boolean;
}) {
  const [isSubmitting, setSubmitting] = useState(false);

  return (
    <Modal transparent visible={props.visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <LogoutConfirmContent
            isSubmitting={isSubmitting}
            onCancel={props.onCancel}
            onConfirm={createLogoutSubmitHandler(props.onConfirm, setSubmitting)}
          />
        </View>
      </View>
    </Modal>
  );
}

function LogoutConfirmContent(props: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <>
      <LogoutConfirmCopy />
      <LogoutConfirmButtons {...props} />
    </>
  );
}

function LogoutConfirmCopy() {
  return (
    <>
      <Text style={styles.modalTitle}>Keluar dari akun?</Text>
      <Text style={styles.modalText}>
        Kamu perlu login lagi kalau mau masuk ke aplikasi ini.
      </Text>
    </>
  );
}

function LogoutConfirmButtons(props: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <View style={styles.modalActions}>
      <Pressable
        disabled={props.isSubmitting}
        onPress={props.onCancel}
        style={[styles.modalSecondaryButton, props.isSubmitting && styles.disabledButton]}
      >
        <Text style={styles.modalSecondaryButtonText}>Batal</Text>
      </Pressable>
      <Pressable
        disabled={props.isSubmitting}
        onPress={props.onConfirm}
        style={[styles.modalPrimaryButton, props.isSubmitting && styles.disabledButton]}
      >
        <Text style={styles.modalPrimaryButtonText}>Ya, Keluar</Text>
      </Pressable>
    </View>
  );
}

function createLogoutSubmitHandler(
  onConfirm: () => Promise<void>,
  setSubmitting: (value: boolean) => void,
) {
  return async () => {
    try {
      setSubmitting(true);
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };
}

export default DashboardHeader;
