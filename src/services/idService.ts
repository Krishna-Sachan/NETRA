/**
 * Collision-resistant ID generation service for NETRA investigation platform.
 * 
 * LAW-ENFORCEMENT INTEGRITY RULE:
 * Math.random() is strictly prohibited for persistent entity, relationship, or document identifiers.
 * This service provides a centralized abstraction for deterministic or cryptographically secure IDs,
 * anticipating future backend/database integration.
 */

import { EntityType } from '../types';

/**
 * Generates a collision-resistant UUID v4.
 * 1. Uses crypto.randomUUID() when available (standard in modern Node.js and modern browsers).
 * 2. Otherwise uses crypto.getRandomValues to construct a RFC4122 compliant UUID v4.
 * 3. Throws a clear error if neither secure Web Crypto mechanism is available.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set UUID version to 4 (0100)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set UUID variant to 10xxxxxx
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  throw new Error('Secure Web Crypto API is not available to generate collision-safe IDs.');
}

/**
 * Generates an Entity Identifier with type prefix and collision-resistant suffix.
 * e.g. "ENT-PERSON-a1b2c3d4e5f6" or "ENT-a1b2c3d4e5f6"
 */
export function generateEntityId(type?: EntityType | string): string {
  const typePart = type ? `${type.toUpperCase()}-` : '';
  const uuid = generateUUID().replace(/-/g, '').slice(0, 12);
  return `ENT-${typePart}${uuid}`;
}

/**
 * Generates a Relationship Identifier.
 * e.g. "REL-COMMUNICATES_WITH-a1b2c3d4e5f6" or "REL-a1b2c3d4e5f6"
 */
export function generateRelationshipId(type?: string): string {
  const typePart = type ? `${type.toUpperCase()}-` : '';
  const uuid = generateUUID().replace(/-/g, '').slice(0, 12);
  return `REL-${typePart}${uuid}`;
}

/**
 * Generates a Document Identifier.
 * e.g. "DOC-FIR-a1b2c3d4e5f6"
 */
export function generateDocumentId(prefix: string = 'DOC'): string {
  const cleanPrefix = prefix ? prefix.toUpperCase() : 'DOC';
  const prefixPart = cleanPrefix.startsWith('DOC') ? cleanPrefix : `DOC-${cleanPrefix}`;
  const uuid = generateUUID().replace(/-/g, '').slice(0, 12);
  return `${prefixPart}-${uuid}`;
}

/**
 * Generates a Timeline Milestone Identifier.
 * e.g. "TL-2024-10-14-a1b2c3d4e5f6"
 */
export function generateMilestoneId(dateStr?: string): string {
  const uuid = generateUUID().replace(/-/g, '').slice(0, 12);
  const datePart = dateStr ? `${dateStr}-` : '';
  return `TL-${datePart}${uuid}`;
}

/**
 * Generates an Anomaly Finding Identifier.
 * e.g. "ANOM-SPIKE-a1b2c3d4e5f6"
 */
export function generateAnomalyId(detectorType: string, suffix?: string): string {
  const uuid = generateUUID().replace(/-/g, '').slice(0, 12);
  const cleanSuffix = suffix ? `-${suffix}` : '';
  return `ANOM-${detectorType.toUpperCase()}${cleanSuffix}-${uuid}`;
}

/**
 * Generates a deterministic ID from input strings without using Math.random()
 */
export function generateDeterministicId(prefix: string, ...inputs: string[]): string {
  const combined = inputs.join('|');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${prefix}-${hex}`;
}
