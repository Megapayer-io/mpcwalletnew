import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EvmWallet } from '../wallet.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('EvmWallet', () => {
  let wallet: EvmWallet;

  beforeEach(() => {
    wallet = new EvmWallet();
    vi.clearAllMocks();
  });

  it('should create a new wallet', async () => {
    const result = await wallet.createWallet();
    
    expect(result.mnemonic).toBeDefined();
    expect(result.address).toBeDefined();
    expect(result.mnemonic.split(' ')).toHaveLength(12);
    expect(wallet.isUnlocked()).toBe(true);
    expect(wallet.getAddress()).toBe(result.address);
  });

  it('should import wallet from mnemonic', async () => {
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const result = await wallet.importFromMnemonic(testMnemonic);
    
    expect(result.mnemonic).toBe(testMnemonic);
    expect(result.address).toBeDefined();
    expect(wallet.isUnlocked()).toBe(true);
    expect(wallet.getAddress()).toBe(result.address);
  });

  it('should reject invalid mnemonic', async () => {
    const invalidMnemonic = 'invalid mnemonic phrase';
    
    await expect(wallet.importFromMnemonic(invalidMnemonic)).rejects.toThrow('Invalid mnemonic phrase');
  });

  it('should lock and unlock wallet', async () => {
    await wallet.createWallet();
    expect(wallet.isUnlocked()).toBe(true);
    
    wallet.lock();
    expect(wallet.isUnlocked()).toBe(false);
    expect(wallet.getAddress()).toBeUndefined();
  });

  it('should list default networks', () => {
    const networks = wallet.listNetworks();
    
    expect(networks).toHaveLength(4);
    expect(networks[0].name).toBe('Ethereum Mainnet');
    expect(networks[1].name).toBe('BNB Smart Chain');
    expect(networks[2].name).toBe('Polygon');
    expect(networks[3].name).toBe('Sepolia Testnet');
  });

  it('should add and select networks', () => {
    const newNetwork = {
      chainId: 100,
      name: 'Gnosis Chain',
      rpcUrl: 'https://rpc.gnosischain.com',
      symbol: 'XDAI',
      blockExplorer: 'https://gnosisscan.io'
    };
    
    wallet.addNetwork(newNetwork);
    const networks = wallet.listNetworks();
    
    expect(networks).toHaveLength(5);
    expect(networks.find(n => n.chainId === 100)).toBeDefined();
    
    wallet.selectNetwork(100);
    expect(wallet.getCurrentNetwork()?.chainId).toBe(100);
  });

  it('should reject duplicate network', () => {
    const duplicateNetwork = {
      chainId: 1, // Ethereum mainnet already exists
      name: 'Duplicate Ethereum',
      rpcUrl: 'https://eth.llamarpc.com',
      symbol: 'ETH'
    };
    
    expect(() => wallet.addNetwork(duplicateNetwork)).toThrow('Network with chain ID 1 already exists');
  });

  it('should clear storage', () => {
    wallet.clearStorage();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('evm-wallet-keystore');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('evm-wallet-state');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('evm-wallet-networks');
  });
});
