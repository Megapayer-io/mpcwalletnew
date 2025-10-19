import { create } from 'zustand';
import { EvmWallet, Network, SendEthParams, SendErc20Params, TokenBalanceParams } from '@evm-wallet/sdk';

interface WalletStore {
  // State
  wallet: EvmWallet | null;
  isInitialized: boolean;
  hasWallet: boolean;
  isUnlocked: boolean;
  address: string | null;
  currentNetwork: Network | null;
  networks: Network[];
  balance: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => void;
  createWallet: () => Promise<{ mnemonic: string; address: string }>;
  importWallet: (mnemonic: string) => Promise<{ mnemonic: string; address: string }>;
  lock: () => void;
  unlock: (password: string) => Promise<void>;
  saveKeystore: (mnemonic: string, password: string) => Promise<void>;
  addNetwork: (network: Omit<Network, 'chainId'> & { chainId: number }) => void;
  selectNetwork: (chainId: number) => void;
  getBalance: (address?: string) => Promise<string>;
  sendEth: (params: SendEthParams) => Promise<string>;
  sendErc20: (params: SendErc20Params) => Promise<string>;
  getTokenBalance: (params: TokenBalanceParams) => Promise<string>;
  clearError: () => void;
  logout: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  wallet: null,
  isInitialized: false,
  hasWallet: false,
  isUnlocked: false,
  address: null,
  currentNetwork: null,
  networks: [],
  balance: null,
  isLoading: false,
  error: null,

  // Actions
  initialize: () => {
    const wallet = new EvmWallet();
    wallet.loadState();
    
    set({
      wallet,
      isInitialized: true,
      hasWallet: wallet.hasKeystore(),
      isUnlocked: wallet.isUnlocked(),
      address: wallet.getAddress() || null,
      currentNetwork: wallet.getCurrentNetwork() || null,
      networks: wallet.listNetworks(),
    });
  },

  createWallet: async () => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const result = await wallet.createWallet();
      set({
        isUnlocked: true,
        address: result.address,
        isLoading: false,
      });
      return result;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create wallet',
        isLoading: false 
      });
      throw error;
    }
  },

  importWallet: async (mnemonic: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const result = await wallet.importFromMnemonic(mnemonic);
      set({
        isUnlocked: true,
        address: result.address,
        isLoading: false,
      });
      return result;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to import wallet',
        isLoading: false 
      });
      throw error;
    }
  },

  lock: () => {
    const { wallet } = get();
    if (!wallet) return;

    wallet.lock();
    set({
      isUnlocked: false,
      address: null,
    });
  },

  unlock: async (password: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      await wallet.unlock(password);
      set({
        isUnlocked: true,
        address: wallet.getAddress() || null,
        currentNetwork: wallet.getCurrentNetwork() || null,
        networks: wallet.listNetworks(),
        isLoading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to unlock wallet',
        isLoading: false 
      });
      throw error;
    }
  },

  saveKeystore: async (mnemonic: string, password: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      await wallet.saveKeystore(mnemonic, password);
      set({ 
        hasWallet: true,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save keystore',
        isLoading: false 
      });
      throw error;
    }
  },

  addNetwork: (network) => {
    const { wallet } = get();
    if (!wallet) return;

    try {
      wallet.addNetwork(network);
      set({
        networks: wallet.listNetworks(),
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add network'
      });
    }
  },

  selectNetwork: (chainId: number) => {
    const { wallet } = get();
    if (!wallet) return;

    try {
      wallet.selectNetwork(chainId);
      set({
        currentNetwork: wallet.getCurrentNetwork() || null,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to select network'
      });
    }
  },

  getBalance: async (address?: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const balance = await wallet.getBalance(address);
      set({
        balance,
        isLoading: false,
      });
      return balance;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get balance',
        isLoading: false 
      });
      throw error;
    }
  },

  sendEth: async (params: SendEthParams) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const hash = await wallet.sendEth(params);
      set({ isLoading: false });
      return hash;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send ETH',
        isLoading: false 
      });
      throw error;
    }
  },

  sendErc20: async (params: SendErc20Params) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const hash = await wallet.sendErc20(params);
      set({ isLoading: false });
      return hash;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send token',
        isLoading: false 
      });
      throw error;
    }
  },

  getTokenBalance: async (params: TokenBalanceParams) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const balance = await wallet.getTokenBalance(params);
      set({ isLoading: false });
      return balance;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get token balance',
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  logout: () => {
    const { wallet } = get();
    if (!wallet) return;

    wallet.clearStorage();
    set({
      hasWallet: false,
      isUnlocked: false,
      address: null,
      currentNetwork: null,
      networks: wallet.listNetworks(),
      balance: null,
      error: null,
    });
  },
}));
