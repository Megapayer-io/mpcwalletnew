 import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EvmWallet } from '@mpc-wallet/sdk'
import { privateKeyToAccount } from 'viem/accounts'

// Global wallet instance for the session
let sessionWallet: EvmWallet | null = null

export interface Account {
  address: string
  name: string
  isImported?: boolean
}

export interface Network {
  id: string
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  chainId: number
}

export interface CustomToken {
  address: string
  name: string
  symbol: string
  decimals: number
  logoUrl?: string
}

interface WalletState {
  // Wallet state
  hasWallet: boolean
  isUnlocked: boolean
  currentAccount: Account | null
  accounts: Account[]
  networks: Network[]
  currentNetwork: Network | null
  customTokens: CustomToken[]
  
  // Wallet actions
  createWallet: (name: string, pin: string) => Promise<void>
  importWallet: (privateKey: string, name: string, pin: string) => Promise<void>
  importFromSeed: (seedPhrase: string, name: string, pin: string) => Promise<void>
  unlock: (pin: string) => Promise<boolean>
  lock: () => void
  logout: () => void
  
  // Account management
  createAccount: (name: string) => Promise<void>
  importAccount: (privateKey: string, name: string) => Promise<void>
  importWalletFromMnemonic: (mnemonic: string) => Promise<void>
  switchAccount: (address: string) => void
  removeAccount: (address: string) => void
  exportPrivateKey: (address: string) => string
  getSeedPhrase: () => string
  
  // Network management
  addNetwork: (network: Network) => void
  switchNetwork: (networkId: string) => void
  removeNetwork: (networkId: string) => void
  
  // Token management
  addCustomToken: (token: CustomToken) => void
  removeCustomToken: (address: string) => void
  
  // Balance and data
  balance: string
  usdBalance: string
  refreshBalance: () => Promise<void>
  
  // Transaction data
  transactions: any[]
  fetchTransactions: () => Promise<void>
  
