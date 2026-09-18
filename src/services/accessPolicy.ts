/**
 * NETRA Phase 4 — Demo Role-Based Access Policy
 *
 * IMPORTANT: This is a LOCAL DEMO simulation of future RBAC.
 * It is NOT real authentication or security infrastructure.
 * The service boundary exists so a real RBAC backend can later replace this module.
 */

import { UserRole, Entity, EntityType } from '../types';

// ===== Permission Functions =====

export function canMerge(role: UserRole): boolean {
  return role !== 'ANALYST';
}

export function canExport(role: UserRole): boolean {
  return role !== 'ANALYST';
}

export function canGenerateReport(role: UserRole): boolean {
  return role !== 'ANALYST';
}

export function canViewSensitiveFields(role: UserRole): boolean {
  return role !== 'ANALYST';
}

export function canRunCopilot(role: UserRole): boolean {
  return true; // All roles can query the Copilot
}

export function canResetCase(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'SENIOR_INVESTIGATOR';
}

// ===== Sensitive Field Detection =====

/** Entity types whose labels contain sensitive PII */
const SENSITIVE_ENTITY_TYPES: ReadonlySet<EntityType> = new Set(['PHONE']);

/** Returns true if a value looks like a phone number */
function looksLikePhone(value: string): boolean {
  const digits = value.replace(/[\s\-().+]/g, '');
  return /^\d{7,15}$/.test(digits);
}

export function isSensitiveEntityType(type: EntityType): boolean {
  return SENSITIVE_ENTITY_TYPES.has(type);
}

// ===== Masking Utilities =====

/**
 * Masks a phone number: shows first 2 and last 2 digits, rest as X.
 * Example: 9876543221 → 98XXXXXX21
 */
export function maskPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return 'XXXX';
  const first2 = digits.substring(0, 2);
  const last2 = digits.substring(digits.length - 2);
  const middle = 'X'.repeat(Math.max(digits.length - 4, 2));
  // Preserve leading + if present
  const prefix = value.startsWith('+') ? '+' : '';
  return `${prefix}${first2}${middle}${last2}`;
}

/**
 * Generic masking for non-phone sensitive fields.
 */
function maskGeneric(value: string): string {
  if (value.length <= 4) return '****';
  return value.substring(0, 2) + '*'.repeat(Math.max(value.length - 4, 2)) + value.substring(value.length - 2);
}

/**
 * Masks a sensitive field value based on the current role.
 * Returns the original value if the role has permission.
 */
export function maskSensitiveField(role: UserRole, value: string, fieldType?: EntityType): string {
  if (canViewSensitiveFields(role)) return value;
  if (!value) return value;

  if (fieldType === 'PHONE' || looksLikePhone(value)) {
    return maskPhoneNumber(value);
  }
  return maskGeneric(value);
}

/**
 * Returns a display-safe entity label respecting the current role policy.
 */
export function getDisplayLabel(role: UserRole, entity: Entity): string {
  if (canViewSensitiveFields(role)) return entity.label;
  if (isSensitiveEntityType(entity.type)) {
    return maskSensitiveField(role, entity.label, entity.type);
  }
  return entity.label;
}

/**
 * Masks sensitive values in a text snippet.
 * Scans for phone-number patterns and replaces them.
 */
export function maskSnippetSensitiveValues(role: UserRole, snippet: string): string {
  if (canViewSensitiveFields(role)) return snippet;
  if (!snippet) return snippet;
  // Replace phone-like patterns in text (sequences of 7+ digits with optional separators)
  return snippet.replace(/(\+?\d[\d\s\-]{6,}\d)/g, (match) => {
    return maskPhoneNumber(match);
  });
}

// ===== Role Display Labels =====

export const ROLE_DISPLAY_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  SENIOR_INVESTIGATOR: 'Senior Investigator',
  INVESTIGATOR: 'Investigator',
  ANALYST: 'Analyst',
};

export const ALL_ROLES: readonly UserRole[] = ['ADMIN', 'SENIOR_INVESTIGATOR', 'INVESTIGATOR', 'ANALYST'] as const;
