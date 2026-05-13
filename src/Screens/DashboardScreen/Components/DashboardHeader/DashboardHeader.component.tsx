import { useState } from 'react';
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
import type { AuthUser } from '../../../../Services';

import styles from './DashboardHeader.styles';

type DashboardHeaderProps = {
  onLogout?: () => void;
  onUpdateUser?: (user: AuthUser) => void;
  user?: AuthUser | null;
};

type EditNameSheetProps = {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  visible: boolean;
};

function getDisplayName(user?: AuthUser | null) {
  return user?.name?.trim() || 'Sahabat Cuan';
}

function getInitial(displayName: string) {
  return displayName.trim().charAt(0).toUpperCase() || 'K';
}

function DashboardHeader(props: DashboardHeaderProps) {
  const [isEditVisible, setEditVisible] = useState(false);
  const displayName = getDisplayName(props.user);
  const handleSaveName = createSaveHeaderNameHandler(props.user, props.onUpdateUser, () => setEditVisible(false));

  return (
    <>
      <View style={styles.header}>
        <HeaderIntro displayName={displayName} />
        <HeaderActions onEdit={() => setEditVisible(true)} onLogout={props.onLogout} />
      </View>
      <EditNameSheet
        currentName={displayName}
        onClose={() => setEditVisible(false)}
        onSave={handleSaveName}
        visible={isEditVisible}
      />
    </>
  );
}

function createSaveHeaderNameHandler(
  user: AuthUser | null | undefined,
  onUpdateUser: DashboardHeaderProps['onUpdateUser'],
  onDone: () => void,
) {
  return (name: string) => {
    if (user) {
      onUpdateUser?.({ ...user, name });
    }
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
  return (
    <BottomSheet
      containerStyle={styles.sheet}
      onClose={props.onClose}
      visible={props.visible}
    >
      {({ dragHandleProps }) => (
        <EditNameSheetContent
          {...props}
          dragHandleProps={dragHandleProps}
          key={`${props.visible ? 'open' : 'closed'}-${props.currentName}`}
        />
      )}
    </BottomSheet>
  );
}

function EditNameSheetContent(props: EditNameSheetProps & { dragHandleProps: BottomSheetDragHandleProps }) {
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
        onClose={props.onClose}
        onSave={() => saveName(name, props.onSave, setErrorMessage)}
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
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.formActions}>
      <Pressable onPress={props.onClose} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Batal</Text>
      </Pressable>
      <Pressable onPress={props.onSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Simpan</Text>
      </Pressable>
    </View>
  );
}

function saveName(
  name: string,
  onSave: (name: string) => void,
  setErrorMessage: (message: string) => void,
) {
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    setErrorMessage('Nama minimal 2 karakter ya.');

    return;
  }

  onSave(trimmedName);
}

export default DashboardHeader;
