'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Mock types for development
interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl?: string;
  symbol?: string;
  explorerUrl?: string;
  color?: string;
}

interface Account {
  address: string;
  name: string;
  isImported?: boolean;
  privateKey?: string;
}

// Mock Wallet class for development
class Wallet {
  async initialize() {
    // Mock initialization
  }
  
  async unlock(password: string) {
    // Mock unlock - accept any password for demo
    if (!password) {
      throw new Error('Password is required');
    }
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  createAccount(name?: string): Account {
    return {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      name: name || 'Account 1',
      isImported: false
    };
  }
  
  async importAccount(privateKey: string, name?: string): Promise<Account> {
    return {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      name: name || 'Imported Account',
      isImported: true,
      privateKey
    };
  }
  
  async importWallet(mnemonic: string) {
    // Mock wallet import
  }
  
  async getAccounts(): Promise<Account[]> {
    return [this.createAccount()];
  }
  
  getCurrentNetwork(): Network {
    return {
      id: 'ethereum',
      name: 'Ethereum',
      chainId: 1
    };
  }
  
  async getBalance(address: string): Promise<string> {
    return '1.5';
  }
  
  async sendTransaction(tx: any): Promise<string> {
    return '0x' + Math.random().toString(16).substr(2, 64);
  }
  
  async getTokenBalance(params: any): Promise<string> {
    return '100.0';
  }
  
  async getTokenMetadata(address: string): Promise<{name: string; symbol: string; decimals: number}> {
    return {
      name: 'Mock Token',
      symbol: 'MOCK',
      decimals: 18
    };
  }
  
  async getUsdBalance(balance: string, symbol: string): Promise<string> {
    return '3000.00';
  }
  
  switchNetwork(networkId: string) {
    // Mock network switch
  }
  
  addCustomNetwork(network: Network) {
    // Mock add network
  }
  
  removeCustomNetwork(networkId: string) {
    // Mock remove network
  }
  
  getNetwork(networkId: string): Network | null {
    return {
      id: networkId,
      name: 'Ethereum',
      chainId: 1
    };
  }
}

interface WalletState {
  // Wallet state
  isUnlocked: boolean;
  address: string | null;
  balance: string;
  currentNetwork: Network | null;
  accounts: Account[];
  currentAccount: Account | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
  createAccount: (name?: string) => void;
  importAccount: (data: { privateKey: string; name?: string }) => Promise<void>;
  importWallet: (mnemonic: string) => Promise<void>;
  switchAccount: (address: string) => void;
  removeAccount: (address: string) => void;
  exportPrivateKey: (address: string) => string;
  clearError: () => void;
  clearCorruptedAccounts: () => void;
  
  // Network actions
  switchNetwork: (networkId: string) => void;
  addCustomNetwork: (network: Network) => void;
  removeCustomNetwork: (networkId: string) => void;
  
  // Transaction actions
  sendTransaction: (to: string, amount: string, data?: string) => Promise<string>;
  getBalance: (address?: string) => Promise<string>;
  getTokenBalance: (params: { tokenAddress: string; address?: string; decimals?: number }) => Promise<string>;
  getTokenMetadata: (tokenAddress: string) => Promise<{ name: string; symbol: string; decimals: number }>;
  getUsdBalance: (balance: string, symbol: string) => Promise<string>;
  
  // Extension specific
  connectToWebsite: (origin: string) => Promise<void>;
  disconnectFromWebsite: (origin: string) => void;
  getConnectedSites: () => string[];
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isUnlocked: false,
      address: null,
      balance: '0',
      currentNetwork: null,
      accounts: [],
      currentAccount: null,
      isLoading: false,
      error: null,

      // Initialize wallet
      initialize: async () => {
        set({ isLoading: true });
        try {
          // Initialize wallet from storage
          const wallet = new Wallet();
          await wallet.initialize();
          
          // Load accounts from storage
          const accounts = await wallet.getAccounts();
          const currentAccount = accounts[0] || null;
          
          set({
            accounts,
            currentAccount,
            address: currentAccount?.address || null,
            currentNetwork: wallet.getCurrentNetwork(),
            isLoading: false
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize wallet',
            isLoading: false 
          });
        }
      },

      // Unlock wallet
      unlock: async (password: string) => {
        set({ isLoading: true, error: null });
        try {
          const wallet = new Wallet();
          await wallet.unlock(password);
          
          const accounts = await wallet.getAccounts();
          const currentAccount = accounts[0] || null;
          
          set({
            isUnlocked: true,
            accounts,
            currentAccount,
            address: currentAccount?.address || null,
            currentNetwork: wallet.getCurrentNetwork(),
            balance: currentAccount ? await wallet.getBalance(currentAccount.address) : '0',
            isLoading: false
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Invalid password',
            isLoading: false 
          });
        }
      },

      // Lock wallet
      lock: () => {
        set({
          isUnlocked: false,
          address: null,
          balance: '0',
          error: null
        });
      },

