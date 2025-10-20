import { createWalletClient, createPublicClient, http, parseEther, formatEther, getContract } from 'viem';
import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts';
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from 'bip39';
import { HDKey } from '@scure/bip32';
import { encrypt, decrypt } from './crypto.js';
import { Keystore } from './types.js';
import { Network, WalletState, SendEthParams, SendErc20Params, TokenBalanceParams, AddNetworkParams, Account, ImportAccountParams, CreateAccountParams, TransferNftParams } from './types.js';
import { loadNetworks, saveNetworks, addNetwork as addNetworkUtil, findNetwork } from './networks.js';

/**
 * Validate and format a private key
 */
function validateAndFormatPrivateKey(privateKey: string): string {
  if (!privateKey || typeof privateKey !== 'string') {
    throw new Error('Private key must be a non-empty string');
  }

  let formattedPrivateKey = privateKey.trim();
  
  // Remove 0x prefix if present for validation
  const cleanKey = formattedPrivateKey.startsWith('0x') 
    ? formattedPrivateKey.slice(2) 
    : formattedPrivateKey;
  
  // Validate hex format and length (64 characters for 32 bytes)
  if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    throw new Error('Private key must be 64 hex characters (32 bytes)');
  }
  
  // Ensure 0x prefix
  if (!formattedPrivateKey.startsWith('0x')) {
    formattedPrivateKey = `0x${formattedPrivateKey}`;
  }
  
  return formattedPrivateKey;
}

/**
 * Derive private key from mnemonic and account index
 */
function derivePrivateKeyFromMnemonic(mnemonic: string, accountIndex: number = 0): string {
  const seed = mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const derived = root.derive(`m/44'/60'/0'/0/${accountIndex}`);
  
  if (!derived.privateKey) {
    throw new Error('Failed to derive private key from mnemonic');
  }
  
  return `0x${Buffer.from(derived.privateKey).toString('hex')}`;
}

const KEYSTORE_STORAGE_KEY = 'evm-wallet-keystore';
const STATE_STORAGE_KEY = 'evm-wallet-state';
const ACCOUNTS_STORAGE_KEY = 'evm-wallet-accounts';

export class EvmWallet {
  private state: WalletState;
  private privateKey?: `0x${string}`;
  private account?: any;
  private accounts: Map<string, { account: any; privateKey: string }> = new Map();
  private mnemonic?: string;

  constructor() {
    this.state = {
      isUnlocked: false,
      accounts: [],
      networks: loadNetworks(),
      currentNetwork: loadNetworks()[0] // Default to first network
    };
  }

  /**
   * Create a new wallet with random mnemonic
   */
  async createWallet(): Promise<{ mnemonic: string; address: string }> {
    const mnemonic = generateMnemonic();
    return this.importFromMnemonic(mnemonic);
  }

  /**
   * Import wallet from mnemonic
   */
  async importFromMnemonic(mnemonic: string): Promise<{ mnemonic: string; address: string }> {
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    this.mnemonic = mnemonic; // Store the mnemonic
    
    // Derive the private key properly
    this.privateKey = derivePrivateKeyFromMnemonic(mnemonic, 0) as `0x${string}`;
    
    // Create account from the derived private key
    this.account = privateKeyToAccount(this.privateKey);
    
    // Create the first account
    const firstAccount: Account = {
      address: this.account.address,
      name: 'Account 1',
      isImported: false,
      index: 0
    };

    // Store account data with properly derived private key
    this.accounts.set(this.account.address.toLowerCase(), {
      account: this.account,
      privateKey: this.privateKey
    });

    this.state.accounts = [firstAccount];
    this.state.currentAccount = firstAccount;
    this.state.isUnlocked = true;
    
    this.saveAccounts();
    this.saveState();
    
    return {
      mnemonic,
      address: this.account.address
    };
  }

  /**
   * Lock the wallet (clear sensitive data from memory)
   */
  lock(): void {
    this.privateKey = undefined;
    this.account = undefined;
    this.mnemonic = undefined; // Clear mnemonic from memory
    this.state.isUnlocked = false;
    this.state.currentAccount = undefined;
    this.saveState();
  }

