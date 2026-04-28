import { create } from 'zustand';
import { EvmWallet, Network, SendEthParams, SendErc20Params, TokenBalanceParams, Account, ImportAccountParams, CreateAccountParams, TransferNftParams } from '@evm-wallet/sdk';
import { 
  securityAuditLogger, 
  sessionManager, 
  loginAttemptManager, 
  biometricManager,
  validatePasswordStrength 
} from '@evm-wallet/sdk';

interface TokenPrice {
  symbol: string;
  price: number;
  lastUpdated: number;
}

interface NftMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  animation_url?: string;
  background_color?: string;
}

interface Nft {
  contractAddress: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  metadata: NftMetadata;
  collectionName?: string;
  collectionSymbol?: string;
  tokenType: 'ERC721' | 'ERC1155';
  balance?: string;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'pending' | 'failed';
  type: 'send' | 'receive' | 'contract';
  tokenSymbol?: string;
  tokenName?: string;
  tokenAddress?: string;
}


interface WalletStore {
  // State
  wallet: EvmWallet | null;
  isInitialized: boolean;
  hasWallet: boolean;
  isUnlocked: boolean;
  address: string | null;
  currentAccount: Account | null;
  accounts: Account[];
  currentNetwork: Network | null;
  networks: Network[];
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  tokenPrices: Record<string, TokenPrice>;
  nfts: Nft[];
  isLoadingNfts: boolean;
  
  // Transaction state
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  isTransactionScanning: boolean;
  
  // UI state
  sidebarCollapsed: boolean;
  
  // Account-specific mnemonics storage
  accountMnemonics: Record<string, string>; // address -> mnemonic
  
  securityEvents: any[];
  biometricAuth: any;
  sessionInfo: {
    isActive: boolean;
    duration: number;
    lastActivity: number;
  };

