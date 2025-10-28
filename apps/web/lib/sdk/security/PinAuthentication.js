/**
 * PIN-based Authentication System
 * Works across all platforms: Web, Chrome Extension, Mobile, Desktop
 */
export class PinAuthentication {
    config;
    storageKey;
    attemptsKey;
    lockoutKey;
    constructor(config) {
        this.config = {
            minLength: 4,
            maxLength: 8,
            maxAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            allowBiometric: true,
            ...config
        };
        this.storageKey = 'mpc-wallet-pin-hash';
        this.attemptsKey = 'mpc-wallet-pin-attempts';
        this.lockoutKey = 'mpc-wallet-pin-lockout';
    }
    /**
     * Set PIN for the first time
     */
    async setPin(pin) {
        if (!this.validatePin(pin)) {
            return false;
        }
        try {
            const hash = await this.hashPin(pin);
            await this.setSecureStorage(this.storageKey, hash);
            await this.clearAttempts();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Verify PIN
     */
    async verifyPin(pin) {
        // Check if locked out
        const lockoutInfo = await this.getLockoutInfo();
        if (lockoutInfo.isLocked) {
            return {
                success: false,
                attemptsRemaining: 0,
                isLocked: true,
                lockoutTimeRemaining: lockoutInfo.timeRemaining
            };
        }
        try {
            const storedHash = await this.getSecureStorage(this.storageKey);
            if (!storedHash) {
                return {
                    success: false,
                    attemptsRemaining: this.config.maxAttempts,
                    isLocked: false
                };
            }
            const inputHash = await this.hashPin(pin);
            const isValid = inputHash === storedHash;
            if (isValid) {
                await this.clearAttempts();
                return {
                    success: true,
                    attemptsRemaining: this.config.maxAttempts,
                    isLocked: false
                };
            }
            else {
                const attempts = await this.incrementAttempts();
                const isLocked = attempts >= this.config.maxAttempts;
                if (isLocked) {
                    await this.setLockout();
                }
                return {
                    success: false,
                    attemptsRemaining: Math.max(0, this.config.maxAttempts - attempts),
                    isLocked
                };
            }
        }
        catch (error) {
            return {
                success: false,
                attemptsRemaining: 0,
                isLocked: false
            };
        }
    }
    /**
     * Change existing PIN
     */
    async changePin(currentPin, newPin) {
        const verifyResult = await this.verifyPin(currentPin);
        if (!verifyResult.success) {
            return false;
        }
        return await this.setPin(newPin);
    }
    /**
     * Check if PIN is set
     */
    async isPinSet() {
        try {
            const hash = await this.getSecureStorage(this.storageKey);
            return !!hash;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get lockout information
     */
    async getLockoutInfo() {
        try {
            const lockoutData = await this.getSecureStorage(this.lockoutKey);
            if (!lockoutData) {
                return { isLocked: false };
            }
            const { timestamp } = JSON.parse(lockoutData);
            const timeRemaining = this.config.lockoutDuration - (Date.now() - timestamp);
            if (timeRemaining > 0) {
                return {
                    isLocked: true,
                    timeRemaining
                };
            }
            else {
                await this.clearLockout();
                return { isLocked: false };
            }
        }
        catch (error) {
            return { isLocked: false };
        }
    }
    /**
     * Clear PIN (for logout/reset)
     */
    async clearPin() {
        await this.setSecureStorage(this.storageKey, '');
        await this.clearAttempts();
        await this.clearLockout();
    }
    /**
     * Validate PIN format
     */
    validatePin(pin) {
        if (!pin || typeof pin !== 'string') {
            return false;
        }
        if (pin.length < this.config.minLength || pin.length > this.config.maxLength) {
            return false;
        }
        // Only allow digits
        if (!/^\d+$/.test(pin)) {
            return false;
        }
        // Check for common weak PINs
        const weakPins = ['0000', '1111', '1234', '12345', '123456', '12345678'];
        if (weakPins.includes(pin)) {
            return false;
        }
        return true;
    }
    /**
     * Hash PIN using PBKDF2
     */
    async hashPin(pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const salt = encoder.encode('mpc-wallet-pin-salt');
        const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
        const derivedBits = await crypto.subtle.deriveBits({
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        }, key, 256);
        const hashArray = Array.from(new Uint8Array(derivedBits));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    /**
     * Increment failed attempts
     */
    async incrementAttempts() {
        try {
            const attemptsData = await this.getSecureStorage(this.attemptsKey);
            const attempts = attemptsData ? parseInt(attemptsData) + 1 : 1;
            await this.setSecureStorage(this.attemptsKey, attempts.toString());
            return attempts;
        }
        catch (error) {
            return 1;
        }
    }
    /**
     * Clear failed attempts
     */
    async clearAttempts() {
        await this.setSecureStorage(this.attemptsKey, '');
    }
    /**
     * Set lockout
     */
    async setLockout() {
        const lockoutData = {
            timestamp: Date.now()
        };
        await this.setSecureStorage(this.lockoutKey, JSON.stringify(lockoutData));
    }
    /**
     * Clear lockout
     */
    async clearLockout() {
        await this.setSecureStorage(this.lockoutKey, '');
    }
    /**
     * Platform-agnostic secure storage
     */
    async setSecureStorage(key, value) {
        try {
            // Try localStorage first (works in most environments)
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(key, value);
                return;
            }
            // Try sessionStorage
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem(key, value);
                return;
            }
            // Try Chrome extension storage
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({ [key]: value });
                return;
            }
            // Try Electron storage
            if (typeof window !== 'undefined' && window.electronAPI) {
                await window.electronAPI.setSecureStorage(key, value);
                return;
            }
            // Try Tauri storage
            if (typeof window !== 'undefined' && window.__TAURI__) {
                const { invoke } = await import('@tauri-apps/api/tauri');
                await invoke('set_secure_storage', { key, value });
                return;
            }
            // Fallback to memory (not persistent)
            if (typeof window !== 'undefined') {
                window.__mpcWalletSecureStorage = window.__mpcWalletSecureStorage || {};
                window.__mpcWalletSecureStorage[key] = value;
            }
        }
        catch (error) {
            console.error('Failed to set secure storage:', error);
        }
    }
    /**
     * Platform-agnostic secure storage retrieval
     */
    async getSecureStorage(key) {
        try {
            // Try localStorage first
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(key);
            }
            // Try sessionStorage
            if (typeof sessionStorage !== 'undefined') {
                return sessionStorage.getItem(key);
            }
            // Try Chrome extension storage
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get([key]);
                return result[key] || null;
            }
            // Try Electron storage
            if (typeof window !== 'undefined' && window.electronAPI) {
                return await window.electronAPI.getSecureStorage(key);
            }
            // Try Tauri storage
            if (typeof window !== 'undefined' && window.__TAURI__) {
                const { invoke } = await import('@tauri-apps/api/tauri');
                return await invoke('get_secure_storage', { key });
            }
            // Fallback to memory
            if (typeof window !== 'undefined' && window.__mpcWalletSecureStorage) {
                return window.__mpcWalletSecureStorage[key] || null;
            }
            return null;
        }
        catch (error) {
            console.error('Failed to get secure storage:', error);
            return null;
        }
    }
}
// Export singleton instance
export const pinAuthentication = new PinAuthentication();
