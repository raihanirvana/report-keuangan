import { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';

import styles from './DashboardHeader.styles';

function LogoutConfirmModal(props: {
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  visible: boolean;
}) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <Modal transparent visible={props.visible} onRequestClose={isSubmitting ? undefined : props.onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {Boolean(errorMessage) && <Text style={styles.errorText}>{errorMessage}</Text>}
          <LogoutConfirmContent
            isSubmitting={isSubmitting}
            onCancel={props.onCancel}
            onConfirm={createLogoutSubmitHandler(props.onConfirm, setSubmitting, setErrorMessage)}
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
  setErrorMessage: (value: string) => void,
) {
  return async () => {
    try {
      setErrorMessage('');
      setSubmitting(true);
      await onConfirm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Gagal keluar. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };
}

export default LogoutConfirmModal;
