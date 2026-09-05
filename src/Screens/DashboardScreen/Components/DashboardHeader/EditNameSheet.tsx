import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BottomSheet, type BottomSheetDragHandleProps } from '../../../../Components/BottomSheet';

import styles from './DashboardHeader.styles';
import type { EditNameSheetProps } from './DashboardHeader.types';

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
  const form = useNameForm(props.currentName);

  return (
    <>
      <View style={styles.handle} {...props.dragHandleProps} />
      <EditNameTitle />
      <EditNameField name={form.name} onChangeName={form.onChangeName} />
      {Boolean(form.errorMessage) && <Text style={styles.errorText}>{form.errorMessage}</Text>}
      <EditNameActions
        isDisabled={props.isSaving}
        onClose={props.onClose}
        onSave={() => saveName(form.name, props.onSave, form.setErrorMessage, props.setSaving)}
      />
    </>
  );
}

function useNameForm(currentName: string) {
  const [name, setName] = useState(currentName);
  const [errorMessage, setErrorMessage] = useState('');
  const onChangeName = (value: string) => {
    setName(value);
    setErrorMessage('');
  };

  return {
    name,
    errorMessage,
    setErrorMessage,
    onChangeName,
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
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'Nama gagal disimpan. Coba lagi.');
  } finally {
    setSaving(false);
  }
}

export default EditNameSheet;
