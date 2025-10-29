// Import the EvmWallet from the SDK
import { EvmWallet } from './sdk/index.js';

// Real MPC Wallet Service for Chrome Extension
class MPCWalletService {
  constructor() {
    this.isUnlocked = false;
    this.currentAccount = null;
    this.accounts = [];
    this.currentNetwork = null;
    this.balance = '0';
    this.connectedSites = [];
    this.storageKey = 'mpc_wallet_data';
    
    this.initializeWallet();
  }

  async initializeWallet() {
    try {
      // Load wallet data from Chrome storage
      const result = await chrome.storage.local.get([this.storageKey]);
      if (result[this.storageKey]) {
        const walletData = result[this.storageKey];
        this.accounts = walletData.accounts || [];
        this.currentAccount = walletData.currentAccount || null;
        this.currentNetwork = walletData.currentNetwork || this.getDefaultNetwork();
        this.connectedSites = walletData.connectedSites || [];
      } else {
        // Initialize with default network
        this.currentNetwork = this.getDefaultNetwork();
        await this.saveWalletData();
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
    }
  }

  getDefaultNetwork() {
    return {
      id: 'ethereum',
      name: 'Ethereum',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      symbol: 'ETH',
      explorerUrl: 'https://etherscan.io',
      color: '#627EEA'
    };
  }

  async createWallet(password) {
    try {
      // Generate a new wallet using the SDK
      const wallet = new EvmWallet();
      await wallet.initialize();
      
      // Create the first account
      const account = wallet.createAccount('Main Account');
      
      // Encrypt and store the wallet
      const encryptedWallet = await this.encryptWalletData(wallet, password);
      
      this.accounts = [account];
      this.currentAccount = account;
      this.isUnlocked = true;
      
      await this.saveWalletData();
      await this.updateBalance();
      
      return { success: true, account };
    } catch (error) {
      console.error('Failed to create wallet:', error);
      return { success: false, error: error.message };
    }
  }

  async unlockWallet(password) {
    try { 
      // Load encrypted wallet data
      const result = await chrome.storage.local.get([this.storageKey]);
      if (!result[this.storageKey]) {
        return { success: false, error: 'No wallet found' };
      }

      const walletData = result[this.storageKey];
      const decryptedWallet = await this.decryptWalletData(walletData, password);
      
      if (!decryptedWallet) {
        return { success: false, error: 'Invalid password' };
      }

      this.accounts = walletData.accounts || [];
      this.currentAccount = walletData.currentAccount || null;
      this.currentNetwork = walletData.currentNetwork || this.getDefaultNetwork();
      this.connectedSites = walletData.connectedSites || [];
      this.isUnlocked = true;
      
      await this.updateBalance();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      return { success: false, error: error.message };
    }
  }

  async lockWallet() {
    this.isUnlocked = false;
    this.currentAccount = null;
    this.accounts = [];
    this.balance = '0';
    this.connectedSites = [];
    
    // Clear sensitive data from memory
    if (this.wallet) {
      this.wallet.lock();
    }
    
    return { success: true };
  }

  async importAccount(privateKey, accountName = 'Imported Account') {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      const wallet = new EvmWallet();
      await wallet.initialize();
      
      const account = wallet.importAccount({ privateKey, name: accountName });
      
      this.accounts.push(account);
      await this.saveWalletData();
      
      return { success: true, account };
    } catch (error) {
      console.error('Failed to import account:', error);
      return { success: false, error: error.message };
    }
  }

