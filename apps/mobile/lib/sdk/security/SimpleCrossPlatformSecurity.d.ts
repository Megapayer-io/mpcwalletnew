/**
 * Simplified Cross-Platform Security Manager
 * Works across: Web, Chrome Extension, Mobile App, Desktop App
 * Without external dependencies
 */
export declare enum Platform {
    WEB = "web",
    CHROME_EXTENSION = "chrome_extension",
    MOBILE_ANDROID = "mobile_android",
    MOBILE_IOS = "mobile_ios",
    DESKTOP_WINDOWS = "desktop_windows",
    DESKTOP_MAC = "desktop_mac",
    DESKTOP_LINUX = "desktop_linux"
}
export interface BiometricCapabilities {
    fingerprint: boolean;
    faceId: boolean;
    voice: boolean;
    iris: boolean;
    hardwareKey: boolean;
}
export interface SecurityConfig {
    platform: Platform;
    biometricEnabled: boolean;
    pinEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
}
/**
 * Simplified Cross-Platform Security Manager
 */
export declare class SimpleCrossPlatformSecurity {
    private platform;
    private config;
    private biometricCapabilities;
    constructor();
    /**
     * Detect current platform
     */
    private detectPlatform;
    /**
     * Detect biometric capabilities based on platform
     */
    private detectBiometricCapabilities;
    /**
     * Get platform-specific default configuration
     */
    private getDefaultConfig;
    /**
     * Initialize biometric authentication
     */
    initializeBiometric(): Promise<{
        isSupported: boolean;
        isEnabled: boolean;
        capabilities: BiometricCapabilities;
        platform: Platform;
    }>;
    /**
     * Authenticate using biometric (platform-specific)
     */
    authenticateBiometric(type: 'fingerprint' | 'faceId' | 'hardwareKey'): Promise<boolean>;
    /**
     * Android biometric authentication (placeholder for native implementation)
     */
    private authenticateAndroidBiometric;
    /**
     * iOS biometric authentication (placeholder for native implementation)
     */
    private authenticateIOSBiometric;
    /**
     * Windows biometric authentication (placeholder for native implementation)
     */
    private authenticateWindowsBiometric;
    /**
     * macOS biometric authentication (placeholder for native implementation)
     */
    private authenticateMacBiometric;
    /**
     * Chrome Extension biometric authentication
     */
    private authenticateExtensionBiometric;
    /**
     * Web biometric authentication (WebAuthn)
     */
    private authenticateWebBiometric;
    /**
     * Get platform-specific security recommendations
     */
    getSecurityRecommendations(): string[];
    /**
     * Get platform information
     */
    getPlatformInfo(): {
        platform: Platform;
        capabilities: BiometricCapabilities;
        config: SecurityConfig;
        recommendations: string[];
    };
}
export declare const simpleCrossPlatformSecurity: SimpleCrossPlatformSecurity;
