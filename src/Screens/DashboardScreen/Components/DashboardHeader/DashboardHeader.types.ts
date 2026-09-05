import type { AuthUser } from '../../../../Services';

type DashboardHeaderProps = {
  onLogout: () => Promise<void>;
  onUpdateName: (name: string) => Promise<void>;
  user?: AuthUser | null;
};

type EditNameSheetProps = {
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void> | void;
  visible: boolean;
};

export type {
  DashboardHeaderProps,
  EditNameSheetProps,
};