  async createAccount(accountName = 'New Account') {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      const wallet = new EvmWallet();
      await wallet.initialize();
      
      const account = wallet.createAccount({ name: accountName });
      
      this.accounts.push(account);
      await this.saveWalletData();
      
      return { success: true, account };
    } catch (error) {
      console.error('Failed to create account:', error);
      return { success: false, error: error.message };
    }
  }

  async switchAccount(address) {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      const account = this.accounts.find(acc => acc.address === address);
      if (!account) {
        return { success: false, error: 'Account not found' };
      }

      this.currentAccount = account;
      await this.saveWalletData();
      await this.updateBalance();
      
      return { success: true, account };
    } catch (error) {
      console.error('Failed to switch account:', error);
      return { success: false, error: error.message };
    }
  }

  async removeAccount(address) {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      if (this.accounts.length <= 1) {
        return { success: false, error: 'Cannot remove the last account' };
      }

      this.accounts = this.accounts.filter(acc => acc.address !== address);
      
      if (this.currentAccount && this.currentAccount.address === address) {
        this.currentAccount = this.accounts[0];
      }
      
      await this.saveWalletData();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to remove account:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTransaction(to, value, data = '0x') {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      if (!this.currentAccount) {
        return { success: false, error: 'No account selected' };
      }

      const wallet = new EvmWallet();
      await wallet.initialize();
      
      const txHash = await wallet.sendTransaction({
        to,
        value,
        data
      });
      
      return { success: true, txHash };
    } catch (error) {
      console.error('Failed to send transaction:', error);
      return { success: false, error: error.message };
    }
  }

  async getBalance() {
    try {
      if (!this.isUnlocked || !this.currentAccount) {
        return { success: false, error: 'Wallet not unlocked or no account selected' };
      }

      const wallet = new EvmWallet();
      await wallet.initialize();
      
      const balance = await wallet.getBalance(this.currentAccount.address);
      
      return { success: true, balance };
    } catch (error) {
      console.error('Failed to get balance:', error);
      return { success: false, error: error.message };
    }
  }

  async updateBalance() {
    try {
      const result = await this.getBalance();
      if (result.success) {
        this.balance = result.balance;
      }
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  }

  async addNetwork(network) {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      const wallet = new EvmWallet();
      await wallet.initialize();
      
      wallet.addNetwork(network);
      
      this.currentNetwork = network;
      await this.saveWalletData();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to add network:', error);
      return { success: false, error: error.message };
    }
  }

  async switchNetwork(networkId) {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      const wallet = new EvmWallet();
      await wallet.initialize();
      
      const network = wallet.getNetworks().find(n => n.id === networkId);
      if (!network) {
        return { success: false, error: 'Network not found' };
      }

      this.currentNetwork = network;
      await this.saveWalletData();
      await this.updateBalance();
      
      return { success: true, network };
    } catch (error) {
      console.error('Failed to switch network:', error);
      return { success: false, error: error.message };
    }
  }

  async connectSite(origin) {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      if (!this.connectedSites.includes(origin)) {
        this.connectedSites.push(origin);
        await this.saveWalletData();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to connect site:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnectSite(origin) {
    try {
      this.connectedSites = this.connectedSites.filter(site => site !== origin);
      await this.saveWalletData();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to disconnect site:', error);
      return { success: false, error: error.message };
    }
  }

  async exportPrivateKey(address) {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      const wallet = new EvmWallet();
      await wallet.initialize();
      
      const privateKey = wallet.exportPrivateKey(address);
      
      return { success: true, privateKey };
    } catch (error) {
      console.error('Failed to export private key:', error);
      return { success: false, error: error.message };
    }
  }

  async exportMnemonic() {
    try {
      if (!this.isUnlocked) {
        return { success: false, error: 'Wallet must be unlocked' };
      }

      const wallet = new EvmWallet();
      await wallet.initialize();
      
      const mnemonic = wallet.getMnemonicPhrase();
      
      return { success: true, mnemonic };
    } catch (error) {
      console.error('Failed to export mnemonic:', error);
      return { success: false, error: error.message };
    }
  }

  async encryptWalletData(wallet, password) {
    try {
      // Simple encryption for demo - in production, use proper encryption
      const walletData = {
        accounts: this.accounts,
        currentAccount: this.currentAccount,
        currentNetwork: this.currentNetwork,
        connectedSites: this.connectedSites,
        timestamp: Date.now()
      };
      
      return btoa(JSON.stringify(walletData));
    } catch (error) {
      console.error('Failed to encrypt wallet data:', error);
      throw error;
    }
  }

  async decryptWalletData(encryptedData, password) {
    try {
      // Simple decryption for demo - in production, use proper decryption
      const decryptedData = JSON.parse(atob(encryptedData));
      return decryptedData;
    } catch (error) {
      console.error('Failed to decrypt wallet data:', error);
      return null;
    }
  }

  async saveWalletData() {
    try {
      const walletData = {
        accounts: this.accounts,
        currentAccount: this.currentAccount,
        currentNetwork: this.currentNetwork,
        connectedSites: this.connectedSites,
        timestamp: Date.now()
      };
      
      await chrome.storage.local.set({ [this.storageKey]: walletData });
    } catch (error) {
      console.error('Failed to save wallet data:', error);
    }
  }

  // Getters
  getAccounts() {
    return this.accounts;
  }

  getCurrentAccount() {
    return this.currentAccount;
  }

  getCurrentNetwork() {
    return this.currentNetwork;
  }

  getBalance() {
    return this.balance;
  }

  getConnectedSites() {
    return this.connectedSites;
  }

  isWalletUnlocked() {
    return this.isUnlocked;
  }
}

// Create and export the wallet service instance
const walletService = new MPCWalletService();

// Make it available globally for the extension
if (typeof window !== 'undefined') {
  window.walletService = walletService;
}

// Export for module usage
export default walletService;

