/**
 * Platform-Specific Security Implementations
 */
export interface SecurityProvider {
    initialize(): Promise<boolean>;
    authenticate(type: string): Promise<boolean>;
    isSupported(): boolean;
    getCapabilities(): string[];
}
/**
 * Mobile Security Provider (React Native / Capacitor)
 */
export declare class MobileSecurityProvider implements SecurityProvider {
    initialize(): Promise<boolean>;
    authenticate(type: string): Promise<boolean>;
    isSupported(): boolean;
    getCapabilities(): string[];
}
/**
 * Desktop Security Provider (Electron / Tauri)
 */
export declare class DesktopSecurityProvider implements SecurityProvider {
    initialize(): Promise<boolean>;
    authenticate(type: string): Promise<boolean>;
    isSupported(): boolean;
    getCapabilities(): string[];
}
/**
 * Chrome Extension Security Provider
 */
export declare class ChromeExtensionSecurityProvider implements SecurityProvider {
    initialize(): Promise<boolean>;
    authenticate(type: string): Promise<boolean>;
    isSupported(): boolean;
    getCapabilities(): string[];
}
/**
 * Web Security Provider (WebAuthn)
 */
export declare class WebSecurityProvider implements SecurityProvider {
    initialize(): Promise<boolean>;
    authenticate(type: string): Promise<boolean>;
    isSupported(): boolean;
    getCapabilities(): string[];
}
/**
 * Security Provider Factory
 */
export declare class SecurityProviderFactory {
    static createProvider(): SecurityProvider;
}
