import { apiRequest } from '../Api/apiClient';

import type {
  CreateWalletPayload,
  UpdateWalletPayload,
  Wallet,
} from './wallets.types';

function getWallets(token: string) {
  return apiRequest<Wallet[]>('/wallets', {
    method: 'GET',
    token,
  });
}

function createWallet(token: string, payload: CreateWalletPayload) {
  return apiRequest<Wallet>('/wallets', {
    body: payload,
    method: 'POST',
    token,
  });
}

function updateWallet(token: string, walletId: string, payload: UpdateWalletPayload) {
  return apiRequest<Wallet>(`/wallets/${walletId}`, {
    body: payload,
    method: 'PATCH',
    token,
  });
}

function deleteWallet(token: string, walletId: string) {
  return apiRequest<void>(`/wallets/${walletId}`, {
    method: 'DELETE',
    token,
  });
}

export {
  createWallet,
  deleteWallet,
  getWallets,
  updateWallet,
};
