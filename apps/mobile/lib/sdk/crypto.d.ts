import { Keystore } from './types.js';
interface SecurityEvent {
    timestamp: number;
    event: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: string;
    ip?: string;
    userAgent?: string;
}
interface BiometricAuth {
    isSupported: boolean;
    isEnabled: boolean;
    type: 'fingerprint' | 'face' | 'voice' | 'none';
}
/**
 * Generate cryptographically secure random bytes
 */
export declare function generateSecureRandom(length: number): Uint8Array;
/**
 * Derive key from password using PBKDF2
 */
export declare function deriveKey(password: string, salt: Uint8Array, iterations?: number): Promise<CryptoKey>;
/**
 * Encrypt data using AES-GCM
 */
export declare function encrypt(data: string, password: string): Promise<Keystore>;
/**
 * Decrypt data using AES-GCM
 */
export declare function decrypt(keystore: Keystore, password: string): Promise<string>;
/**
 * Security Audit Logger
 */
declare class SecurityAuditLogger {
    private events;
    private maxEvents;
    logEvent(event: string, severity: SecurityEvent['severity'], details: string): void;
    getEvents(severity?: SecurityEvent['severity']): SecurityEvent[];
    private getClientIP;
}
/**
 * Session Manager with automatic timeout
 */
declare class SessionManager {
    private sessionStartTime;
    private lastActivityTime;
    private isActive;
    private timeoutId;
    startSession(): void;
    updateActivity(): void;
    endSession(): void;
    isSessionValid(): boolean;
    private resetTimeout;
    getSessionDuration(): number;
}
/**
 * Login Attempt Manager
 */
declare class LoginAttemptManager {
    private attempts;
    private lockoutUntil;
    recordFailedAttempt(): void;
    recordSuccessfulAttempt(): void;
    isLockedOut(): boolean;
    getRemainingAttempts(): number;
    getLockoutTimeRemaining(): number;
}
/**
 * Biometric Authentication Manager
 */
declare class BiometricManager {
    private isSupported;
    private isEnabled;
    private type;
    initialize(): Promise<BiometricAuth>;
    authenticate(): Promise<boolean>;
}
/**
 * Password Strength Validator
 */
export declare function validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
};
/**
 * Secure memory cleanup
 */
export declare function secureWipe(data: string | Uint8Array): void;
export declare const securityAuditLogger: SecurityAuditLogger;
export declare const sessionManager: SessionManager;
export declare const loginAttemptManager: LoginAttemptManager;
export declare const biometricManager: BiometricManager;
export {};
