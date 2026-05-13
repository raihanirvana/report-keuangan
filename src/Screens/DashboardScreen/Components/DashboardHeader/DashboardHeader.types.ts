import type { AuthUser } from '../../../../Services';

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

export type {
  DashboardHeaderProps,
  EditNameSheetProps,
};
