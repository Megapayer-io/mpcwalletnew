import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadNetworks, saveNetworks, addNetwork, removeNetwork, findNetwork, DEFAULT_NETWORKS } from '../networks.js';

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

describe('Networks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load default networks when no stored data', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const networks = loadNetworks();
    
    expect(networks).toEqual(DEFAULT_NETWORKS);
    expect(networks).toHaveLength(4);
  });

  it('should load networks from localStorage', () => {
    const storedNetworks = [
      { chainId: 1, name: 'Ethereum', rpcUrl: 'https://eth.llamarpc.com', symbol: 'ETH' }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedNetworks));
    
    const networks = loadNetworks();
    
    expect(networks).toEqual(storedNetworks);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('evm-wallet-networks');
  });

  it('should handle invalid stored data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    
    const networks = loadNetworks();
    
    expect(networks).toEqual(DEFAULT_NETWORKS);
  });

  it('should save networks to localStorage', () => {
    const networks = [
      { chainId: 1, name: 'Ethereum', rpcUrl: 'https://eth.llamarpc.com', symbol: 'ETH' }
    ];
    
    saveNetworks(networks);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('evm-wallet-networks', JSON.stringify(networks));
  });

  it('should add new network', () => {
    const initialNetworks = DEFAULT_NETWORKS;
    const newNetwork = {
      chainId: 100,
      name: 'Gnosis Chain',
      rpcUrl: 'https://rpc.gnosischain.com',
      symbol: 'XDAI'
    };
    
    const updatedNetworks = addNetwork(initialNetworks, newNetwork);
    
    expect(updatedNetworks).toHaveLength(5);
    expect(updatedNetworks.find(n => n.chainId === 100)).toEqual(newNetwork);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should reject duplicate network', () => {
    const initialNetworks = DEFAULT_NETWORKS;
    const duplicateNetwork = {
      chainId: 1, // Already exists
      name: 'Duplicate Ethereum',
      rpcUrl: 'https://eth.llamarpc.com',
      symbol: 'ETH'
    };
    
    expect(() => addNetwork(initialNetworks, duplicateNetwork)).toThrow('Network with chain ID 1 already exists');
  });

  it('should remove network', () => {
    const initialNetworks = DEFAULT_NETWORKS;
    
    const updatedNetworks = removeNetwork(initialNetworks, 1);
    
    expect(updatedNetworks).toHaveLength(3);
    expect(updatedNetworks.find(n => n.chainId === 1)).toBeUndefined();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should find network by chain ID', () => {
    const networks = DEFAULT_NETWORKS;
    
    const found = findNetwork(networks, 1);
    const notFound = findNetwork(networks, 999);
    
    expect(found).toEqual(networks[0]);
    expect(notFound).toBeUndefined();
  });
});
