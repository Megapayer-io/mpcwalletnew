import { Keystore } from './types.js';

// Security: Never log sensitive data, use secure random generation
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 32; // 256 bits
const PBKDF2_ITERATIONS = 100000; // OWASP recommended minimum

/**
 * Generate cryptographically secure random bytes
 */
export function generateSecureRandom(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Derive key from password using PBKDF2
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);
  
  return crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(
  data: string,
  password: string
): Promise<Keystore> {
  const salt = generateSecureRandom(SALT_LENGTH);
  const nonce = generateSecureRandom(IV_LENGTH);
  
  // Derive key from password
  const keyMaterial = await deriveKey(password, salt);
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt).buffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // Encrypt data
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce.buffer as ArrayBuffer
    },
    key,
    new TextEncoder().encode(data)
  );

  return {
    version: '1.0.0',
    encrypted: arrayBufferToBase64(encrypted),
    nonce: arrayBufferToBase64(nonce.buffer as ArrayBuffer),
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    iterations: PBKDF2_ITERATIONS
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(keystore: Keystore, password: string): Promise<string> {
  const salt = base64ToArrayBuffer(keystore.salt);
  const nonce = base64ToArrayBuffer(keystore.nonce);
  const encrypted = base64ToArrayBuffer(keystore.encrypted);

  // Derive key from password
  const keyMaterial = await deriveKey(password, new Uint8Array(salt), keystore.iterations);
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt).buffer,
      iterations: keystore.iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // Decrypt data
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce
    },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
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
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
