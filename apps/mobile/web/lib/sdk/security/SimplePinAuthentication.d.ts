/**
 * Simplified PIN-based Authentication System
 * Works across all platforms: Web, Chrome Extension, Mobile, Desktop
 * Without external dependencies
 */
export interface PinConfig {
    minLength: number;
    maxLength: number;
    maxAttempts: number;
    lockoutDuration: number;
    allowBiometric: boolean;
}
export interface PinAuthResult {
    success: boolean;
    attemptsRemaining: number;
    isLocked: boolean;
    lockoutTimeRemaining?: number;
}
export declare class SimplePinAuthentication {
    private config;
    private storageKey;
    private attemptsKey;
    private lockoutKey;
    constructor(config?: Partial<PinConfig>);
    /**
     * Set PIN for the first time
     */
    setPin(pin: string): Promise<boolean>;
    /**
     * Verify PIN
     */
    verifyPin(pin: string): Promise<PinAuthResult>;
    /**
     * Change existing PIN
     */
    changePin(currentPin: string, newPin: string): Promise<boolean>;
    /**
     * Check if PIN is set
     */
    isPinSet(): Promise<boolean>;
    /**
     * Get lockout information
     */
    getLockoutInfo(): Promise<{
        isLocked: boolean;
        timeRemaining?: number;
    }>;
    /**
     * Clear PIN (for logout/reset)
     */
    clearPin(): Promise<void>;
    /**
     * Validate PIN format
     */
    private validatePin;
    /**
     * Hash PIN using PBKDF2
     */
    private hashPin;
    /**
     * Increment failed attempts
     */
    private incrementAttempts;
    /**
     * Clear failed attempts
     */
    private clearAttempts;
    /**
     * Set lockout
     */
    private setLockout;
    /**
     * Clear lockout
     */
    private clearLockout;
    /**
     * Platform-agnostic secure storage
     */
    private setSecureStorage;
    /**
     * Platform-agnostic secure storage retrieval
     */
    private getSecureStorage;
}
export declare const simplePinAuthentication: SimplePinAuthentication;
