/**
 * Cross-Platform Security Manager
 * Works across: Web, Chrome Extension, Mobile App, Desktop App
 */
export var Platform;
(function (Platform) {
    Platform["WEB"] = "web";
    Platform["CHROME_EXTENSION"] = "chrome_extension";
    Platform["MOBILE_ANDROID"] = "mobile_android";
    Platform["MOBILE_IOS"] = "mobile_ios";
    Platform["DESKTOP_WINDOWS"] = "desktop_windows";
    Platform["DESKTOP_MAC"] = "desktop_mac";
    Platform["DESKTOP_LINUX"] = "desktop_linux";
})(Platform || (Platform = {}));
/**
 * Cross-Platform Security Manager
 */
export class CrossPlatformSecurity {
    platform;
    config;
    biometricCapabilities;
    constructor() {
        this.platform = this.detectPlatform();
        this.config = this.getDefaultConfig();
        this.biometricCapabilities = this.detectBiometricCapabilities();
    }
    /**
     * Detect current platform
     */
    detectPlatform() {
        if (typeof window === 'undefined') {
            return Platform.DESKTOP_LINUX; // Server-side
        }
        // Chrome Extension
        if (typeof window !== 'undefined' && window.chrome?.runtime?.id) {
            return Platform.CHROME_EXTENSION;
        }
        // Mobile detection
        const userAgent = navigator.userAgent.toLowerCase();
        if (/android/.test(userAgent)) {
            return Platform.MOBILE_ANDROID;
        }
        if (/iphone|ipad|ipod/.test(userAgent)) {
            return Platform.MOBILE_IOS;
        }
        // Desktop detection
        if (navigator.platform.toLowerCase().includes('win')) {
            return Platform.DESKTOP_WINDOWS;
        }
        if (navigator.platform.toLowerCase().includes('mac')) {
            return Platform.DESKTOP_MAC;
        }
        if (navigator.platform.toLowerCase().includes('linux')) {
            return Platform.DESKTOP_LINUX;
        }
        return Platform.WEB;
    }
    /**
     * Detect biometric capabilities based on platform
     */
    detectBiometricCapabilities() {
        const capabilities = {
            fingerprint: false,
            faceId: false,
            voice: false,
            iris: false,
            hardwareKey: false
        };
        switch (this.platform) {
            case Platform.MOBILE_ANDROID:
                capabilities.fingerprint = true;
                capabilities.faceId = true;
                capabilities.iris = true;
                break;
            case Platform.MOBILE_IOS:
                capabilities.fingerprint = true; // Touch ID
                capabilities.faceId = true; // Face ID
                break;
            case Platform.DESKTOP_WINDOWS:
                capabilities.fingerprint = true; // Windows Hello
                capabilities.faceId = true; // Windows Hello Face
                capabilities.hardwareKey = true; // FIDO2 keys
                break;
            case Platform.DESKTOP_MAC:
                capabilities.fingerprint = true; // Touch ID on MacBooks
                capabilities.faceId = true; // Face ID (future)
                capabilities.hardwareKey = true; // FIDO2 keys
                break;
            case Platform.CHROME_EXTENSION:
                capabilities.hardwareKey = true; // FIDO2 keys
                break;
            case Platform.WEB:
                capabilities.fingerprint = true; // WebAuthn
                capabilities.faceId = true; // WebAuthn
                capabilities.hardwareKey = true; // FIDO2 keys
                break;
            default:
                capabilities.hardwareKey = true; // FIDO2 keys as fallback
        }
        return capabilities;
    }
    /**
     * Get platform-specific default configuration
     */
    getDefaultConfig() {
        const baseConfig = {
            biometricEnabled: false,
            pinEnabled: true,
            sessionTimeout: 15 * 60 * 1000, // 15 minutes
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000 // 15 minutes
        };
        switch (this.platform) {
            case Platform.MOBILE_ANDROID:
            case Platform.MOBILE_IOS:
                return {
                    ...baseConfig,
                    platform: this.platform,
                    sessionTimeout: 5 * 60 * 1000, // 5 minutes for mobile
                    biometricEnabled: true // Enable by default on mobile
                };
            case Platform.CHROME_EXTENSION:
                return {
                    ...baseConfig,
                    platform: this.platform,
                    sessionTimeout: 30 * 60 * 1000, // 30 minutes for extensions
                    biometricEnabled: false // Disabled by default for extensions
                };
            case Platform.DESKTOP_WINDOWS:
            case Platform.DESKTOP_MAC:
            case Platform.DESKTOP_LINUX:
                return {
                    ...baseConfig,
                    platform: this.platform,
                    sessionTimeout: 60 * 60 * 1000, // 1 hour for desktop
                    biometricEnabled: true // Enable by default on desktop
                };
            default:
                return {
                    ...baseConfig,
                    platform: this.platform
                };
        }
    }
    /**
     * Initialize biometric authentication
     */
    async initializeBiometric() {
        const isSupported = Object.values(this.biometricCapabilities).some(cap => cap);
        return {
            isSupported,
            isEnabled: this.config.biometricEnabled,
            capabilities: this.biometricCapabilities,
            platform: this.platform
        };
    }
    /**
     * Authenticate using biometric (platform-specific)
     */
    async authenticateBiometric(type) {
        if (!this.biometricCapabilities[type]) {
            throw new Error(`Biometric type ${type} not supported on ${this.platform}`);
        }
        switch (this.platform) {
            case Platform.MOBILE_ANDROID:
                return this.authenticateAndroidBiometric(type);
            case Platform.MOBILE_IOS:
                return this.authenticateIOSBiometric(type);
            case Platform.DESKTOP_WINDOWS:
                return this.authenticateWindowsBiometric(type);
            case Platform.DESKTOP_MAC:
                return this.authenticateMacBiometric(type);
            case Platform.CHROME_EXTENSION:
                return this.authenticateExtensionBiometric(type);
            case Platform.WEB:
                return this.authenticateWebBiometric(type);
            default:
                return false;
        }
    }
    /**
     * Android biometric authentication
     */
    async authenticateAndroidBiometric(type) {
        // For React Native or Capacitor
        if (typeof window !== 'undefined' && window.Capacitor) {
            const { BiometricAuth } = await import('@capacitor-community/biometric-auth');
            const result = await BiometricAuth.authenticate({
                reason: 'Authenticate to access your wallet',
                fallbackTitle: 'Use PIN',
                allowDeviceCredential: true
            });
            return result.authenticated;
        }
        // For native Android (if using React Native)
        if (typeof window !== 'undefined' && window.ReactNativeWebView) {
            return new Promise((resolve) => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'BIOMETRIC_AUTH',
                    biometricType: type
                }));
                const handleMessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'BIOMETRIC_AUTH_RESULT') {
                        window.removeEventListener('message', handleMessage);
                        resolve(data.success);
                    }
                };
                window.addEventListener('message', handleMessage);
            });
        }
        return false;
    }
    /**
     * iOS biometric authentication
     */
    async authenticateIOSBiometric(type) {
        // For React Native or Capacitor
        if (typeof window !== 'undefined' && window.Capacitor) {
            const { BiometricAuth } = await import('@capacitor-community/biometric-auth');
            const result = await BiometricAuth.authenticate({
                reason: 'Authenticate to access your wallet',
                fallbackTitle: 'Use Passcode',
                allowDeviceCredential: true
            });
            return result.authenticated;
        }
        // For native iOS (if using React Native)
        if (typeof window !== 'undefined' && window.ReactNativeWebView) {
            return new Promise((resolve) => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'BIOMETRIC_AUTH',
                    biometricType: type
                }));
                const handleMessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'BIOMETRIC_AUTH_RESULT') {
                        window.removeEventListener('message', handleMessage);
                        resolve(data.success);
                    }
                };
                window.addEventListener('message', handleMessage);
            });
        }
        return false;
    }
    /**
     * Windows biometric authentication
     */
    async authenticateWindowsBiometric(type) {
        // For Electron
        if (typeof window !== 'undefined' && window.electronAPI) {
            return window.electronAPI.authenticateBiometric(type);
        }
        // For Tauri
        if (typeof window !== 'undefined' && window.__TAURI__) {
            const { invoke } = await import('@tauri-apps/api/tauri');
            return await invoke('authenticate_biometric', { type });
        }
        // For WebAuthn (fallback)
        return this.authenticateWebBiometric(type);
    }
    /**
     * macOS biometric authentication
     */
    async authenticateMacBiometric(type) {
        // For Electron
        if (typeof window !== 'undefined' && window.electronAPI) {
            return window.electronAPI.authenticateBiometric(type);
        }
        // For Tauri
        if (typeof window !== 'undefined' && window.__TAURI__) {
            const { invoke } = await import('@tauri-apps/api/tauri');
            return await invoke('authenticate_biometric', { type });
        }
        // For WebAuthn (fallback)
        return this.authenticateWebBiometric(type);
    }
    /**
     * Chrome Extension biometric authentication
     */
    async authenticateExtensionBiometric(type) {
        if (type === 'hardwareKey') {
            // Use WebAuthn for hardware keys in extensions
            return this.authenticateWebBiometric(type);
        }
        return false;
    }
    /**
     * Web biometric authentication (WebAuthn)
     */
    async authenticateWebBiometric(type) {
        if (!window.PublicKeyCredential) {
            return false;
        }
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge.buffer,
                    rp: { name: 'MPC Wallet' },
                    user: {
                        id: new TextEncoder().encode('user'),
                        name: 'user',
                        displayName: 'User'
                    },
                    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                    authenticatorSelection: {
                        authenticatorAttachment: type === 'hardwareKey' ? 'cross-platform' : 'platform',
                        userVerification: 'required'
                    },
                    timeout: 60000,
                    attestation: 'none'
                }
            });
            return !!credential;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get platform-specific security recommendations
     */
    getSecurityRecommendations() {
        const recommendations = [];
        switch (this.platform) {
            case Platform.MOBILE_ANDROID:
            case Platform.MOBILE_IOS:
                recommendations.push('Enable device lock screen');
                recommendations.push('Use biometric authentication');
                recommendations.push('Keep app updated');
                recommendations.push('Enable app lock timeout');
                break;
            case Platform.CHROME_EXTENSION:
                recommendations.push('Use hardware security keys');
                recommendations.push('Enable extension auto-lock');
                recommendations.push('Use strong master password');
                recommendations.push('Regularly clear browser data');
                break;
            case Platform.DESKTOP_WINDOWS:
            case Platform.DESKTOP_MAC:
            case Platform.DESKTOP_LINUX:
                recommendations.push('Enable Windows Hello / Touch ID');
                recommendations.push('Use hardware security keys');
                recommendations.push('Keep OS updated');
                recommendations.push('Use full disk encryption');
                break;
            case Platform.WEB:
                recommendations.push('Use hardware security keys');
                recommendations.push('Enable browser security features');
                recommendations.push('Use incognito mode for sensitive operations');
                recommendations.push('Clear browser data regularly');
                break;
        }
        return recommendations;
    }
    /**
     * Get platform information
     */
    getPlatformInfo() {
        return {
            platform: this.platform,
            capabilities: this.biometricCapabilities,
            config: this.config,
            recommendations: this.getSecurityRecommendations()
        };
    }
}
// Export singleton instance
export const crossPlatformSecurity = new CrossPlatformSecurity();
