/**
 * NETRA Phase 4 — Evidence Integrity Service (SHA-256)
 *
 * Provides content-integrity fingerprinting using the Web Crypto API.
 * A hash does NOT prove authenticity — it only verifies that content has not been modified
 * since the hash was computed.
 *
 * Service boundary: a future backend can perform server-side integrity verification.
 */

/**
 * Computes SHA-256 hash of raw bytes (e.g., a file upload).
 * Use this for file uploads to hash the ORIGINAL bytes before any parsing/normalization.
 */
export async function computeSHA256FromBytes(bytes: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes SHA-256 hash of a text string (encoded as UTF-8).
 * Use this for pasted text — hash the exact pasted text bytes.
 */
export async function computeSHA256FromText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return computeSHA256FromBytes(data.buffer as ArrayBuffer);
}

/**
 * Returns a compact display form of a SHA-256 hash: first 8 + last 8 chars.
 * Example: "7f8c3a1b...e4d29f01"
 */
export function compactHash(hash: string): string {
  if (!hash || hash.length < 16) return hash || '';
  return `${hash.substring(0, 8)}…${hash.substring(hash.length - 8)}`;
}