  // Actions
  initialize: () => void;
  createWallet: () => Promise<{ mnemonic: string; address: string }>;
  importWallet: (mnemonic: string) => Promise<{ mnemonic: string; address: string }>;
  getAccountSeedPhrase: (address: string) => string | null;
  saveAccountMnemonics: () => void;
  loadAccountMnemonics: () => Record<string, string>;
  importAccountFromMnemonic: (mnemonic: string, name?: string) => Promise<Account>;
  lock: () => void;
  unlock: (password: string) => Promise<void>;
  saveKeystore: (mnemonic: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addNetwork: (network: Omit<Network, 'chainId'> & { chainId: number }) => void;
  selectNetwork: (chainId: number) => void;
  getBalance: (address?: string) => Promise<string>;
  sendEth: (params: SendEthParams) => Promise<string>;
  sendErc20: (params: SendErc20Params) => Promise<string>;
  getTokenBalance: (params: TokenBalanceParams) => Promise<string>;
  getTokenMetadata: (tokenAddress: string) => Promise<{ name: string; symbol: string; decimals: number }>;
  getTokenPrice: (symbol: string) => Promise<number>;
  getUsdBalance: (balance: string, symbol: string) => Promise<string>;
  clearPriceCache: () => void;
  fetchNfts: (address?: string) => Promise<void>;
  transferNft: (params: TransferNftParams) => Promise<string>;
  
  // Transaction methods
  fetchTransactions: () => Promise<void>;
  getTransactionHistory: (address: string, network: Network) => Promise<Transaction[]>;
  stopTransactionScanning: () => void;
  saveTransactionToHistory: (transaction: Transaction) => void;
  migrateToNetworkSpecificStorage: () => void;
  loadTransactionHistory: () => void;
  saveLastKnownBalance: (address: string, balance: string, networkSymbol: string) => void;
  getLastKnownBalance: (address: string, networkSymbol: string) => string | null;
  clearFakeReceiveTransactions: (address: string) => void;
  findTransactionHash: (toAddress: string, amount: string, network: Network) => Promise<string | null>;
  updateTransactionHashes: (address: string) => Promise<void>;
  removeDuplicateTransactions: (transactions: Transaction[]) => Transaction[];
  
  clearError: () => void;
  logout: () => void;
  
  // Security methods
  initializeSecurity: () => Promise<void>;
  updateSessionActivity: () => void;
  getSecurityEvents: () => any[];
  validatePassword: (password: string) => { isValid: boolean; score: number; feedback: string[] };
  authenticateWithBiometric: () => Promise<boolean>;
  
  // Account management
  switchAccount: (address: string) => void;
  createAccount: (params: CreateAccountParams) => Account;
  importAccount: (params: ImportAccountParams) => Promise<Account>;
  removeAccount: (address: string) => void;
  exportPrivateKey: (address: string) => string;
  clearCorruptedAccounts: () => void;
  
  // UI management
  toggleSidebar: () => void;
  
  // Wallet management
  resetWallet: () => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  wallet: null,
  isInitialized: false,
  hasWallet: false,
  isUnlocked: false,
  address: null,
  currentAccount: null,
  accounts: [],
  currentNetwork: null,
  networks: [],
  balance: null,
  isLoading: false,
  error: null,
  tokenPrices: {},
    nfts: [],
    isLoadingNfts: false,
    
  // Transaction state
  transactions: [],
  isLoadingTransactions: false,
  isTransactionScanning: false,
  
  // UI state
  sidebarCollapsed: false,
  
  // Account-specific mnemonics storage
  accountMnemonics: {},
    
    securityEvents: [],
  biometricAuth: null,
  sessionInfo: {
    isActive: false,
    duration: 0,
    lastActivity: 0
  },

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
      currentAccount: wallet.getCurrentAccount() || null,
      accounts: wallet.getAccounts(),
      currentNetwork: wallet.getCurrentNetwork() || null,
      networks: wallet.listNetworks(),
    });
    
    // Load account mnemonics from localStorage
    get().loadAccountMnemonics();
    
    // Load transaction history if wallet is unlocked
    if (wallet.isUnlocked() && wallet.getAddress()) {
      // Migrate existing data to network-specific storage
      get().migrateToNetworkSpecificStorage();
      get().loadTransactionHistory();
    }
  },

  createWallet: async () => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      // Use the original createWallet method but then lock it immediately
      const result = await wallet.createWallet();
      
      // Immediately lock the wallet after creation
      wallet.lock();
      
      set({
        hasWallet: true,
        isUnlocked: false, // Explicitly keep it locked
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

  getAccountSeedPhrase: (address: string) => {
    const { wallet, accountMnemonics } = get();
    if (!wallet) return null;
    
    console.log('Getting seed phrase for address:', address);
    console.log('Stored account mnemonics:', accountMnemonics);
    console.log('Looking for:', address.toLowerCase());
    
    // Check if we have a stored mnemonic for this account
    if (accountMnemonics[address.toLowerCase()]) {
      console.log('Found stored mnemonic for account:', address);
      return accountMnemonics[address.toLowerCase()];
    }
    
    console.log('No stored mnemonic found, using master mnemonic');
    // For accounts created from the master wallet, return the master mnemonic
    try {
      return wallet.getMnemonicPhrase();
    } catch (error) {
      console.error('Failed to get master mnemonic:', error);
      return null;
    }
  },

  saveAccountMnemonics: () => {
    const { accountMnemonics } = get();
    try {
      console.log('Saving account mnemonics to localStorage:', accountMnemonics);
      localStorage.setItem('mpc-wallet-account-mnemonics', JSON.stringify(accountMnemonics));
      console.log('Account mnemonics saved successfully');
    } catch (error) {
      console.error('Failed to save account mnemonics:', error);
    }
  },

  loadAccountMnemonics: () => {
    try {
      const stored = localStorage.getItem('mpc-wallet-account-mnemonics');
      console.log('Loading account mnemonics from localStorage:', stored);
      if (stored) {
        const mnemonics = JSON.parse(stored);
        console.log('Parsed account mnemonics:', mnemonics);
        set({ accountMnemonics: mnemonics });
        return mnemonics;
      }
    } catch (error) {
      console.error('Failed to load account mnemonics:', error);
    }
    return {};
  },

  importAccountFromMnemonic: async (mnemonic: string, name?: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      console.log('Store: Starting importAccountFromMnemonic');
      
      // Create a temporary wallet to derive the account and validate the mnemonic
      const tempWallet = new EvmWallet();
      await tempWallet.importFromMnemonic(mnemonic);
      
      // Get the derived account details
      const derivedAccount = tempWallet.getCurrentAccount();
      const derivedAddress = tempWallet.getAddress();
      
      if (!derivedAccount || !derivedAddress) {
        throw new Error('Failed to derive account from mnemonic');
      }
      
      // Check if account already exists
      const existingAccount = wallet.getAccounts().find(acc => 
        acc.address.toLowerCase() === derivedAddress.toLowerCase()
      );
      
      if (existingAccount) {
        throw new Error('Account already exists');
      }
      
      // Import the account using the private key
      const privateKey = tempWallet.getPrivateKey();
      const newAccount = wallet.importAccount({
        privateKey: privateKey,
        name: name || `Imported Account ${wallet.getAccounts().length + 1}`
      });
      
      console.log('Store: Account imported from mnemonic successfully:', newAccount);
      
      // Store the mnemonic for this account
      const newAccountMnemonics = {
        ...get().accountMnemonics,
        [newAccount.address.toLowerCase()]: mnemonic
      };
      
      console.log('Storing mnemonic for account:', newAccount.address.toLowerCase());
      console.log('Mnemonic to store:', mnemonic);
      console.log('Updated account mnemonics:', newAccountMnemonics);
      
      set({
        accounts: wallet.getAccounts(),
        currentAccount: wallet.getCurrentAccount(),
        address: wallet.getAddress(),
        accountMnemonics: newAccountMnemonics,
        isLoading: false,
      });
      
      // Save to localStorage
      get().saveAccountMnemonics();
      
      console.log('Store: State updated after mnemonic account import');
      return newAccount;
    } catch (error) {
      console.error('Store: Import account from mnemonic failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to import account from mnemonic',
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
      console.log('Store: Starting importWallet with mnemonic');
      const result = await wallet.importFromMnemonic(mnemonic);
      console.log('Store: Wallet imported successfully:', result);
      
      set({
        hasWallet: true,
        isUnlocked: wallet.isUnlocked(), // Use the actual wallet state instead of forcing false
        address: result.address,
        currentAccount: wallet.getCurrentAccount(),
        accounts: wallet.getAccounts(),
        isLoading: false,
      });
      
      console.log('Store: State updated after wallet import, isUnlocked:', wallet.isUnlocked());
      return result;
    } catch (error) {
      console.error('Store: Import wallet failed:', error);
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
      
      // Load transaction history after unlocking
      if (wallet.getAddress()) {
        get().loadTransactionHistory();
      }
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
      // Only set hasWallet: true AFTER keystore is successfully saved
      set({ 
        hasWallet: true,
        isUnlocked: wallet.isUnlocked(),
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

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      // Verify current password by unlocking (if not already unlocked)
      const wasUnlocked = wallet.isUnlocked();
      if (!wasUnlocked) {
        await wallet.unlock(currentPassword);
      }
      
      // Get the mnemonic (wallet must be unlocked)
      const mnemonic = wallet.getMnemonicPhrase();
      if (!mnemonic) {
        throw new Error('Could not retrieve mnemonic. Please unlock your wallet first.');
      }
      
      // Save keystore with new password
      await wallet.saveKeystore(mnemonic, newPassword);
      
      // Update biometric token if enabled
      try {
        const { isBiometricEnabled, enableBiometric } = await import('@/lib/biometric');
        const enabled = await isBiometricEnabled();
        if (enabled) {
          // Update biometric token with new password
          await enableBiometric(newPassword);
        }
      } catch (bioError) {
        // Silently fail - biometric update is optional
        console.log('Biometric update skipped:', bioError);
      }
      
      // Update store state
      set({ 
        isUnlocked: wallet.isUnlocked(),
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to change password',
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
    const { wallet, currentNetwork } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const newBalance = await wallet.getBalance(address);
      const walletAddress = wallet.getAddress();
      
      if (walletAddress && currentNetwork) {
        // Get the last known balance for this specific wallet and network
        const lastKnownBalance = get().getLastKnownBalance(walletAddress, currentNetwork.symbol);
        
        // Only check for balance increase if we have a valid previous balance
        if (lastKnownBalance && newBalance) {
          const oldBalanceNum = parseFloat(lastKnownBalance);
          const newBalanceNum = parseFloat(newBalance);
          
          // Only create receive transaction if balance actually increased significantly
          // (more than 0.000001 to avoid dust amounts)
          if (newBalanceNum > oldBalanceNum && (newBalanceNum - oldBalanceNum) > 0.000001) {
            const receivedAmount = (newBalanceNum - oldBalanceNum).toFixed(6);
            
            console.log(`💰 Balance increased by ${receivedAmount} ${currentNetwork.symbol} - looking for transaction hash...`);
            
            // Try to find the actual transaction hash
            const transactionHash = await get().findTransactionHash(walletAddress, receivedAmount, currentNetwork);
            
            // Create a receive transaction record
            const transaction: Transaction = {
              hash: transactionHash || `receive-${Date.now()}`, // Use real hash if found, otherwise temporary
              from: 'Unknown', // We don't know who sent it without blockchain scanning
              to: walletAddress,
              value: receivedAmount,
              timestamp: Date.now(),
              blockNumber: 0,
              gasUsed: '0',
              gasPrice: '0',
              status: 'success',
              type: 'receive',
              tokenSymbol: currentNetwork.symbol,
              tokenName: currentNetwork.name
            };
            
            get().saveTransactionToHistory(transaction);
            
            if (transactionHash) {
              console.log(`✅ Found real transaction hash: ${transactionHash} for ${receivedAmount} ${currentNetwork.symbol}`);
            } else {
              console.log(`⚠️ No transaction hash found, using temporary hash for ${receivedAmount} ${currentNetwork.symbol}`);
            }
          }
        }
        
        // Save the new balance as the last known balance for this wallet/network
        get().saveLastKnownBalance(walletAddress, newBalance, currentNetwork.symbol);
      }
      
      set({
        balance: newBalance,
        isLoading: false,
      });
      return newBalance;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get balance',
        isLoading: false 
      });
      throw error;
    }
  },

  sendEth: async (params: SendEthParams) => {
    const { wallet, currentNetwork } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const hash = await wallet.sendEth(params);
      
      // Save transaction to local history
      if (currentNetwork) {
        const transaction: Transaction = {
          hash,
          from: wallet.getAddress() || '',
          to: params.to,
          value: params.valueEth,
          timestamp: Date.now(),
          blockNumber: 0, // Will be updated when we get real block data
          gasUsed: '21000', // Standard ETH transfer gas
          gasPrice: '20000000000', // Default gas price
          status: 'success',
          type: 'send',
          tokenSymbol: currentNetwork.symbol,
          tokenName: currentNetwork.name
        };
        
        get().saveTransactionToHistory(transaction);
      }
      
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
    const { wallet, currentNetwork } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const hash = await wallet.sendErc20(params);
      
      // Save transaction to local history
      if (currentNetwork) {
        const transaction: Transaction = {
          hash,
          from: wallet.getAddress() || '',
          to: params.to,
          value: params.amount,
          timestamp: Date.now(),
          blockNumber: 0, // Will be updated when we get real block data
          gasUsed: '65000', // Standard ERC20 transfer gas
          gasPrice: '20000000000', // Default gas price
          status: 'success',
          type: 'send',
          tokenSymbol: 'TOKEN', // We'll need to get this from token metadata
          tokenName: 'Token', // We'll need to get this from token metadata
          tokenAddress: params.tokenAddress
        };
        
        get().saveTransactionToHistory(transaction);
      }
      
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

  getTokenMetadata: async (tokenAddress: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      const metadata = await wallet.getTokenMetadata(tokenAddress);
      set({ isLoading: false });
      return metadata;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get token metadata',
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
      currentAccount: null,
      accounts: [],
      currentNetwork: null,
      networks: wallet.listNetworks(),
      balance: null,
      error: null,
    });
  },

  // Account management
  switchAccount: (address: string) => {
    const { wallet } = get();
    if (!wallet) return;

    wallet.switchAccount(address);
    set({
      currentAccount: wallet.getCurrentAccount() || null,
      address: wallet.getAddress() || null,
    });
  },

  createAccount: (params: CreateAccountParams) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    const newAccount = wallet.createAccount(params);
    set({
      accounts: wallet.getAccounts(),
    });
    return newAccount;
  },

  importAccount: async (params: ImportAccountParams) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      console.log('Store: Starting importAccount with params:', params);
      const newAccount = wallet.importAccount(params);
      console.log('Store: Account imported successfully:', newAccount);
      
      set({
        accounts: wallet.getAccounts(),
        currentAccount: wallet.getCurrentAccount(),
        address: wallet.getAddress(),
        isLoading: false,
      });
      
      console.log('Store: State updated after import');
      return newAccount;
    } catch (error) {
      console.error('Store: Import account failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to import account',
        isLoading: false,
      });
      throw error;
    }
  },

  removeAccount: (address: string) => {
    const { wallet } = get();
    if (!wallet) return;

    wallet.removeAccount(address);
    set({
      accounts: wallet.getAccounts(),
      currentAccount: wallet.getCurrentAccount() || null,
      address: wallet.getAddress() || null,
    });
  },

  exportPrivateKey: (address: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    return wallet.exportPrivateKey(address);
  },

  clearCorruptedAccounts: () => {
    const { wallet } = get();
    if (!wallet) return;

    wallet.clearCorruptedAccounts();
    set({
      accounts: wallet.getAccounts(),
      currentAccount: wallet.getCurrentAccount() || null,
      address: wallet.getAddress() || null,
    });
  },

  // UI management
  toggleSidebar: () => {
    set((state) => ({ 
      sidebarCollapsed: !state.sidebarCollapsed 
    }));
  },

  // Wallet management
  resetWallet: () => {
    const { wallet } = get();
    if (!wallet) return;

    try {
      // Clear all wallet data
      wallet.clearStorage();
      
      // Clear localStorage data
      localStorage.removeItem('mpc-wallet-state');
      localStorage.removeItem('mpc-wallet-tokens');
      localStorage.removeItem('mpc-wallet-transactions');
      
      // Clear all network-specific data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('mpc-wallet-tokens-') || key.startsWith('mpc-wallet-transactions-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Re-initialize the wallet (create new instance)
      const newWallet = new EvmWallet();
      newWallet.loadState();
      
      // Reset store state with new wallet instance
      set({
        wallet: newWallet,
        isInitialized: true,
        hasWallet: false, // No keystore after reset
        isUnlocked: false,
        address: null,
        currentAccount: null,
        accounts: [],
        currentNetwork: newWallet.getCurrentNetwork() || null,
        networks: newWallet.listNetworks(),
        balance: null,
        isLoading: false,
        error: null,
        tokenPrices: {},
        nfts: [],
        isLoadingNfts: false,
        transactions: [],
        isLoadingTransactions: false,
        isTransactionScanning: false,
        sidebarCollapsed: false,
        securityEvents: [],
        biometricAuth: null,
        sessionInfo: {
          isActive: false,
          duration: 0,
          lastActivity: 0,
        },
      });
      
      console.log('✅ Wallet reset successfully');
    } catch (error) {
      console.error('Failed to reset wallet:', error);
    }
  },

  getTokenPrice: async (symbol: string): Promise<number> => {
    const { tokenPrices } = get();
    const now = Date.now();
    
    // Check if we have a recent price (less than 1 minute old for real-time data)
    const existingPrice = tokenPrices[symbol.toUpperCase()];
    if (existingPrice && (now - existingPrice.lastUpdated) < 60 * 1000) {
      return existingPrice.price;
    }

    // Try multiple APIs for real-time price data
    const apis = [
      // CoinGecko API
      {
        name: 'CoinGecko',
        url: `https://api.coingecko.com/api/v3/simple/price?ids=${getCoinGeckoId(symbol)}&vs_currencies=usd`,
        parser: (data: any) => data[getCoinGeckoId(symbol)]?.usd
      },
      // CoinCap API (alternative)
      {
        name: 'CoinCap',
        url: `https://api.coincap.io/v2/assets/${getCoinCapId(symbol)}`,
        parser: (data: any) => parseFloat(data.data?.priceUsd)
      },
      // CoinPaprika API (another alternative)
      {
        name: 'CoinPaprika',
        url: `https://api.coinpaprika.com/v1/tickers/${getCoinPaprikaId(symbol)}`,
        parser: (data: any) => data.quotes?.USD?.price
      }
    ];

    for (const api of apis) {
      try {
        console.log(`Fetching real-time price for ${symbol} from ${api.name}`);
        
        const response = await fetch(api.url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`${api.name} API response:`, data);
        
        const price = api.parser(data);
        
        if (price !== undefined && price !== null && price > 0) {
          console.log(`Real-time price for ${symbol} from ${api.name}: $${price}`);

          // Update the price in store with real data
          set({
            tokenPrices: {
              ...tokenPrices,
              [symbol.toUpperCase()]: {
                symbol: symbol.toUpperCase(),
                price: price,
                lastUpdated: now,
              },
            },
          });

          return price;
        }
      } catch (error) {
        console.error(`Failed to fetch price from ${api.name}:`, error);
        continue; // Try next API
      }
    }

    // If all APIs fail, return cached price if available, otherwise throw error
    if (existingPrice) {
      console.log(`Using cached price for ${symbol}: $${existingPrice.price}`);
      return existingPrice.price;
    }
    
    throw new Error(`Unable to fetch real-time price for ${symbol} from any API`);
  },

  getUsdBalance: async (balance: string, symbol: string): Promise<string> => {
    try {
      console.log(`Calculating USD balance: ${balance} ${symbol}`);
      const price = await get().getTokenPrice(symbol);
      console.log(`Real-time price for ${symbol}: $${price}`);
      const usdValue = parseFloat(balance) * price;
      console.log(`USD value: ${balance} * ${price} = $${usdValue.toFixed(2)}`);
      return usdValue.toFixed(2);
    } catch (error) {
      console.error('Failed to calculate USD balance:', error);
      // Return null or throw error instead of fake 0.00
      throw new Error(`Unable to calculate USD balance for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Clear cached prices to force refresh
  clearPriceCache: () => {
    set({ tokenPrices: {} });
  },

  // NFT methods
  fetchNfts: async (address?: string) => {
    const { wallet, currentNetwork } = get();
    if (!wallet || !currentNetwork) {
      throw new Error('Wallet or network not initialized');
    }

    const targetAddress = address || wallet.getAddress();
    if (!targetAddress) {
      throw new Error('No address available');
    }

    set({ isLoadingNfts: true, error: null });

    try {
      // Use multiple free APIs to fetch NFTs
      const nfts = await fetchNftsFromApis(targetAddress, currentNetwork.chainId);
      set({ nfts, isLoadingNfts: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch NFTs',
        isLoadingNfts: false 
      });
      throw error;
    }
  },

  transferNft: async (params: TransferNftParams) => {
    const { wallet } = get();
    if (!wallet) throw new Error('Wallet not initialized');

    set({ isLoading: true, error: null });
    
    try {
      // This will be implemented in the SDK
      const hash = await wallet.transferNft(params);
      set({ isLoading: false });
      return hash;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to transfer NFT',
        isLoading: false 
      });
      throw error;
    }
  },

  // Transaction methods
  fetchTransactions: async () => {
    const { wallet } = get();
    
    if (!wallet) {
      throw new Error('Wallet not initialized');
    }

    const address = wallet.getAddress();
    if (!address) {
      throw new Error('No address available');
    }

    set({ isLoadingTransactions: true, error: null });

    try {
      // Load transactions from local storage
      get().loadTransactionHistory();
      set({ isLoadingTransactions: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load transaction history',
        isLoadingTransactions: false
      });
      throw error;
    }
  },

  stopTransactionScanning: () => {
    set({ isTransactionScanning: false, isLoadingTransactions: false });
  },

  saveTransactionToHistory: (transaction: Transaction) => {
    const { wallet, currentNetwork } = get();
    if (!wallet) return;

    const address = wallet.getAddress();
    if (!address) return;

    try {
      // Get existing transactions from localStorage
      const networkKey = currentNetwork?.chainId || 'unknown';
      const storageKey = `mpc-wallet-transactions-${address}-${networkKey}`;
      const existingTransactions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Check for duplicates based on hash, amount, and timestamp (within 5 minutes)
      const isDuplicate = existingTransactions.some((existingTx: Transaction) => {
        // Same hash
        if (existingTx.hash === transaction.hash) return true;
        
        // Same amount and type, and within 5 minutes (for receive transactions)
        if (transaction.type === 'receive' && existingTx.type === 'receive') {
          const timeDiff = Math.abs(existingTx.timestamp - transaction.timestamp);
          const amountMatch = Math.abs(parseFloat(existingTx.value) - parseFloat(transaction.value)) < 0.000001;
          
          if (amountMatch && timeDiff < 5 * 60 * 1000) { // 5 minutes in milliseconds
            return true;
          }
        }
        
        return false;
      });
      
      if (isDuplicate) {
        console.log('Duplicate transaction detected, skipping save:', transaction.hash);
        return;
      }
      
      // Add new transaction at the beginning (most recent first)
      const updatedTransactions = [transaction, ...existingTransactions];
      
      // Keep only last 100 transactions to avoid storage bloat
      const limitedTransactions = updatedTransactions.slice(0, 100);
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(limitedTransactions));
      
      // Update store state
      set({ transactions: limitedTransactions });
      
      console.log('Transaction saved to local history:', transaction.hash);
    } catch (error) {
      console.error('Failed to save transaction to history:', error);
    }
  },

  saveLastKnownBalance: (address: string, balance: string, networkSymbol: string) => {
    try {
      const balanceKey = `mpc-wallet-last-balance-${address}-${networkSymbol}`;
      localStorage.setItem(balanceKey, balance);
    } catch (error) {
      console.error('Failed to save last known balance:', error);
    }
  },

  getLastKnownBalance: (address: string, networkSymbol: string): string | null => {
    try {
      const balanceKey = `mpc-wallet-last-balance-${address}-${networkSymbol}`;
      return localStorage.getItem(balanceKey);
    } catch (error) {
      console.error('Failed to get last known balance:', error);
      return null;
    }
  },

  findTransactionHash: async (toAddress: string, amount: string, network: Network): Promise<string | null> => {
    try {
      console.log(`🔍 Looking for transaction: ${amount} to ${toAddress} on ${network.name}`);
      
      // Get recent blocks to find the transaction
      const currentBlock = await getCurrentBlockNumber(network.rpcUrl);
      const blocksToCheck = 50; // Check last 50 blocks
      
      for (let i = 0; i < blocksToCheck; i++) {
        const blockNumber = currentBlock - i;
        try {
          const block = await getBlockByNumber(network.rpcUrl, blockNumber);
          
          if (!block || !block.transactions) continue;
          
          // Look for transactions to our address with the matching amount
          for (const tx of block.transactions) {
            if (tx.to?.toLowerCase() === toAddress.toLowerCase()) {
              // Convert transaction value to the same format as our amount
              const txValue = formatEther(tx.value || '0');
              
              // Check if amounts match (with small tolerance for precision)
              const amountNum = parseFloat(amount);
              const txValueNum = parseFloat(txValue);
              const tolerance = 0.000001; // Small tolerance for floating point precision
              
              if (Math.abs(amountNum - txValueNum) < tolerance) {
                console.log(`✅ Found transaction hash: ${tx.hash} for amount ${amount}`);
                return tx.hash;
              }
            }
          }
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (blockError) {
          console.warn(`Error checking block ${blockNumber}:`, blockError);
          continue;
        }
      }
      
      console.log(`❌ No transaction hash found for amount ${amount} to ${toAddress}`);
      return null;
    } catch (error) {
      console.error('Error finding transaction hash:', error);
      return null;
    }
  },

  clearFakeReceiveTransactions: (address: string) => {
    const { currentNetwork } = get();
    try {
      const networkKey = currentNetwork?.chainId || 'unknown';
      const storageKey = `mpc-wallet-transactions-${address}-${networkKey}`;
      const existingTransactions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Remove transactions that start with "receive-" (fake receive transactions)
      const filteredTransactions = existingTransactions.filter((tx: Transaction) => 
        !tx.hash.startsWith('receive-')
      );
      
      localStorage.setItem(storageKey, JSON.stringify(filteredTransactions));
      set({ transactions: filteredTransactions });
      
      console.log(`Cleared ${existingTransactions.length - filteredTransactions.length} fake receive transactions`);
    } catch (error) {
      console.error('Failed to clear fake receive transactions:', error);
    }
  },

  updateTransactionHashes: async (address: string) => {
    const { currentNetwork } = get();
    if (!currentNetwork) return;

    try {
      const networkKey = currentNetwork.chainId;
      const storageKey = `mpc-wallet-transactions-${address}-${networkKey}`;
      const existingTransactions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      let updatedCount = 0;
      
      // Find transactions with temporary hashes and try to get real ones
      for (let i = 0; i < existingTransactions.length; i++) {
        const tx = existingTransactions[i];
        
        if (tx.hash.startsWith('receive-') && tx.type === 'receive') {
          console.log(`🔍 Looking for real hash for transaction: ${tx.value} ${tx.tokenSymbol}`);
          
          const realHash = await get().findTransactionHash(address, tx.value, currentNetwork);
          
          if (realHash) {
            existingTransactions[i].hash = realHash;
            updatedCount++;
            console.log(`✅ Updated transaction hash: ${realHash}`);
          }
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      if (updatedCount > 0) {
        localStorage.setItem(storageKey, JSON.stringify(existingTransactions));
        set({ transactions: existingTransactions });
        console.log(`🎉 Updated ${updatedCount} transaction hashes`);
      }
      
    } catch (error) {
      console.error('Failed to update transaction hashes:', error);
    }
  },

  // Migration function to move existing data to network-specific storage
  migrateToNetworkSpecificStorage: () => {
    const { wallet, currentNetwork } = get();
    if (!wallet || !currentNetwork) return;

    const address = wallet.getAddress();
    if (!address) return;

    try {
      const networkKey = currentNetwork.chainId;
      
      // Migrate tokens
      const oldTokenKey = 'mpc-wallet-tokens';
      const newTokenKey = `mpc-wallet-tokens-${networkKey}`;
      
      const oldTokens = localStorage.getItem(oldTokenKey);
      const existingNewTokens = localStorage.getItem(newTokenKey);
      
      if (oldTokens && !existingNewTokens) {
        console.log(`🔄 Migrating tokens to network-specific storage for network ${networkKey}`);
        localStorage.setItem(newTokenKey, oldTokens);
        console.log(`✅ Migrated tokens to ${newTokenKey}`);
      }
      
      // Migrate transactions
      const oldTransactionKey = `mpc-wallet-transactions-${address}`;
      const newTransactionKey = `mpc-wallet-transactions-${address}-${networkKey}`;
      
      const oldTransactions = localStorage.getItem(oldTransactionKey);
      const existingNewTransactions = localStorage.getItem(newTransactionKey);
      
      if (oldTransactions && !existingNewTransactions) {
        console.log(`🔄 Migrating transactions to network-specific storage for network ${networkKey}`);
        localStorage.setItem(newTransactionKey, oldTransactions);
        console.log(`✅ Migrated transactions to ${newTransactionKey}`);
      }
      
      // Reload data after migration
      get().loadTransactionHistory();
      
    } catch (error) {
      console.error('Failed to migrate to network-specific storage:', error);
    }
  },

  loadTransactionHistory: () => {
    const { wallet, currentNetwork } = get();
    if (!wallet) return;

    const address = wallet.getAddress();
    if (!address) return;

    try {
      // Use network-specific storage key
      const networkKey = currentNetwork?.chainId || 'unknown';
      const storageKey = `mpc-wallet-transactions-${address}-${networkKey}`;
      const savedTransactions = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Clean up duplicates when loading
      const cleanedTransactions = get().removeDuplicateTransactions(savedTransactions);
      
      if (cleanedTransactions.length !== savedTransactions.length) {
        localStorage.setItem(storageKey, JSON.stringify(cleanedTransactions));
        console.log(`Removed ${savedTransactions.length - cleanedTransactions.length} duplicate transactions`);
      }
      
      set({ transactions: cleanedTransactions });
      console.log(`Loaded ${cleanedTransactions.length} transactions from local history for network ${networkKey}`);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      set({ transactions: [] });
    }
  },

  removeDuplicateTransactions: (transactions: Transaction[]): Transaction[] => {
    const seen = new Set<string>();
    const uniqueTransactions: Transaction[] = [];
    
    for (const tx of transactions) {
      // Create a unique key based on hash, amount, type, and timestamp (within 5 minutes)
      let key = `${tx.hash}-${tx.value}-${tx.type}`;
      
      // For receive transactions, also consider timestamp proximity
      if (tx.type === 'receive') {
        const timestampKey = Math.floor(tx.timestamp / (5 * 60 * 1000)); // 5-minute buckets
        key += `-${timestampKey}`;
      }
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTransactions.push(tx);
      }
    }
    
    return uniqueTransactions;
  },

  getTransactionHistory: async (address: string, network: Network): Promise<Transaction[]> => {
    // This method is now deprecated - we use local storage instead
    // It's kept for compatibility but will be removed in future versions
    console.log('getTransactionHistory is deprecated - using local storage instead');
    return [];
  },

  // Security methods
  initializeSecurity: async () => {
    try {
      // Initialize biometric authentication
      const biometric = await biometricManager.initialize();
      
      // Start session
      sessionManager.startSession();
      
      // Log security initialization
      securityAuditLogger.logEvent('security_initialized', 'medium', 'Security system initialized');
      
      set({
        biometricAuth: biometric,
        sessionInfo: {
          isActive: sessionManager.isSessionValid(),
          duration: sessionManager.getSessionDuration(),
          lastActivity: Date.now()
        }
      });
    } catch (error) {
      securityAuditLogger.logEvent('security_init_failed', 'high', `Failed to initialize security: ${error}`);
    }
  },

  updateSessionActivity: () => {
    sessionManager.updateActivity();
    set({
      sessionInfo: {
        isActive: sessionManager.isSessionValid(),
        duration: sessionManager.getSessionDuration(),
        lastActivity: Date.now()
      }
    });
  },

  getSecurityEvents: () => {
    const events = securityAuditLogger.getEvents();
    set({ securityEvents: events });
    return events;
  },

  validatePassword: (password: string) => {
    return validatePasswordStrength(password);
  },

  authenticateWithBiometric: async () => {
    try {
      const success = await biometricManager.authenticate();
      if (success) {
        securityAuditLogger.logEvent('biometric_auth_success', 'medium', 'Biometric authentication successful');
        sessionManager.startSession();
      } else {
        securityAuditLogger.logEvent('biometric_auth_failed', 'high', 'Biometric authentication failed');
      }
      return success;
    } catch (error) {
      securityAuditLogger.logEvent('biometric_auth_error', 'high', `Biometric authentication error: ${error}`);
      return false;
    }
  },
}));

// Helper function to map token symbols to CoinGecko IDs
function getCoinGeckoId(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'ETH': 'ethereum',
    'MATIC': 'matic-network',
    'POL': 'matic-network',
    'BNB': 'binancecoin',
    'AVAX': 'avalanche-2',
    'FTM': 'fantom',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'DAI': 'dai',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'AAVE': 'aave',
    'SUSHI': 'sushi',
    'CRV': 'curve-dao-token',
    'COMP': 'compound-governance-token',
    'MKR': 'maker',
    'SNX': 'havven',
    'YFI': 'yearn-finance',
    '1INCH': '1inch',
    'BAT': 'basic-attention-token',
    'ZRX': '0x',
    'KNC': 'kyber-network-crystal',
  };
  
  return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
}

// Helper function to map token symbols to CoinCap IDs
function getCoinCapId(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'ETH': 'ethereum',
    'MATIC': 'matic-network',
    'POL': 'matic-network',
    'BNB': 'binance-coin',
    'AVAX': 'avalanche',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'DAI': 'dai',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'AAVE': 'aave',
    'SUSHI': 'sushi',
    'CRV': 'curve-dao-token',
    'COMP': 'compound-governance-token',
    'MKR': 'maker',
    'SNX': 'synthetix-network-token',
    'YFI': 'yearn-finance',
    '1INCH': '1inch',
    'BAT': 'basic-attention-token',
    'ZRX': '0x',
    'KNC': 'kyber-network-crystal',
  };
  
  return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
}

// Helper function to map token symbols to CoinPaprika IDs
function getCoinPaprikaId(symbol: string): string {
  const symbolMap: Record<string, string> = {
    'ETH': 'eth-ethereum',
    'MATIC': 'matic-polygon',
    'POL': 'matic-polygon',
    'BNB': 'bnb-binance-coin',
    'AVAX': 'avax-avalanche',
    'USDC': 'usdc-usd-coin',
    'USDT': 'usdt-tether',
    'DAI': 'dai-dai',
    'LINK': 'link-chainlink',
    'UNI': 'uni-uniswap',
    'AAVE': 'aave-aave',
    'SUSHI': 'sushi-sushi',
    'CRV': 'crv-curve-dao-token',
    'COMP': 'comp-compound-governance-token',
    'MKR': 'mkr-maker',
    'SNX': 'snx-synthetix-network-token',
    'YFI': 'yfi-yearn-finance',
    '1INCH': '1inch-1inch',
    'BAT': 'bat-basic-attention-token',
    'ZRX': 'zrx-0x',
    'KNC': 'knc-kyber-network-crystal',
  };
  
  return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
}

// Helper function to fetch NFTs from multiple free APIs
async function fetchNftsFromApis(address: string, chainId: number): Promise<Nft[]> {
  const nfts: Nft[] = [];
  
  // Map chain IDs to their names for API calls
  const chainMap: Record<number, string> = {
    1: 'eth', // Ethereum
    137: 'polygon', // Polygon
    56: 'bsc', // BSC
    43114: 'avalanche', // Avalanche
    250: 'fantom', // Fantom
    10: 'optimism', // Optimism
    42161: 'arbitrum', // Arbitrum
  };

  const chainName = chainMap[chainId];
  if (!chainName) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Try multiple free APIs
  const apis = [
    // Alchemy API (free tier)
    {
      name: 'Alchemy',
      url: `https://${chainName}-mainnet.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo'}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=100`,
      parser: (data: any) => data.ownedNfts?.map((nft: any) => ({
        contractAddress: nft.contract.address,
        tokenId: nft.tokenId,
        name: nft.name || `#${nft.tokenId}`,
        description: nft.description || '',
        image: nft.image?.originalUrl || nft.image?.pngUrl || nft.image?.cachedUrl || '',
        metadata: {
          name: nft.name || `#${nft.tokenId}`,
          description: nft.description || '',
          image: nft.image?.originalUrl || nft.image?.pngUrl || nft.image?.cachedUrl || '',
          attributes: nft.raw?.metadata?.attributes || [],
        },
        collectionName: nft.contract.name,
        collectionSymbol: nft.contract.symbol,
        tokenType: nft.contract.tokenType as 'ERC721' | 'ERC1155',
        balance: nft.balance,
      })) || []
    },
    // Moralis API (free tier)
    {
      name: 'Moralis',
      url: `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chainName}&format=decimal&media_items=false&normalize_metadata=true`,
      headers: process.env.NEXT_PUBLIC_MORALIS_API_KEY ? {
        'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY,
      } : undefined,
      parser: (data: any) => data.result?.map((nft: any) => ({
        contractAddress: nft.token_address,
        tokenId: nft.token_id,
        name: nft.name || `#${nft.token_id}`,
        description: nft.metadata?.description || '',
        image: nft.metadata?.image || '',
        metadata: {
          name: nft.name || `#${nft.token_id}`,
          description: nft.metadata?.description || '',
          image: nft.metadata?.image || '',
          attributes: nft.metadata?.attributes || [],
        },
        collectionName: nft.metadata?.name,
        collectionSymbol: nft.symbol,
        tokenType: nft.contract_type as 'ERC721' | 'ERC1155',
        balance: nft.amount,
      })) || []
    },
    // OpenSea API (free tier)
    {
      name: 'OpenSea',
      url: `https://api.opensea.io/api/v2/chain/${chainName}/account/${address}/nfts?limit=200`,
      headers: process.env.NEXT_PUBLIC_OPENSEA_API_KEY ? {
        'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY,
      } : undefined,
      parser: (data: any) => data.nfts?.map((nft: any) => ({
        contractAddress: nft.contract,
        tokenId: nft.identifier,
        name: nft.name || `#${nft.identifier}`,
        description: nft.description || '',
        image: nft.image_url || '',
        metadata: {
          name: nft.name || `#${nft.identifier}`,
          description: nft.description || '',
          image: nft.image_url || '',
          attributes: nft.traits || [],
        },
        collectionName: nft.collection,
        collectionSymbol: nft.collection,
        tokenType: 'ERC721' as const,
        balance: '1',
      })) || []
    }
  ];

  for (const api of apis) {
    try {
      console.log(`Fetching NFTs from ${api.name} for ${address} on ${chainName}`);
      
      const headers: Record<string, string> = {};
      if (api.headers) {
        Object.entries(api.headers).forEach(([key, value]) => {
          if (value) {
            headers[key] = value;
          }
        });
      }
      
      const response = await fetch(api.url, {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`${api.name} API response:`, data);
      
      const apiNfts = api.parser(data);
      
      if (apiNfts && apiNfts.length > 0) {
        console.log(`Found ${apiNfts.length} NFTs from ${api.name}`);
        nfts.push(...apiNfts);
        break; // Use first successful API
      }
    } catch (error) {
      console.error(`Failed to fetch NFTs from ${api.name}:`, error);
      continue; // Try next API
    }
  }

  // Remove duplicates based on contract address and token ID
  const uniqueNfts = nfts.filter((nft, index, self) => 
    index === self.findIndex(n => n.contractAddress === nft.contractAddress && n.tokenId === nft.tokenId)
  );

  console.log(`Total unique NFTs found: ${uniqueNfts.length}`);
  return uniqueNfts;
}

// RPC Helper Functions for Transaction Hash Lookup
async function getCurrentBlockNumber(rpcUrl: string): Promise<number> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    }),
  });

  const data = await response.json();
  return parseInt(data.result, 16);
}

