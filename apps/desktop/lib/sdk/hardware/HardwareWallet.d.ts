/**
 * Hardware Wallet Integration
 * Supports Ledger, Trezor, and other Web3 hardware wallets
 */
export declare enum HardwareWalletType {
    LEDGER = "ledger",
    TREZOR = "trezor",
    KEEPKEY = "keepkey",
    BITBOX = "bitbox"
}
export interface HardwareWalletInfo {
    type: HardwareWalletType;
    name: string;
    connected: boolean;
    address?: string;
    publicKey?: string;
    derivationPath?: string;
}
export interface HardwareWalletAccount {
    address: string;
    publicKey: string;
    derivationPath: string;
    index: number;
}
export interface HardwareWalletTransaction {
    to: string;
    value: string;
    data?: string;
    gasLimit?: string;
    gasPrice?: string;
    nonce?: number;
    chainId: number;
}
/**
 * Hardware Wallet Manager
 */
export declare class HardwareWalletManager {
    private connectedWallets;
    private accounts;
    constructor();
    /**
     * Initialize event listeners for hardware wallet connections
     */
    private initializeEventListeners;
    /**
     * Check if hardware wallet is supported
     */
    isSupported(): boolean;
    /**
     * Get list of supported hardware wallets
     */
    getSupportedWallets(): HardwareWalletType[];
    /**
     * Connect to a hardware wallet
     */
    connectWallet(type: HardwareWalletType): Promise<HardwareWalletInfo>;
    /**
     * Connect to Ledger wallet
     */
    private connectLedger;
    /**
     * Connect to Trezor wallet
     */
    private connectTrezor;
    /**
     * Connect to KeepKey wallet
     */
    private connectKeepKey;
    /**
     * Connect to BitBox wallet
     */
    private connectBitBox;
    /**
     * Get public key for an address
     */
    private getPublicKey;
    /**
     * Get connected wallets
     */
    getConnectedWallets(): HardwareWalletInfo[];
    /**
     * Check if a specific wallet type is connected
     */
    isWalletConnected(type: HardwareWalletType): boolean;
    /**
     * Disconnect a hardware wallet
     */
    disconnectWallet(type: HardwareWalletType): Promise<void>;
    /**
     * Sign a transaction with hardware wallet
     */
    signTransaction(type: HardwareWalletType, transaction: HardwareWalletTransaction): Promise<string>;
    /**
     * Sign a message with hardware wallet
     */
    signMessage(type: HardwareWalletType, message: string): Promise<string>;
    /**
     * Get accounts from hardware wallet
     */
    getAccounts(type: HardwareWalletType, count?: number): Promise<HardwareWalletAccount[]>;
    /**
     * Handle wallet connected event
     */
    private handleWalletConnected;
    /**
     * Handle wallet disconnected event
     */
    private handleWalletDisconnected;
    /**
     * Get wallet info by type
     */
    getWalletInfo(type: HardwareWalletType): HardwareWalletInfo | undefined;
    /**
     * Get all accounts
     */
    getAllAccounts(): HardwareWalletAccount[];
    /**
     * Clear all connected wallets
     */
    clearAllWallets(): void;
}
export declare const hardwareWalletManager: HardwareWalletManager;