  /**
   * Unlock wallet with password
   */
  async unlock(password: string): Promise<void> {
    const keystore = this.loadKeystore();
    if (!keystore) {
      throw new Error('No keystore found. Please create or import a wallet first.');
    }

    try {
      const decryptedMnemonic = await decrypt(keystore, password);
      
      // Store the mnemonic for account creation
      this.mnemonic = decryptedMnemonic;
      
      // Derive the private key properly
      this.privateKey = derivePrivateKeyFromMnemonic(decryptedMnemonic, 0) as `0x${string}`;
      
      // Create account from the derived private key
      this.account = privateKeyToAccount(this.privateKey);
      
      // Load accounts data
      this.loadAccounts();
      
      // Set current account if available
      if (this.state.currentAccount) {
        const accountData = this.accounts.get(this.state.currentAccount.address.toLowerCase());
        if (accountData) {
          this.account = accountData.account;
          this.privateKey = accountData.privateKey as `0x${string}`;
        }
      }
      
      this.state.isUnlocked = true;
      this.saveState();
    } catch (error) {
      throw new Error('Invalid password');
    }
  }

  /**
   * Check if wallet is unlocked
   */
  isUnlocked(): boolean {
    return this.state.isUnlocked;
  }

  /**
   * Check if a keystore exists (wallet has been created/imported)
   */
  hasKeystore(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const keystore = localStorage.getItem(KEYSTORE_STORAGE_KEY);
      return keystore !== null;
    } catch (error) {
      console.error('Failed to check keystore:', error);
      return false;
    }
  }

  /**
   * Get current wallet address
   */
  getAddress(): string | undefined {
    return this.state.currentAccount?.address;
  }

  /**
   * Get all accounts
   */
  getAccounts(): Account[] {
    return this.state.accounts;
  }

  /**
   * Get current account
   */
  getCurrentAccount(): Account | undefined {
    return this.state.currentAccount;
  }

  /**
   * Switch to a different account
   */
  switchAccount(address: string): void {
    const account = this.state.accounts.find(acc => acc.address.toLowerCase() === address.toLowerCase());
    if (!account) {
      throw new Error('Account not found');
    }

    const accountData = this.accounts.get(address.toLowerCase());
    if (!accountData) {
      throw new Error('Account data not found');
    }

    this.state.currentAccount = account;
    this.account = accountData.account;
    this.privateKey = accountData.privateKey as `0x${string}`;
    this.saveState();
  }

  /**
   * Create a new account from the current mnemonic
   */
  createAccount(params: CreateAccountParams): Account {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to create accounts');
    }

    // Get the next account index
    const nextIndex = this.state.accounts.filter(acc => !acc.isImported).length;
    
    // Derive private key from mnemonic
    const mnemonic = this.getMnemonic();
    const derivedPrivateKey = derivePrivateKeyFromMnemonic(mnemonic, nextIndex) as `0x${string}`;
    const derivedAccount = privateKeyToAccount(derivedPrivateKey);
    
    const newAccount: Account = {
      address: derivedAccount.address,
      name: params.name || `Account ${nextIndex + 1}`,
      isImported: false,
      index: nextIndex
    };

    // Store account data with properly derived private key
    this.accounts.set(derivedAccount.address.toLowerCase(), {
      account: derivedAccount,
      privateKey: derivedPrivateKey
    });

    // Add to accounts list
    this.state.accounts.push(newAccount);
    this.saveAccounts();
    this.saveState();

    return newAccount;
  }

  /**
   * Import an account from private key
   */
  importAccount(params: ImportAccountParams): Account {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to import accounts');
    }

    try {
      const formattedPrivateKey = validateAndFormatPrivateKey(params.privateKey);
      const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
      
      // Check if account already exists
      const existingAccount = this.state.accounts.find(acc => 
        acc.address.toLowerCase() === account.address.toLowerCase()
      );
      
      if (existingAccount) {
        throw new Error('Account already exists');
      }

      const newAccount: Account = {
        address: account.address,
        name: params.name || `Imported Account`,
        isImported: true
      };

      // Store account data with properly formatted private key
      this.accounts.set(account.address.toLowerCase(), {
        account: account,
        privateKey: formattedPrivateKey
      });

      // Add to accounts list
      this.state.accounts.push(newAccount);
      this.saveAccounts();
      this.saveState();

      return newAccount;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Invalid private key');
    }
  }

  /**
   * Remove an account
   */
  removeAccount(address: string): void {
    if (this.state.accounts.length <= 1) {
      throw new Error('Cannot remove the last account');
    }

    const accountIndex = this.state.accounts.findIndex(acc => 
      acc.address.toLowerCase() === address.toLowerCase()
    );

    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    // Remove from accounts list
    this.state.accounts.splice(accountIndex, 1);
    
    // Remove from accounts map
    this.accounts.delete(address.toLowerCase());

    // If we removed the current account, switch to the first remaining account
    if (this.state.currentAccount?.address.toLowerCase() === address.toLowerCase()) {
      const firstAccount = this.state.accounts[0];
      this.switchAccount(firstAccount.address);
    }

    this.saveAccounts();
    this.saveState();
  }

  /**
   * Export private key for an account
   */
  exportPrivateKey(address: string): string {
    if (!this.state.isUnlocked) {
      throw new Error('Wallet must be unlocked to export private key');
    }

    const accountData = this.accounts.get(address.toLowerCase());
    if (!accountData) {
      throw new Error('Account not found');
    }

    return accountData.privateKey;
  }

  /**
   * Get mnemonic (only for main account)
   */
  private getMnemonic(): string {
    if (!this.mnemonic) {
      throw new Error('Mnemonic not available. Wallet must be unlocked to create accounts.');
    }
    return this.mnemonic;
  }

  /**
   * Add a new network
   */
  addNetwork(params: AddNetworkParams): void {
    const newNetwork: Network = {
      chainId: params.chainId,
      name: params.name,
      rpcUrl: params.rpcUrl,
      symbol: params.symbol,
      blockExplorer: params.blockExplorer
    };

    this.state.networks = addNetworkUtil(this.state.networks, newNetwork);
    this.saveState();
  }

  /**
   * Select a network by chain ID
   */
  selectNetwork(chainId: number): void {
    const network = findNetwork(this.state.networks, chainId);
    if (!network) {
      throw new Error(`Network with chain ID ${chainId} not found`);
    }
    
    this.state.currentNetwork = network;
    this.saveState();
  }

  /**
   * Get current network
   */
  getCurrentNetwork(): Network | undefined {
    return this.state.currentNetwork;
  }

  /**
   * List all networks
   */
  listNetworks(): Network[] {
    return this.state.networks;
  }

  /**
   * Get native balance
   */
  async getBalance(address?: string): Promise<string> {
    if (!this.state.currentNetwork) {
      throw new Error('No network selected');
    }

    const targetAddress = address || this.state.currentAccount?.address;
    if (!targetAddress) {
      throw new Error('No address available');
    }

    const publicClient = createPublicClient({
      chain: {
        id: this.state.currentNetwork.chainId,
        name: this.state.currentNetwork.name,
        rpcUrls: {
          default: { http: [this.state.currentNetwork.rpcUrl] }
        },
        nativeCurrency: {
          name: this.state.currentNetwork.symbol,
          symbol: this.state.currentNetwork.symbol,
          decimals: 18
        },
        blockExplorers: this.state.currentNetwork.blockExplorer ? {
          default: { name: 'Explorer', url: this.state.currentNetwork.blockExplorer }
        } : undefined
      },
      transport: http()
    });

    const balance = await publicClient.getBalance({
      address: targetAddress as `0x${string}`
    });

    return formatEther(balance);
  }

  /**
   * Send ETH
   */
  async sendEth(params: SendEthParams): Promise<`0x${string}`> {
    if (!this.isUnlocked() || !this.account || !this.state.currentNetwork) {
      throw new Error('Wallet not unlocked or no network selected');
    }

    const walletClient = createWalletClient({
      account: this.account,
      chain: {
        id: this.state.currentNetwork.chainId,
        name: this.state.currentNetwork.name,
        rpcUrls: {
          default: { http: [this.state.currentNetwork.rpcUrl] }
        },
        nativeCurrency: {
          name: this.state.currentNetwork.symbol,
          symbol: this.state.currentNetwork.symbol,
          decimals: 18
        }
      },
      transport: http()
    });

    const hash = await walletClient.sendTransaction({
      account: this.account,
      to: params.to as `0x${string}`,
      value: parseEther(params.valueEth)
    });

    return hash;
  }

  /**
   * Send ERC-20 token
   */
  async sendErc20(params: SendErc20Params): Promise<`0x${string}`> {
    if (!this.isUnlocked() || !this.account || !this.state.currentNetwork) {
      throw new Error('Wallet not unlocked or no network selected');
    }

    const walletClient = createWalletClient({
      account: this.account,
      chain: {
        id: this.state.currentNetwork.chainId,
        name: this.state.currentNetwork.name,
        rpcUrls: {
          default: { http: [this.state.currentNetwork.rpcUrl] }
        },
        nativeCurrency: {
          name: this.state.currentNetwork.symbol,
          symbol: this.state.currentNetwork.symbol,
          decimals: 18
        }
      },
      transport: http()
    });

    const publicClient = createPublicClient({
      chain: walletClient.chain,
      transport: http()
    });

    // ERC-20 transfer function ABI
    const erc20Abi = [
      {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      }
    ] as const;

    const contract = getContract({
      address: params.tokenAddress as `0x${string}`,
      abi: erc20Abi,
      client: { wallet: walletClient, public: publicClient }
    });

    const amount = BigInt(params.amount) * BigInt(10 ** params.decimals);

    const hash = await contract.write.transfer([
      params.to as `0x${string}`,
      amount
    ], {
      account: this.account
    });

    return hash;
  }

  /**
   * Get ERC-20 token metadata (name, symbol, decimals)
   */
  async getTokenMetadata(tokenAddress: string): Promise<{ name: string; symbol: string; decimals: number }> {
    if (!this.state.currentNetwork) {
      throw new Error('No network selected');
    }

    const publicClient = createPublicClient({
      chain: {
        id: this.state.currentNetwork.chainId,
        name: this.state.currentNetwork.name,
        rpcUrls: {
          default: { http: [this.state.currentNetwork.rpcUrl] }
        },
        nativeCurrency: {
          name: this.state.currentNetwork.symbol,
          symbol: this.state.currentNetwork.symbol,
          decimals: 18
        }
      },
      transport: http()
    });

    // ERC-20 metadata ABI
    const erc20MetadataAbi = [
      {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }]
      },
      {
        name: 'symbol',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }]
      },
      {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }]
      }
    ] as const;

    const contract = getContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20MetadataAbi,
      client: { public: publicClient }
    });

    try {
      const [name, symbol, decimals] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(),
        contract.read.decimals()
      ]);

      return {
        name: name as string,
        symbol: symbol as string,
        decimals: Number(decimals)
      };
    } catch (error) {
      throw new Error('Invalid token contract or failed to fetch metadata');
    }
  }

  /**
   * Get ERC-20 token balance
   */
  async getTokenBalance(params: TokenBalanceParams): Promise<string> {
    if (!this.state.currentNetwork) {
      throw new Error('No network selected');
    }

    const targetAddress = params.address || this.state.currentAccount?.address;
    if (!targetAddress) {
      throw new Error('No address available');
    }

    const publicClient = createPublicClient({
      chain: {
        id: this.state.currentNetwork.chainId,
        name: this.state.currentNetwork.name,
        rpcUrls: {
          default: { http: [this.state.currentNetwork.rpcUrl] }
        },
        nativeCurrency: {
          name: this.state.currentNetwork.symbol,
          symbol: this.state.currentNetwork.symbol,
          decimals: 18
        }
      },
      transport: http()
    });

    // ERC-20 balanceOf function ABI
    const erc20Abi = [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ] as const;

    const contract = getContract({
      address: params.tokenAddress as `0x${string}`,
      abi: erc20Abi,
      client: { public: publicClient }
    });

    const balance = await contract.read.balanceOf([targetAddress as `0x${string}`]);
    const formattedBalance = Number(balance) / (10 ** params.decimals);
    
    return formattedBalance.toString();
  }

  /**
   * Save encrypted keystore
   */
  async saveKeystore(mnemonic: string, password: string): Promise<void> {
    const keystore = await encrypt(mnemonic, password);
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYSTORE_STORAGE_KEY, JSON.stringify(keystore));
    }
  }

  /**
   * Load keystore from storage
   */
  private loadKeystore(): Keystore | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(KEYSTORE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load keystore:', error);
      return null;
    }
  }

  /**
   * Save wallet state
   */
  private saveState(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(this.state));
    }
  }

  /**
   * Save accounts data (encrypted)
   */
  private saveAccounts(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const accountsData = Array.from(this.accounts.entries()).map(([address, data]) => ({
        address,
        privateKey: data.privateKey
      }));
      
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accountsData));
    } catch (error) {
      console.error('Failed to save accounts:', error);
    }
  }

  /**
   * Load accounts data (encrypted)
   */
  private loadAccounts(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        const accountsData = JSON.parse(stored);
        accountsData.forEach(({ address, privateKey }: { address: string; privateKey: string }) => {
          try {
            const formattedPrivateKey = validateAndFormatPrivateKey(privateKey);
            const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
            this.accounts.set(address.toLowerCase(), {
              account,
              privateKey: formattedPrivateKey
            });
          } catch (keyError) {
            console.error(`Failed to load account ${address}:`, keyError);
            // Skip this account if the private key is invalid
          }
        });
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  }

  /**
   * Load wallet state
   */
  loadState(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = {
          ...this.state,
          ...parsed,
          isUnlocked: false // Always start locked
        };
      }
      
      // Load accounts data
      this.loadAccounts();
    } catch (error) {
      console.error('Failed to load wallet state:', error);
    }
  }

  /**
   * Clear all stored data (for logout)
   */
  clearStorage(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(KEYSTORE_STORAGE_KEY);
    localStorage.removeItem(STATE_STORAGE_KEY);
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    localStorage.removeItem('evm-wallet-networks');
    
    this.accounts.clear();
    this.state = {
      isUnlocked: false,
      accounts: [],
      networks: loadNetworks(),
      currentNetwork: loadNetworks()[0]
    };
  }

  /**
   * Clear corrupted account data (for debugging)
   */
  clearCorruptedAccounts(): void {
    if (typeof window === 'undefined') return;
    
    console.log('Clearing corrupted account data...');
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    this.accounts.clear();
    
    // Reset accounts in state
    this.state.accounts = [];
    this.state.currentAccount = undefined;
    this.saveState();
    
    console.log('Corrupted account data cleared');
  }

  /**
   * Transfer NFT (ERC721 or ERC1155)
   */
  async transferNft(params: TransferNftParams): Promise<string> {
    if (!this.state.currentAccount || !this.state.currentNetwork) {
      throw new Error('No account or network selected');
    }

    const { contractAddress, tokenId, to, amount = '1' } = params;
    
    // Get the private key for the current account
    const accountData = this.accounts.get(this.state.currentAccount.address);
    if (!accountData) {
      throw new Error('Private key not found for current account');
    }

    const account = privateKeyToAccount(accountData.privateKey as `0x${string}`);
    
    const publicClient = createPublicClient({
      chain: {
        id: this.state.currentNetwork.chainId,
        name: this.state.currentNetwork.name,
        rpcUrls: {
          default: { http: [this.state.currentNetwork.rpcUrl] }
        },
        nativeCurrency: {
          name: this.state.currentNetwork.symbol,
          symbol: this.state.currentNetwork.symbol,
          decimals: 18
        }
      },
      transport: http()
    });

    const walletClient = createWalletClient({
      account,
      chain: {
        id: this.state.currentNetwork.chainId,
        name: this.state.currentNetwork.name,
        rpcUrls: {
          default: { http: [this.state.currentNetwork.rpcUrl] }
        },
        nativeCurrency: {
          name: this.state.currentNetwork.symbol,
          symbol: this.state.currentNetwork.symbol,
          decimals: 18
        }
      },
      transport: http()
    });

    try {
      // First, determine if it's ERC721 or ERC1155 by checking the contract
      const erc721Abi = [
        {
          name: 'supportsInterface',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'interfaceId', type: 'bytes4' }],
          outputs: [{ name: '', type: 'bool' }]
        },
        {
          name: 'safeTransferFrom',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' }
          ],
          outputs: []
        }
      ] as const;

      const erc1155Abi = [
        {
          name: 'supportsInterface',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'interfaceId', type: 'bytes4' }],
          outputs: [{ name: '', type: 'bool' }]
        },
        {
          name: 'safeTransferFrom',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'id', type: 'uint256' },
            { name: 'amount', type: 'uint256' },
            { name: 'data', type: 'bytes' }
          ],
          outputs: []
        }
      ] as const;

      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: erc721Abi,
        client: { public: publicClient }
      });

      // Check if it supports ERC721 interface (0x80ac58cd)
      const isERC721 = await contract.read.supportsInterface(['0x80ac58cd']);
      
      if (isERC721) {
        // ERC721 transfer
        const hash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: erc721Abi,
          functionName: 'safeTransferFrom',
          args: [
            this.state.currentAccount.address as `0x${string}`,
            to as `0x${string}`,
            BigInt(tokenId)
          ]
        });
        
        return hash;
      } else {
        // Check if it supports ERC1155 interface (0xd9b67a26)
        const erc1155Contract = getContract({
          address: contractAddress as `0x${string}`,
          abi: erc1155Abi,
          client: { public: publicClient }
        });
        
        const isERC1155 = await erc1155Contract.read.supportsInterface(['0xd9b67a26']);
        
        if (isERC1155) {
          // ERC1155 transfer
          const hash = await walletClient.writeContract({
            address: contractAddress as `0x${string}`,
            abi: erc1155Abi,
            functionName: 'safeTransferFrom',
            args: [
              this.state.currentAccount.address as `0x${string}`,
              to as `0x${string}`,
              BigInt(tokenId),
              BigInt(amount),
              '0x' // Empty data
            ]
          });
          
          return hash;
        } else {
          throw new Error('Contract does not support ERC721 or ERC1155 standards');
        }
      }
    } catch (error) {
      throw new Error(`Failed to transfer NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
