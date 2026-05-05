import { Network } from './types.js';

// Default networks configuration
export const DEFAULT_NETWORKS: Network[] = [
  {
    chainId: 2237,
    name: 'Ettios Mainnet',
    rpcUrl: 'https://rpc.ettiosblockchain.io',
    symbol: 'ETTIA',
    blockExplorer: 'https://scan.ettiosblockchain.io'
  },
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-rpc.publicnode.com',
    symbol: 'BNB',
    blockExplorer: 'https://bscscan.com'
  },
  {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
    symbol: 'MATIC',
    blockExplorer: 'https://polygonscan.com'
  }
];

const STORAGE_KEY = 'evm-wallet-networks';

/**
 * Load networks from localStorage, merging defaults so newly-added defaults
 * (e.g. Ettios) always appear even for users who already have a stored list.
 */
export function loadNetworks(): Network[] {
  if (typeof window === 'undefined') return DEFAULT_NETWORKS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const byChainId = new Map<number, Network>();
        for (const n of parsed as Network[]) byChainId.set(n.chainId, n);
        // Ensure every default network is present (and update its RPC if stale)
        for (const def of DEFAULT_NETWORKS) {
          if (!byChainId.has(def.chainId)) byChainId.set(def.chainId, def);
        }
        return Array.from(byChainId.values());
      }
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
