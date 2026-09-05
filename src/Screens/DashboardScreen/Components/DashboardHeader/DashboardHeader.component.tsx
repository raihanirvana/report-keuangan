import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import styles from './DashboardHeader.styles';
import type { DashboardHeaderProps } from './DashboardHeader.types';
import EditNameSheet from './EditNameSheet';
import LogoutConfirmModal from './LogoutConfirmModal';

function getInitial(displayName: string) {
  return Array.from(displayName)[0]?.toUpperCase() || 'K';
}

function DashboardHeader(props: DashboardHeaderProps) {
  const actions = useHeaderActions(props);
  const displayName = props.user?.name.trim() || 'Sahabat Cuan';

  return (
    <>
      <View style={styles.header}>
        <HeaderIntro displayName={displayName} />
        <HeaderActions onEdit={actions.openEdit} onLogout={actions.openLogout} />
      </View>
      {actions.activeSheet === 'edit' && (
        <EditNameSheet
          currentName={props.user?.name ?? ''} onClose={actions.closeSheet}
          onSave={actions.saveName} visible
        />
      )}
      {actions.activeSheet === 'logout' && (
        <LogoutConfirmModal onCancel={actions.closeSheet} onConfirm={props.onLogout} visible />
      )}
    </>
  );
}

function useHeaderActions(props: DashboardHeaderProps) {
  const [activeSheet, setActiveSheet] = useState<'edit' | 'logout' | null>(null);
  const closeSheet = () => setActiveSheet(null);
  const saveName = async (name: string) => {
    await props.onUpdateName(name);
    closeSheet();
  };

  return {
    activeSheet,
    closeSheet,
    openEdit: () => setActiveSheet('edit'),
    openLogout: () => setActiveSheet('logout'),
    saveName,
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

function HeaderActions(props: { onEdit: () => void; onLogout: () => void }) {
  return (
    <View style={styles.actionGroup}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit nama"
        onPress={props.onEdit}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>✎</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
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

export default DashboardHeader;
