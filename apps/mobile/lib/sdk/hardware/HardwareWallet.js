/**
 * Hardware Wallet Integration
 * Supports Ledger, Trezor, and other Web3 hardware wallets
 */
export var HardwareWalletType;
(function (HardwareWalletType) {
    HardwareWalletType["LEDGER"] = "ledger";
    HardwareWalletType["TREZOR"] = "trezor";
    HardwareWalletType["KEEPKEY"] = "keepkey";
    HardwareWalletType["BITBOX"] = "bitbox";
})(HardwareWalletType || (HardwareWalletType = {}));
/**
 * Hardware Wallet Manager
 */
export class HardwareWalletManager {
    connectedWallets = new Map();
    accounts = new Map();
    constructor() {
        this.initializeEventListeners();
    }
    /**
     * Initialize event listeners for hardware wallet connections
     */
    initializeEventListeners() {
        if (typeof window !== 'undefined') {
            // Listen for hardware wallet connection events
            window.addEventListener('hardware-wallet-connected', this.handleWalletConnected.bind(this));
            window.addEventListener('hardware-wallet-disconnected', this.handleWalletDisconnected.bind(this));
        }
    }
    /**
     * Check if hardware wallet is supported
     */
    isSupported() {
        return typeof window !== 'undefined' &&
            window.ethereum !== undefined;
    }
    /**
     * Get list of supported hardware wallets
     */
    getSupportedWallets() {
        return [
            HardwareWalletType.LEDGER,
            HardwareWalletType.TREZOR,
            HardwareWalletType.KEEPKEY,
            HardwareWalletType.BITBOX
        ];
    }
    /**
     * Connect to a hardware wallet
     */
    async connectWallet(type) {
        try {
            let walletInfo;
            switch (type) {
                case HardwareWalletType.LEDGER:
                    walletInfo = await this.connectLedger();
                    break;
                case HardwareWalletType.TREZOR:
                    walletInfo = await this.connectTrezor();
                    break;
                case HardwareWalletType.KEEPKEY:
                    walletInfo = await this.connectKeepKey();
                    break;
                case HardwareWalletType.BITBOX:
                    walletInfo = await this.connectBitBox();
                    break;
                default:
                    throw new Error(`Unsupported hardware wallet type: ${type}`);
            }
            this.connectedWallets.set(type, walletInfo);
            return walletInfo;
        }
        catch (error) {
            throw new Error(`Failed to connect to ${type} wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Connect to Ledger wallet
     */
    async connectLedger() {
        // Check if Ledger is available
        if (!window.ethereum?.isLedger) {
            throw new Error('Ledger wallet not detected. Please connect your Ledger device and unlock it.');
        }
        try {
            // Request connection to Ledger
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
                params: [{ walletType: 'ledger' }]
            });
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found on Ledger device');
            }
            const address = accounts[0];
            const publicKey = await this.getPublicKey(address, 'ledger');
            return {
                type: HardwareWalletType.LEDGER,
                name: 'Ledger Hardware Wallet',
                connected: true,
                address,
                publicKey,
                derivationPath: "m/44'/60'/0'/0/0"
            };
        }
        catch (error) {
            throw new Error(`Ledger connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Connect to Trezor wallet
     */
    async connectTrezor() {
        // Check if Trezor is available
        if (!window.ethereum?.isTrezor) {
            throw new Error('Trezor wallet not detected. Please connect your Trezor device and unlock it.');
        }
        try {
            // Request connection to Trezor
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
                params: [{ walletType: 'trezor' }]
            });
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found on Trezor device');
            }
            const address = accounts[0];
            const publicKey = await this.getPublicKey(address, 'trezor');
            return {
                type: HardwareWalletType.TREZOR,
                name: 'Trezor Hardware Wallet',
                connected: true,
                address,
                publicKey,
                derivationPath: "m/44'/60'/0'/0/0"
            };
        }
        catch (error) {
            throw new Error(`Trezor connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Connect to KeepKey wallet
     */
    async connectKeepKey() {
        // Check if KeepKey is available
        if (!window.ethereum?.isKeepKey) {
            throw new Error('KeepKey wallet not detected. Please connect your KeepKey device and unlock it.');
        }
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
                params: [{ walletType: 'keepkey' }]
            });
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found on KeepKey device');
            }
            const address = accounts[0];
            const publicKey = await this.getPublicKey(address, 'keepkey');
            return {
                type: HardwareWalletType.KEEPKEY,
                name: 'KeepKey Hardware Wallet',
                connected: true,
                address,
                publicKey,
                derivationPath: "m/44'/60'/0'/0/0"
            };
        }
        catch (error) {
            throw new Error(`KeepKey connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Connect to BitBox wallet
     */
    async connectBitBox() {
        // Check if BitBox is available
        if (!window.ethereum?.isBitBox) {
            throw new Error('BitBox wallet not detected. Please connect your BitBox device and unlock it.');
        }
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
                params: [{ walletType: 'bitbox' }]
            });
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found on BitBox device');
            }
            const address = accounts[0];
            const publicKey = await this.getPublicKey(address, 'bitbox');
            return {
                type: HardwareWalletType.BITBOX,
                name: 'BitBox Hardware Wallet',
                connected: true,
                address,
                publicKey,
                derivationPath: "m/44'/60'/0'/0/0"
            };
        }
        catch (error) {
            throw new Error(`BitBox connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get public key for an address
     */
    async getPublicKey(address, walletType) {
        try {
            const publicKey = await window.ethereum.request({
                method: 'eth_getPublicKey',
                params: [address, walletType]
            });
            return publicKey;
        }
        catch (error) {
            console.warn('Could not retrieve public key:', error);
            return '';
        }
    }
    /**
     * Get connected wallets
     */
    getConnectedWallets() {
        return Array.from(this.connectedWallets.values());
    }
    /**
     * Check if a specific wallet type is connected
     */
    isWalletConnected(type) {
        const wallet = this.connectedWallets.get(type);
        return wallet?.connected || false;
    }
    /**
     * Disconnect a hardware wallet
     */
    async disconnectWallet(type) {
        try {
            const wallet = this.connectedWallets.get(type);
            if (wallet) {
                // Remove from connected wallets
                this.connectedWallets.delete(type);
                // Remove associated accounts
                for (const [address, account] of this.accounts.entries()) {
                    if (account.address === wallet.address) {
                        this.accounts.delete(address);
                    }
                }
                // Dispatch disconnect event
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('hardware-wallet-disconnected', {
                        detail: { type, wallet }
                    }));
                }
            }
        }
        catch (error) {
            throw new Error(`Failed to disconnect ${type} wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Sign a transaction with hardware wallet
     */
    async signTransaction(type, transaction) {
        const wallet = this.connectedWallets.get(type);
        if (!wallet || !wallet.connected) {
            throw new Error(`${type} wallet is not connected`);
        }
        try {
            const signedTransaction = await window.ethereum.request({
                method: 'eth_signTransaction',
                params: [transaction, wallet.address]
            });
            return signedTransaction;
        }
        catch (error) {
            throw new Error(`Failed to sign transaction with ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Sign a message with hardware wallet
     */
    async signMessage(type, message) {
        const wallet = this.connectedWallets.get(type);
        if (!wallet || !wallet.connected) {
            throw new Error(`${type} wallet is not connected`);
        }
        try {
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, wallet.address]
            });
            return signature;
        }
        catch (error) {
            throw new Error(`Failed to sign message with ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get accounts from hardware wallet
     */
    async getAccounts(type, count = 5) {
        const wallet = this.connectedWallets.get(type);
        if (!wallet || !wallet.connected) {
            throw new Error(`${type} wallet is not connected`);
        }
        try {
            const accounts = [];
            for (let i = 0; i < count; i++) {
                const derivationPath = `m/44'/60'/0'/0/${i}`;
                // Request account at specific derivation path
                const accountAddress = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                    params: [{
                            walletType: type,
                            derivationPath
                        }]
                });
                if (accountAddress && accountAddress.length > 0) {
                    const publicKey = await this.getPublicKey(accountAddress[0], type);
                    const account = {
                        address: accountAddress[0],
                        publicKey,
                        derivationPath,
                        index: i
                    };
                    accounts.push(account);
                    this.accounts.set(accountAddress[0], account);
                }
            }
            return accounts;
        }
        catch (error) {
            throw new Error(`Failed to get accounts from ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle wallet connected event
     */
    handleWalletConnected(event) {
        const customEvent = event;
        const { type, wallet } = customEvent.detail;
        this.connectedWallets.set(type, wallet);
    }
    /**
     * Handle wallet disconnected event
     */
    handleWalletDisconnected(event) {
        const customEvent = event;
        const { type } = customEvent.detail;
        this.connectedWallets.delete(type);
    }
    /**
     * Get wallet info by type
     */
    getWalletInfo(type) {
        return this.connectedWallets.get(type);
    }
    /**
     * Get all accounts
     */
    getAllAccounts() {
        return Array.from(this.accounts.values());
    }
    /**
     * Clear all connected wallets
     */
    clearAllWallets() {
        this.connectedWallets.clear();
        this.accounts.clear();
    }
}
// Export singleton instance
export const hardwareWalletManager = new HardwareWalletManager();
