import type { AuthUser } from '../../../../Services';

type DashboardHeaderProps = {
  onLogout?: () => Promise<void> | void;
  onUpdateUser?: (user: AuthUser) => Promise<void> | void;
  user?: AuthUser | null;
};

type EditNameSheetProps = {
  currentName: string;
  isLoading?: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void> | void;
  visible: boolean;
};

export type {
  DashboardHeaderProps,
  EditNameSheetProps,
};
