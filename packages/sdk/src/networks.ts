import { Network } from './types.js';

// Default networks configuration
export const DEFAULT_NETWORKS: Network[] = [
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    symbol: 'BNB',
    blockExplorer: 'https://bscscan.com'
  },
  {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com'
  },
  {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  }
];

const STORAGE_KEY = 'evm-wallet-networks';

/**
 * Load networks from localStorage
 */
export function loadNetworks(): Network[] {
  if (typeof window === 'undefined') return DEFAULT_NETWORKS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : DEFAULT_NETWORKS;
    }
  } catch (error) {
    console.warn('Failed to load networks from storage:', error);
  }
  
  return DEFAULT_NETWORKS;
}

/**
 * Save networks to localStorage
 */
export function saveNetworks(networks: Network[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(networks));
  } catch (error) {
    console.error('Failed to save networks to storage:', error);
  }
}

/**
 * Add a new network
 */
export function addNetwork(networks: Network[], newNetwork: Network): Network[] {
  // Check if network already exists
  const exists = networks.some(n => n.chainId === newNetwork.chainId);
  if (exists) {
    throw new Error(`Network with chain ID ${newNetwork.chainId} already exists`);
  }
  
  const updated = [...networks, newNetwork];
  saveNetworks(updated);
  return updated;
}

/**
 * Remove a network by chain ID
 */
export function removeNetwork(networks: Network[], chainId: number): Network[] {
  const updated = networks.filter(n => n.chainId !== chainId);
  saveNetworks(updated);
  return updated;
}

/**
 * Find network by chain ID
 */
export function findNetwork(networks: Network[], chainId: number): Network | undefined {
  return networks.find(n => n.chainId === chainId);
}
