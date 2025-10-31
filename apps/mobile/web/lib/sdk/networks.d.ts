import { Network } from './types.js';
export declare const DEFAULT_NETWORKS: Network[];
/**
 * Load networks from localStorage
 */
export declare function loadNetworks(): Network[];
/**
 * Save networks to localStorage
 */
export declare function saveNetworks(networks: Network[]): void;
/**
 * Add a new network
 */
export declare function addNetwork(networks: Network[], newNetwork: Network): Network[];
/**
 * Remove a network by chain ID
 */
export declare function removeNetwork(networks: Network[], chainId: number): Network[];
/**
 * Find network by chain ID
 */
export declare function findNetwork(networks: Network[], chainId: number): Network | undefined;
