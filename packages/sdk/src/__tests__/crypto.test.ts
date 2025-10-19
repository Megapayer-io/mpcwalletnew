import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, generateSecureRandom } from '../crypto.js';

describe('Crypto', () => {
  it('should generate secure random bytes', () => {
    const random1 = generateSecureRandom(32);
    const random2 = generateSecureRandom(32);
    
    expect(random1).toHaveLength(32);
    expect(random2).toHaveLength(32);
    expect(random1).not.toEqual(random2);
  });

  it('should encrypt and decrypt data correctly', async () => {
    const testData = 'test mnemonic phrase';
    const password = 'test-password';
    
    const keystore = await encrypt(testData, password);
    
    expect(keystore.version).toBe('1.0.0');
    expect(keystore.encrypted).toBeDefined();
    expect(keystore.nonce).toBeDefined();
    expect(keystore.salt).toBeDefined();
    expect(keystore.iterations).toBe(16384);
    
    const decrypted = await decrypt(keystore, password);
    expect(decrypted).toBe(testData);
  });

  it('should fail to decrypt with wrong password', async () => {
    const testData = 'test mnemonic phrase';
    const password = 'test-password';
    const wrongPassword = 'wrong-password';
    
    const keystore = await encrypt(testData, password);
    
    await expect(decrypt(keystore, wrongPassword)).rejects.toThrow();
  });

  it('should produce different encrypted data for same input', async () => {
    const testData = 'test mnemonic phrase';
    const password = 'test-password';
    
    const keystore1 = await encrypt(testData, password);
    const keystore2 = await encrypt(testData, password);
    
    expect(keystore1.encrypted).not.toBe(keystore2.encrypted);
    expect(keystore1.nonce).not.toBe(keystore2.nonce);
    expect(keystore1.salt).not.toBe(keystore2.salt);
  });
});