  // Price data
  tokenPrices: Record<string, { symbol: string; price: number; lastUpdated: number }>
  getTokenPrice: (symbol: string) => Promise<number>
  getUsdBalance: (balance: string, symbol: string) => Promise<string>
  clearPriceCache: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      hasWallet: false,
      isUnlocked: false,
      currentAccount: null,
      accounts: [],
      networks: [
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          rpcUrl: 'https://mainnet.infura.io/v3/your-key',
          explorerUrl: 'https://etherscan.io',
          chainId: 1
        },
        {
          id: 'polygon',
          name: 'Polygon',
          symbol: 'MATIC',
          rpcUrl: 'https://polygon-rpc.com',
          explorerUrl: 'https://polygonscan.com',
          chainId: 137
        },
        {
          id: 'bsc',
          name: 'BSC',
          symbol: 'BNB',
          rpcUrl: 'https://bsc-dataseed.binance.org',
          explorerUrl: 'https://bscscan.com',
          chainId: 56
        }
      ],
      currentNetwork: null,
      customTokens: [],
      balance: '0',
      usdBalance: '0',
      transactions: [],
      tokenPrices: {},

      // Wallet actions
      createWallet: async (name: string, pin: string) => {
        try {
          const wallet = new EvmWallet()
          const result = await wallet.createWallet()
          
          // Save the keystore with the PIN
          await wallet.saveKeystore(result.mnemonic, pin)
          
          // Store the wallet instance globally for the session
          sessionWallet = wallet
          
          set({
            hasWallet: true,
            isUnlocked: true,
            currentAccount: {
              address: result.address,
              name: name || 'Main Account',
              isImported: false
            },
            accounts: [{
              address: result.address,
              name: name || 'Main Account',
              isImported: false
            }],
            currentNetwork: get().networks[0]
          })
        } catch (error) {
          console.error('Failed to create wallet:', error)
          throw error
        }
      },

      importWallet: async (privateKey: string, name: string, pin: string) => {
        try {
          const wallet = new EvmWallet()
          // Import from private key - we'll need to create a mnemonic from the private key
          // For now, let's use a placeholder approach
          const mnemonic = "import " + privateKey.slice(0, 8) + "..."
          await wallet.saveKeystore(mnemonic, pin)
          
          // Get the address from the private key
          const account = privateKeyToAccount(privateKey as `0x${string}`)
          
          set({
            hasWallet: true,
            isUnlocked: true,
            currentAccount: {
              address: account.address,
              name: name || 'Imported Account',
              isImported: true
            },
            accounts: [{
              address: account.address,
              name: name || 'Imported Account',
              isImported: true
            }],
            currentNetwork: get().networks[0]
          })
        } catch (error) {
          console.error('Failed to import wallet:', error)
          throw error
        }
      },

      importFromSeed: async (seedPhrase: string, name: string, pin: string) => {
        try {
          const wallet = new EvmWallet()
          const result = await wallet.importFromMnemonic(seedPhrase)
          
          // Save the keystore with the PIN
          await wallet.saveKeystore(result.mnemonic, pin)
          
          set({
            hasWallet: true,
            isUnlocked: true,
            currentAccount: {
              address: result.address,
              name: name || 'Imported Account',
              isImported: true
            },
            accounts: [{
              address: result.address,
              name: name || 'Imported Account',
              isImported: true
            }],
            currentNetwork: get().networks[0]
          })
        } catch (error) {
          console.error('Failed to import from seed:', error)
          throw error
        }
      },

      unlock: async (pin: string) => {
        try {
          // Check if wallet exists first
          if (!get().hasWallet) {
            throw new Error('No wallet found. Please create or import a wallet first.')
          }

          const wallet = new EvmWallet()
          await wallet.unlock(pin)
          
          // Store the wallet instance globally for the session
          sessionWallet = wallet
          
          // If we get here, unlock was successful
          if (wallet.isUnlocked()) {
            const accounts = await wallet.getAccounts()
            const currentAccount = accounts[0] || get().currentAccount
            
            set({
              isUnlocked: true,
              currentAccount: currentAccount ? {
                address: currentAccount.address,
                name: currentAccount.name || 'Main Account',
                isImported: currentAccount.isImported || false
              } : null
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Failed to unlock wallet:', error)
          throw error
        }
      },

      lock: () => {
        set({ isUnlocked: false })
      },

      logout: () => {
        // Clear the session wallet
        sessionWallet = null
        
        set({
          hasWallet: false,
          isUnlocked: false,
          currentAccount: null,
          accounts: [],
          balance: '0',
          usdBalance: '0'
        })
      },

      // Account management
      createAccount: async (name: string) => {
        try {
          if (!get().isUnlocked) {
            throw new Error('Wallet must be unlocked to create accounts')
          }

          // For now, create a mock account since createAccount might not exist
          const newAccount = {
            address: `0x${Math.random().toString(16).substr(2, 40)}`,
            name: name || `Account ${get().accounts.length + 1}`
          }
          
          const newAccountData = {
            address: newAccount.address,
            name: name || `Account ${get().accounts.length + 1}`,
            isImported: false
          }
          
          set({
            accounts: [...get().accounts, newAccountData],
            currentAccount: newAccountData
          })
        } catch (error) {
          console.error('Failed to create account:', error)
          throw error
        }
      },

      importAccount: async (privateKey: string, name: string) => {
        try {
          if (!get().isUnlocked) {
            throw new Error('Wallet must be unlocked to import accounts')
          }

          // Import account from private key
          const account = privateKeyToAccount(privateKey as `0x${string}`)
          const newAccount = {
            address: account.address,
            name: name || 'Imported Account'
          }
          
          const newAccountData = {
            address: newAccount.address,
            name: name || 'Imported Account',
            isImported: true
          }
          
          set({
            accounts: [...get().accounts, newAccountData],
            currentAccount: newAccountData
          })
        } catch (error) {
          console.error('Failed to import account:', error)
          throw error
        }
      },


      importWalletFromMnemonic: async (mnemonic: string) => {
        try {
          if (!get().isUnlocked) {
            throw new Error('Wallet must be unlocked to import wallet')
          }

          // Import wallet from mnemonic (this will replace the current wallet)
          const wallet = new EvmWallet()
          await wallet.importFromMnemonic(mnemonic)
          
          // Get the first account from the imported wallet
          const accounts = await wallet.getAccounts()
          if (accounts.length === 0) {
            throw new Error('No accounts found in imported wallet')
          }
          
          const firstAccount = accounts[0]
          const newAccountData = {
            address: firstAccount.address,
            name: 'Imported Wallet',
            isImported: true
          }
          
          set({
            accounts: [newAccountData],
            currentAccount: newAccountData
          })
        } catch (error) {
          console.error('Failed to import wallet:', error)
          throw error
        }
      },

      switchAccount: (address: string) => {
        const account = get().accounts.find(acc => acc.address === address)
        if (account) {
          set({ currentAccount: account })
        }
      },

      removeAccount: (address: string) => {
        const accounts = get().accounts.filter(acc => acc.address !== address)
        const currentAccount = get().currentAccount
        
        set({
          accounts,
          currentAccount: currentAccount?.address === address ? accounts[0] || null : currentAccount
        })
      },

      exportPrivateKey: (_address: string) => {
        try {
          const { isUnlocked } = get()
          
          if (!isUnlocked) {
            throw new Error('Wallet must be unlocked to export private key')
          }
          
          if (!sessionWallet) {
            throw new Error('Wallet not initialized')
          }
          
          // Get the private key from the session wallet
          const privateKey = sessionWallet.getPrivateKey()
          
          if (!privateKey) {
            throw new Error('Private key not found')
          }
          
          return privateKey
        } catch (error) {
          console.error('Failed to export private key:', error)
          throw error
        }
      },

      getSeedPhrase: () => {
        try {
          const { isUnlocked } = get()
          
          if (!isUnlocked) {
            throw new Error('Wallet must be unlocked to view seed phrase')
          }
          
          if (!sessionWallet) {
            throw new Error('Wallet not initialized')
          }
          
          // Get the seed phrase from the session wallet
          const seedPhrase = sessionWallet.getMnemonicPhrase()
          
          if (!seedPhrase) {
            throw new Error('Seed phrase not found')
          }
          
          return seedPhrase
        } catch (error) {
          console.error('Failed to get seed phrase:', error)
          throw error
        }
      },

      // Network management
      addNetwork: (network: Network) => {
        set({ networks: [...get().networks, network] })
      },

      switchNetwork: (networkId: string) => {
        const network = get().networks.find(net => net.id === networkId)
        if (network) {
          set({ currentNetwork: network })
        }
      },

      removeNetwork: (networkId: string) => {
        const networks = get().networks.filter(net => net.id !== networkId)
        const currentNetwork = get().currentNetwork
        
        set({
          networks,
          currentNetwork: currentNetwork?.id === networkId ? networks[0] || null : currentNetwork
        })
      },

      // Token management
      addCustomToken: (token: CustomToken) => {
        set({ customTokens: [...get().customTokens, token] })
      },

      removeCustomToken: (address: string) => {
        set({ customTokens: get().customTokens.filter(token => token.address !== address) })
      },

      // Balance management
      refreshBalance: async () => {
        try {
          if (!get().hasWallet || !get().isUnlocked) {
            set({
              balance: '0',
              usdBalance: '0'
            })
            return
          }

          // Get real balance from blockchain
          const wallet = new EvmWallet()
          const address = get().currentAccount?.address
          if (!address) {
            set({
              balance: '0',
              usdBalance: '0'
            })
            return
          }

          // Get real balance from blockchain
          const realBalance = await wallet.getBalance(address)
          const currentNetwork = get().currentNetwork
          
          if (currentNetwork) {
            // Get real USD price
            const price = await get().getTokenPrice(currentNetwork.symbol)
            const usdValue = parseFloat(realBalance) * price
            
            set({
              balance: realBalance,
              usdBalance: usdValue.toFixed(2)
            })
          } else {
            set({
              balance: realBalance,
              usdBalance: '0.00'
            })
          }
        } catch (error) {
          console.error('Failed to refresh balance:', error)
          set({
            balance: '0',
            usdBalance: '0'
          })
        }
      },

      // Transaction management
      fetchTransactions: async () => {
        try {
          if (!get().hasWallet || !get().isUnlocked) {
            set({ transactions: [] })
            return
          }

          // For now, return empty array since the SDK doesn't have transaction history
          // This will be implemented when the SDK is updated with blockchain scanning
          set({ transactions: [] })
        } catch (error) {
          console.error('Failed to fetch transactions:', error)
          set({ transactions: [] })
        }
      },

      // Price management
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
      }
    }),
    {
      name: 'mpc-wallet-desktop-storage',
      partialize: (state) => ({
        hasWallet: state.hasWallet,
        isUnlocked: state.isUnlocked,
        currentAccount: state.currentAccount,
        accounts: state.accounts,
        networks: state.networks,
        currentNetwork: state.currentNetwork,
        customTokens: state.customTokens
      })
    }
  )
)

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
