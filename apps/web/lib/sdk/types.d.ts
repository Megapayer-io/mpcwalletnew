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
export interface Account {
    address: string;
    name: string;
    isImported: boolean;
    index?: number;
}
export interface WalletState {
    isUnlocked: boolean;
    currentAccount?: Account;
    accounts: Account[];
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
export interface ImportAccountParams {
    privateKey: string;
    name: string;
}
export interface CreateAccountParams {
    name: string;
}
export interface TransferNftParams {
    contractAddress: string;
    tokenId: string;
    to: string;
    amount?: string;
}
