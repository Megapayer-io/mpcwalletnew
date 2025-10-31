import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, bsc, polygon } from 'wagmi/chains';

// Default chains configuration
const defaultChains = [mainnet, sepolia, bsc, polygon] as const;

// Create wagmi config
export const config = createConfig({
  chains: defaultChains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
  },
});

// Function to update wagmi config with custom networks
export function updateWagmiConfig(networks: any[]) {
  // This would be used to dynamically add custom networks
  // For now, we'll use the default configuration
  return config;
}
