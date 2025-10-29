/**
 * Platform-Specific Security Implementations
 */
/**
 * Mobile Security Provider (React Native / Capacitor)
 */
export class MobileSecurityProvider {
    async initialize() {
        try {
            // Check if running in React Native
            if (typeof window !== 'undefined' && window.ReactNativeWebView) {
                return true;
            }
            // Check if running in Capacitor
            if (typeof window !== 'undefined' && window.Capacitor) {
                const { BiometricAuth } = await import('@capacitor-community/biometric-auth');
                const result = await BiometricAuth.checkBiometry();
                return result.isAvailable;
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    async authenticate(type) {
        try {
            // React Native implementation
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
            // Capacitor implementation
            if (typeof window !== 'undefined' && window.Capacitor) {
                const { BiometricAuth } = await import('@capacitor-community/biometric-auth');
                const result = await BiometricAuth.authenticate({
                    reason: 'Authenticate to access your wallet',
                    fallbackTitle: 'Use PIN',
                    allowDeviceCredential: true
                });
                return result.authenticated;
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    isSupported() {
        return typeof window !== 'undefined' &&
            (window.ReactNativeWebView || window.Capacitor);
    }
    getCapabilities() {
        return ['fingerprint', 'faceId', 'iris', 'voice'];
    }
}
/**
 * Desktop Security Provider (Electron / Tauri)
 */
export class DesktopSecurityProvider {
    async initialize() {
        try {
            // Electron
            if (typeof window !== 'undefined' && window.electronAPI) {
                return await window.electronAPI.isBiometricSupported();
            }
            // Tauri
            if (typeof window !== 'undefined' && window.__TAURI__) {
                const { invoke } = await import('@tauri-apps/api/tauri');
                return await invoke('is_biometric_supported');
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    async authenticate(type) {
        try {
            // Electron
            if (typeof window !== 'undefined' && window.electronAPI) {
                return await window.electronAPI.authenticateBiometric(type);
            }
            // Tauri
            if (typeof window !== 'undefined' && window.__TAURI__) {
                const { invoke } = await import('@tauri-apps/api/tauri');
                return await invoke('authenticate_biometric', { type });
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    isSupported() {
        return typeof window !== 'undefined' &&
            (window.electronAPI || window.__TAURI__);
    }
    getCapabilities() {
        return ['fingerprint', 'faceId', 'hardwareKey'];
    }
}
/**
 * Chrome Extension Security Provider
 */
export class ChromeExtensionSecurityProvider {
    async initialize() {
        try {
            return typeof chrome !== 'undefined' &&
                chrome.runtime &&
                chrome.runtime.id &&
                window.PublicKeyCredential !== undefined;
        }
        catch (error) {
            return false;
        }
    }
    async authenticate(type) {
        if (type !== 'hardwareKey') {
            return false;
        }
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge.buffer,
                    rp: { name: 'MPC Wallet Extension' },
                    user: {
                        id: new TextEncoder().encode('user'),
                        name: 'user',
                        displayName: 'User'
                    },
                    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                    authenticatorSelection: {
                        authenticatorAttachment: 'cross-platform',
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
    isSupported() {
        return typeof chrome !== 'undefined' &&
            chrome.runtime &&
            chrome.runtime.id &&
            window.PublicKeyCredential !== undefined;
    }
    getCapabilities() {
        return ['hardwareKey'];
    }
}
/**
 * Web Security Provider (WebAuthn)
 */
export class WebSecurityProvider {
    async initialize() {
        try {
            return window.PublicKeyCredential !== undefined;
        }
        catch (error) {
            return false;
        }
    }
    async authenticate(type) {
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
    isSupported() {
        return window.PublicKeyCredential !== undefined;
    }
    getCapabilities() {
        return ['fingerprint', 'faceId', 'hardwareKey'];
    }
}
/**
 * Security Provider Factory
 */
export class SecurityProviderFactory {
    static createProvider() {
        // Check for mobile platforms first
        if (typeof window !== 'undefined' &&
            (window.ReactNativeWebView || window.Capacitor)) {
            return new MobileSecurityProvider();
        }
        // Check for desktop platforms
        if (typeof window !== 'undefined' &&
            (window.electronAPI || window.__TAURI__)) {
            return new DesktopSecurityProvider();
        }
        // Check for Chrome extension
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
            return new ChromeExtensionSecurityProvider();
        }
        // Default to web
        return new WebSecurityProvider();
    }
}