      // Create account
      createAccount: (name?: string) => {
        const { accounts } = get();
        const wallet = new Wallet();
        const newAccount = wallet.createAccount(name || `Account ${accounts.length + 1}`);
        
        set({
          accounts: [...accounts, newAccount],
          currentAccount: newAccount,
          address: newAccount.address
        });
      },

      // Import account
      importAccount: async (data: { privateKey: string; name?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const wallet = new Wallet();
          const account = await wallet.importAccount(data.privateKey, data.name);
          
          const { accounts } = get();
          set({
            accounts: [...accounts, account],
            currentAccount: account,
            address: account.address,
            isLoading: false
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to import account',
            isLoading: false 
          });
        }
      },

      // Import wallet
      importWallet: async (mnemonic: string) => {
        set({ isLoading: true, error: null });
        try {
          const wallet = new Wallet();
          await wallet.importWallet(mnemonic);
          
          const accounts = await wallet.getAccounts();
          const currentAccount = accounts[0] || null;
          
          set({
            accounts,
            currentAccount,
            address: currentAccount?.address || null,
            isLoading: false
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to import wallet',
            isLoading: false 
          });
        }
      },

      // Switch account
      switchAccount: (address: string) => {
        const { accounts } = get();
        const account = accounts.find(acc => acc.address === address);
        if (account) {
          set({
            currentAccount: account,
            address: account.address
          });
        }
      },

      // Remove account
      removeAccount: (address: string) => {
        const { accounts, currentAccount } = get();
        const newAccounts = accounts.filter(acc => acc.address !== address);
        
        if (newAccounts.length === 0) {
          set({
            accounts: [],
            currentAccount: null,
            address: null
          });
        } else if (currentAccount?.address === address) {
          set({
            accounts: newAccounts,
            currentAccount: newAccounts[0],
            address: newAccounts[0].address
          });
        } else {
          set({ accounts: newAccounts });
        }
      },

      // Export private key
      exportPrivateKey: (address: string) => {
        const { accounts } = get();
        const account = accounts.find(acc => acc.address === address);
        if (!account) {
          throw new Error('Account not found');
        }
        return account.privateKey || '';
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Clear corrupted accounts
      clearCorruptedAccounts: () => {
        set({
          accounts: [],
          currentAccount: null,
          address: null,
          isUnlocked: false
        });
      },

      // Network actions
      switchNetwork: (networkId: string) => {
        const wallet = new Wallet();
        const network = wallet.getNetwork(networkId);
        if (network) {
          wallet.switchNetwork(networkId);
          set({ currentNetwork: network });
        }
      },

      addCustomNetwork: (network: Network) => {
        const wallet = new Wallet();
        wallet.addCustomNetwork(network);
        set({ currentNetwork: network });
      },

      removeCustomNetwork: (networkId: string) => {
        const wallet = new Wallet();
        wallet.removeCustomNetwork(networkId);
        set({ currentNetwork: wallet.getCurrentNetwork() });
      },

      // Transaction actions
      sendTransaction: async (to: string, amount: string, data?: string) => {
        const { currentAccount } = get();
        if (!currentAccount) {
          throw new Error('No account selected');
        }

        const wallet = new Wallet();
        const txHash = await wallet.sendTransaction({
          to,
          value: amount,
          data,
          from: currentAccount.address
        });

        return txHash;
      },

      getBalance: async (address?: string) => {
        const { currentAccount } = get();
        const targetAddress = address || currentAccount?.address;
        if (!targetAddress) return '0';

        const wallet = new Wallet();
        return await wallet.getBalance(targetAddress);
      },

      getTokenBalance: async (params: { tokenAddress: string; address?: string; decimals?: number }) => {
        const { currentAccount } = get();
        const wallet = new Wallet();
        return await wallet.getTokenBalance({
          ...params,
          address: params.address || currentAccount?.address
        });
      },

      getTokenMetadata: async (tokenAddress: string) => {
        const wallet = new Wallet();
        return await wallet.getTokenMetadata(tokenAddress);
      },

      getUsdBalance: async (balance: string, symbol: string) => {
        const wallet = new Wallet();
        return await wallet.getUsdBalance(balance, symbol);
      },

      // Extension specific
      connectToWebsite: async (origin: string) => {
        // Store connected site
        const connectedSites = get().getConnectedSites();
        if (!connectedSites.includes(origin)) {
          const newSites = [...connectedSites, origin];
          await chrome.storage.local.set({ connectedSites: newSites });
        }
      },

      disconnectFromWebsite: (origin: string) => {
        const connectedSites = get().getConnectedSites();
        const newSites = connectedSites.filter(site => site !== origin);
        chrome.storage.local.set({ connectedSites: newSites });
      },

      getConnectedSites: () => {
        // This would be implemented to read from chrome.storage.local
        return [];
      }
    }),
    {
      name: 'mpc-wallet-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        currentAccount: state.currentAccount,
        currentNetwork: state.currentNetwork
      })
    }
  )
);
