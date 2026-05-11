import { apiRequest } from '../Api/apiClient';

import type { CreateWalletPayload, Wallet } from './wallets.types';

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
};
