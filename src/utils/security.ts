/**
 * Secure hashing utility using Web Crypto API
 */

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  // We use a fixed salt for deterministic user password checks in offline client
  const salted = `as_praveen_salt_${password}`;
  const data = encoder.encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const calculated = await hashPassword(password);
  return calculated === hash;
}
