import type {
  Dispatch,
  SetStateAction,
} from 'react';

import type { DashboardSummary } from '../../../../Services';
import type {
  WalletActionMode,
  WalletItem,
  WalletSheetView,
} from '../../DashboardScreen.types';

type DashboardWalletAssetsProps = {
  dashboardSummary: DashboardSummary | null;
  onChanged: () => void;
};

type WalletSheetState = {
  actionMode: WalletActionMode;
  selectedWallet: WalletItem | null;
  setActionMode: Dispatch<SetStateAction<WalletActionMode>>;
  setSelectedWallet: Dispatch<SetStateAction<WalletItem | null>>;
  setView: Dispatch<SetStateAction<WalletSheetView>>;
  view: WalletSheetView;
};

export type {
  DashboardWalletAssetsProps,
  WalletSheetState,
};
