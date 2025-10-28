// Security: Never log sensitive data, use secure random generation
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 32; // 256 bits
const PBKDF2_ITERATIONS = 200000; // Increased for better security
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
/**
 * Generate cryptographically secure random bytes
 */
export function generateSecureRandom(length) {
    return crypto.getRandomValues(new Uint8Array(length));
}
/**
 * Derive key from password using PBKDF2
 */
export async function deriveKey(password, salt, iterations = PBKDF2_ITERATIONS) {
    const passwordBuffer = new TextEncoder().encode(password);
    return crypto.subtle.importKey('raw', passwordBuffer, { name: 'PBKDF2' }, false, ['deriveKey']);
}
/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(data, password) {
    const salt = generateSecureRandom(SALT_LENGTH);
    const nonce = generateSecureRandom(IV_LENGTH);
    // Derive key from password
    const keyMaterial = await deriveKey(password, salt);
    const key = await crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt: new Uint8Array(salt).buffer,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
    }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    // Encrypt data
    const encrypted = await crypto.subtle.encrypt({
        name: 'AES-GCM',
        iv: nonce.buffer
    }, key, new TextEncoder().encode(data));
    return {
        version: '1.0.0',
        encrypted: arrayBufferToBase64(encrypted),
        nonce: arrayBufferToBase64(nonce.buffer),
        salt: arrayBufferToBase64(salt.buffer),
        iterations: PBKDF2_ITERATIONS
    };
}
/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(keystore, password) {
    const salt = base64ToArrayBuffer(keystore.salt);
    const nonce = base64ToArrayBuffer(keystore.nonce);
    const encrypted = base64ToArrayBuffer(keystore.encrypted);
    // Derive key from password
    const keyMaterial = await deriveKey(password, new Uint8Array(salt), keystore.iterations);
    const key = await crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt: new Uint8Array(salt).buffer,
        iterations: keystore.iterations,
        hash: 'SHA-256'
    }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    // Decrypt data
    const decrypted = await crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv: nonce
    }, key, encrypted);
    return new TextDecoder().decode(decrypted);
}
/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
/**
 * Security Audit Logger
 */
class SecurityAuditLogger {
    events = [];
    maxEvents = 1000; // Keep last 1000 events
    logEvent(event, severity, details) {
        const securityEvent = {
            timestamp: Date.now(),
            event,
            severity,
            details,
            ip: this.getClientIP(),
            userAgent: navigator.userAgent
        };
        this.events.unshift(securityEvent);
        // Keep only the most recent events
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(0, this.maxEvents);
        }
        // Log critical events to console in development
        if (severity === 'critical' && process.env.NODE_ENV === 'development') {
            console.warn('SECURITY EVENT:', securityEvent);
        }
    }
    getEvents(severity) {
        if (severity) {
            return this.events.filter(event => event.severity === severity);
        }
        return [...this.events];
    }
    getClientIP() {
        // In a real implementation, this would be provided by the server
        return 'unknown';
    }
}
/**
 * Session Manager with automatic timeout
 */
class SessionManager {
    sessionStartTime = 0;
    lastActivityTime = 0;
    isActive = false;
    timeoutId = null;
    startSession() {
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        this.isActive = true;
        this.resetTimeout();
    }
    updateActivity() {
        if (this.isActive) {
            this.lastActivityTime = Date.now();
            this.resetTimeout();
        }
    }
    endSession() {
        this.isActive = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    isSessionValid() {
        if (!this.isActive)
            return false;
        const timeSinceLastActivity = Date.now() - this.lastActivityTime;
        return timeSinceLastActivity < SESSION_TIMEOUT;
    }
    resetTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => {
            this.endSession();
            // Trigger session timeout event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('sessionTimeout'));
            }
        }, SESSION_TIMEOUT);
    }
    getSessionDuration() {
        return Date.now() - this.sessionStartTime;
    }
}
/**
 * Login Attempt Manager
 */
class LoginAttemptManager {
    attempts = 0;
    lockoutUntil = 0;
    recordFailedAttempt() {
        this.attempts++;
        if (this.attempts >= MAX_LOGIN_ATTEMPTS) {
            this.lockoutUntil = Date.now() + LOCKOUT_DURATION;
        }
    }
    recordSuccessfulAttempt() {
        this.attempts = 0;
        this.lockoutUntil = 0;
    }
    isLockedOut() {
        return Date.now() < this.lockoutUntil;
    }
    getRemainingAttempts() {
        return Math.max(0, MAX_LOGIN_ATTEMPTS - this.attempts);
    }
    getLockoutTimeRemaining() {
        return Math.max(0, this.lockoutUntil - Date.now());
    }
}
/**
 * Biometric Authentication Manager
 */
class BiometricManager {
    isSupported = false;
    isEnabled = false;
    type = 'none';
    async initialize() {
        if (typeof window === 'undefined') {
            return { isSupported: false, isEnabled: false, type: 'none' };
        }
        // Check for WebAuthn support
        if (window.PublicKeyCredential) {
            this.isSupported = true;
            this.type = 'fingerprint'; // WebAuthn can support various biometrics
        }
        // Check if biometric is already enrolled
        try {
            const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            this.isEnabled = available;
        }
        catch (error) {
            this.isEnabled = false;
        }
        return {
            isSupported: this.isSupported,
            isEnabled: this.isEnabled,
            type: this.type
        };
    }
    async authenticate() {
        if (!this.isSupported || !this.isEnabled) {
            return false;
        }
        try {
            // Create a simple challenge for authentication
            const challenge = generateSecureRandom(32);
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
                        authenticatorAttachment: 'platform',
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
}
/**
 * Password Strength Validator
 */
export function validatePasswordStrength(password) {
    const feedback = [];
    let score = 0;
    // Length check
    if (password.length < 12) {
        feedback.push('Password must be at least 12 characters long');
    }
    else {
        score += 1;
    }
    // Character variety checks
    if (!/[a-z]/.test(password)) {
        feedback.push('Password must contain lowercase letters');
    }
    else {
        score += 1;
    }
    if (!/[A-Z]/.test(password)) {
        feedback.push('Password must contain uppercase letters');
    }
    else {
        score += 1;
    }
    if (!/[0-9]/.test(password)) {
        feedback.push('Password must contain numbers');
    }
    else {
        score += 1;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
        feedback.push('Password must contain special characters');
    }
    else {
        score += 1;
    }
    // Common password check
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
        feedback.push('Password contains common patterns');
        score -= 1;
    }
    // Entropy check
    const entropy = calculateEntropy(password);
    if (entropy < 50) {
        feedback.push('Password has low entropy (too predictable)');
        score -= 1;
    }
    else {
        score += 1;
    }
    return {
        isValid: score >= 4 && feedback.length === 0,
        score: Math.max(0, score),
        feedback
    };
}
/**
 * Calculate password entropy
 */
function calculateEntropy(password) {
    const charset = new Set(password).size;
    return password.length * Math.log2(charset);
}
/**
 * Secure memory cleanup
 */
export function secureWipe(data) {
    if (typeof data === 'string') {
        // Overwrite string data (limited effectiveness in JS)
        for (let i = 0; i < data.length; i++) {
            data = data.substring(0, i) + '\0' + data.substring(i + 1);
        }
    }
    else if (data instanceof Uint8Array) {
        // Overwrite byte array
        data.fill(0);
    }
}
// Export security managers
export const securityAuditLogger = new SecurityAuditLogger();
export const sessionManager = new SessionManager();
export const loginAttemptManager = new LoginAttemptManager();
export const biometricManager = new BiometricManager();
