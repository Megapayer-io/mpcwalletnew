import { create } from 'zustand';
import { EvmWallet, Network, SendEthParams, SendErc20Params, TokenBalanceParams, Account, ImportAccountParams, CreateAccountParams } from '@evm-wallet/sdk';

interface TokenPrice {
  symbol: string;
  price: number;
  lastUpdated: number;
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
  getTokenMetadata: (tokenAddress: string) => Promise<{ name: string; symbol: string; decimals: number }>;
  getTokenPrice: (symbol: string) => Promise<number>;
  getUsdBalance: (balance: string, symbol: string) => Promise<string>;
  clearPriceCache: () => void;
  clearError: () => void;
  logout: () => void;
  
  // Account management
  switchAccount: (address: string) => void;
  createAccount: (params: CreateAccountParams) => Account;
  importAccount: (params: ImportAccountParams) => Promise<Account>;
  removeAccount: (address: string) => void;
  exportPrivateKey: (address: string) => string;
  clearCorruptedAccounts: () => void;
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
      const newAccount = wallet.importAccount(params);
      set({
        accounts: wallet.getAccounts(),
        isLoading: false,
      });
      return newAccount;
    } catch (error) {
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
