// Simple client-side encryption utilities
// Note: This is basic obfuscation. For production, consider using Web Crypto API

const ENCRYPTION_KEY = 'autovaluate-secure-2024'; // In production, use env variable

/**
 * Simple XOR-based encryption for client-side data protection
 * This prevents casual inspection but is not cryptographically secure
 */
export function encryptData(data: string): string {
  if (!data) return '';
  
  try {
    const encoded = btoa(
      data.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      ).join('')
    );
    return encoded;
  } catch (error) {
    console.error('Encryption failed:', error);
    return data;
  }
}

/**
 * Decrypt data encrypted with encryptData
 */
export function decryptData(encryptedData: string): string {
  if (!encryptedData) return '';
  
  try {
    const decoded = atob(encryptedData);
    const decrypted = decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join('');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Securely store encrypted data in sessionStorage
 */
export function secureStore(key: string, data: string): void {
  const encrypted = encryptData(data);
  sessionStorage.setItem(key, encrypted);
}

/**
 * Retrieve and decrypt data from sessionStorage
 */
export function secureRetrieve(key: string): string {
  const encrypted = sessionStorage.getItem(key);
  if (!encrypted) return '';
  return decryptData(encrypted);
}

/**
 * Clear all secure data from sessionStorage
 */
export function clearSecureData(): void {
  sessionStorage.clear();
}