async function getBlockByNumber(rpcUrl: string, blockNumber: number): Promise<any> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [`0x${blockNumber.toString(16)}`, true], // true to include full transaction objects
      id: 1,
    }),
  });

  const data = await response.json();
  return data.result;
}

function formatEther(wei: string): string {
  // Convert wei to ether (divide by 10^18)
  const weiBigInt = BigInt(wei);
  const etherBigInt = weiBigInt / BigInt(10 ** 18);
  const remainder = weiBigInt % BigInt(10 ** 18);
  
  if (remainder === BigInt(0)) {
    return etherBigInt.toString();
  }
  
  // Convert remainder to decimal
  const remainderStr = remainder.toString().padStart(18, '0');
  const decimalPart = remainderStr.replace(/0+$/, ''); // Remove trailing zeros
  
  if (decimalPart === '') {
    return etherBigInt.toString();
  }
  
  return `${etherBigInt.toString()}.${decimalPart}`;
}

// Utility function for formatting amounts
function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  
  // For very small amounts, show more decimal places
  if (num < 0.000001) {
    return num.toFixed(8);
  }
  // For small amounts, show 6 decimal places
  else if (num < 0.01) {
    return num.toFixed(6);
  }
  // For normal amounts, show 4 decimal places
  else if (num < 1) {
    return num.toFixed(4);
  }
  // For larger amounts, show 2 decimal places
  else {
    return num.toFixed(2);
  }
}

// Local Storage Transaction History System
// This system saves transactions that happen within our wallet to localStorage
// for the user's personal transaction history
