export interface Network {
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  blockExplorer?: string;
}

export interface Keystore {
  version: string;
  encrypted: string;
  nonce: string;
  salt: string;
  iterations: number;
}

export interface WalletState {
  isUnlocked: boolean;
  address?: string;
  currentNetwork?: Network;
  networks: Network[];
}

export interface SendEthParams {
  to: string;
  valueEth: string;
}

export interface SendErc20Params {
  tokenAddress: string;
  to: string;
  amount: string;
  decimals: number;
}

export interface TokenBalanceParams {
  tokenAddress: string;
  address?: string;
  decimals: number;
}

export interface AddNetworkParams {
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  blockExplorer?: string;
}
