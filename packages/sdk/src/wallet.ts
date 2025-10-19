import { createWalletClient, createPublicClient, http, parseEther, formatEther, getContract } from 'viem';
import { mnemonicToAccount } from 'viem/accounts';
import { generateMnemonic, validateMnemonic } from 'bip39';
import { encrypt, decrypt } from './crypto.js';
import { Keystore } from './types.js';
import { Network, WalletState, SendEthParams, SendErc20Params, TokenBalanceParams, AddNetworkParams } from './types.js';
import { loadNetworks, saveNetworks, addNetwork as addNetworkUtil, findNetwork } from './networks.js';

const KEYSTORE_STORAGE_KEY = 'evm-wallet-keystore';
const STATE_STORAGE_KEY = 'evm-wallet-state';

export class EvmWallet {
  private state: WalletState;
  private privateKey?: `0x${string}`;
  private account?: any;

  constructor() {
    this.state = {
      isUnlocked: false,
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

    this.account = mnemonicToAccount(mnemonic);
    this.privateKey = this.account.source as `0x${string}`;
    
    this.state.address = this.account.address;
    this.state.isUnlocked = true;
    
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
    this.state.isUnlocked = false;
    this.state.address = undefined;
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
      await this.importFromMnemonic(decryptedMnemonic);
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
    return this.state.address;
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

    const targetAddress = address || this.state.address;
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
   * Get ERC-20 token balance
   */
  async getTokenBalance(params: TokenBalanceParams): Promise<string> {
    if (!this.state.currentNetwork) {
      throw new Error('No network selected');
    }

    const targetAddress = params.address || this.state.address;
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
    localStorage.removeItem('evm-wallet-networks');
    
    this.state = {
      isUnlocked: false,
      networks: loadNetworks(),
      currentNetwork: loadNetworks()[0]
    };
  }
}
