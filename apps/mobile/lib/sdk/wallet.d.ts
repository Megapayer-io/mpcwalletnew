import { Network, SendEthParams, SendErc20Params, TokenBalanceParams, AddNetworkParams, Account, ImportAccountParams, CreateAccountParams, TransferNftParams } from './types.js';
export declare class EvmWallet {
    private state;
    private privateKey?;
    private account?;
    private accounts;
    private mnemonic?;
    constructor();
    /**
     * Create a new wallet with random mnemonic
     */
    createWallet(): Promise<{
        mnemonic: string;
        address: string;
    }>;
    /**
     * Import wallet from mnemonic
     */
    importFromMnemonic(mnemonic: string): Promise<{
        mnemonic: string;
        address: string;
    }>;
    /**
     * Lock the wallet (clear sensitive data from memory)
     */
    lock(): void;
    /**
     * Unlock wallet with password
     */
    unlock(password: string): Promise<void>;
    /**
     * Check if wallet is unlocked
     */
    isUnlocked(): boolean;
    /**
     * Check if a keystore exists (wallet has been created/imported)
     */
    hasKeystore(): boolean;
    /**
     * Get current wallet address
     */
    getAddress(): string | undefined;
    /**
     * Get all accounts
     */
    getAccounts(): Account[];
    /**
     * Get current account
     */
    getCurrentAccount(): Account | undefined;
    /**
     * Switch to a different account
     */
    switchAccount(address: string): void;
    /**
     * Create a new account from the current mnemonic
     */
    createAccount(params: CreateAccountParams): Account;
    /**
     * Import an account from private key
     */
    importAccount(params: ImportAccountParams): Account;
    /**
     * Remove an account
     */
    removeAccount(address: string): void;
    /**
     * Export private key for an account
     */
    exportPrivateKey(address: string): string;
    /**
     * Get mnemonic (only for main account)
     */
    private getMnemonic;
    /**
     * Get private key for current account
     */
    getPrivateKey(): string;
    /**
     * Get mnemonic phrase (public method)
     */
    getMnemonicPhrase(): string;
    /**
     * Add a new network
     */
    addNetwork(params: AddNetworkParams): void;
    /**
     * Select a network by chain ID
     */
    selectNetwork(chainId: number): void;
    /**
     * Get current network
     */
    getCurrentNetwork(): Network | undefined;
    /**
     * List all networks
     */
    listNetworks(): Network[];
    /**
     * Get native balance
     */
    getBalance(address?: string): Promise<string>;
    /**
     * Send ETH
     */
    sendEth(params: SendEthParams): Promise<`0x${string}`>;
    /**
     * Send ERC-20 token
     */
    sendErc20(params: SendErc20Params): Promise<`0x${string}`>;
    /**
     * Get ERC-20 token metadata (name, symbol, decimals)
     */
    getTokenMetadata(tokenAddress: string): Promise<{
        name: string;
        symbol: string;
        decimals: number;
    }>;
    /**
     * Get ERC-20 token balance
     */
    getTokenBalance(params: TokenBalanceParams): Promise<string>;
    /**
     * Save encrypted keystore
     */
    saveKeystore(mnemonic: string, password: string): Promise<void>;
    /**
     * Load keystore from storage
     */
    private loadKeystore;
    /**
     * Save wallet state
     */
    private saveState;
    /**
     * Save accounts data (encrypted)
     */
    private saveAccounts;
    /**
     * Load accounts data (encrypted)
     */
    private loadAccounts;
    /**
     * Load wallet state
     */
    loadState(): void;
    /**
     * Clear all stored data (for logout)
     */
    clearStorage(): void;
    /**
     * Clear corrupted account data (for debugging)
     */
    clearCorruptedAccounts(): void;
    /**
     * Transfer NFT (ERC721 or ERC1155)
     */
    transferNft(params: TransferNftParams): Promise<string>;
}
