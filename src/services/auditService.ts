/**
 * NETRA Phase 4 — Demo Audit Trail Service
 *
 * IMPORTANT: This uses localStorage for DEMO purposes only.
 * This is NOT a tamper-resistant or government-grade audit record.
 * The service boundary exists so a backend audit repository can later replace localStorage.
 */

import { AuditEvent, AuditAction, UserRole } from '../types';
import { generateUUID } from './idService';

const AUDIT_STORAGE_KEY = 'netra_demo_audit_log';

/**
 * Records an audit event to the demo local audit store.
 * Generates a unique ID and ISO timestamp at event creation time.
 */
export function recordAuditEvent(
  params: Omit<AuditEvent, 'id' | 'timestamp'>
): AuditEvent {
  const entry: AuditEvent = {
    id: `AUDIT-${generateUUID().replace(/-/g, '').slice(0, 12)}`,
    timestamp: new Date().toISOString(),
    ...params,
  };

  const events = getAuditEvents();
  events.unshift(entry);

  // Cap at 500 entries to prevent localStorage overflow
  const capped = events.slice(0, 500);

  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(capped));
  } catch (e) {
    console.warn('[NETRA Audit] Demo audit storage write failed:', e);
  }

  return entry;
}

/**
 * Retrieves all demo audit events, newest first.
 */
export function getAuditEvents(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clears all demo audit events from local storage.
 */
export function clearDemoAuditEvents(): void {
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  } catch (e) {
    console.warn('[NETRA Audit] Demo audit storage clear failed:', e);
  }
}

/**
 * Human-readable label for audit action types.
 */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  OPENED_ENTITY: 'Opened Entity',
  OPENED_DOCUMENT: 'Opened Document',
  VIEWED_EVIDENCE: 'Viewed Evidence',
  MERGED_ENTITIES: 'Merged Entities',
  KEPT_SEPARATE: 'Kept Separate',
  RAN_XRAY: 'Ran Network X-Ray',
  RAN_EXPLAIN_CONNECTION: 'Ran Explain Connection',
  RAN_COPILOT_QUERY: 'Ran Copilot Query',
  APPLIED_GRAPH_FILTER: 'Applied Graph Filter',
  APPLIED_TIMELINE_FILTER: 'Applied Timeline Filter',
  GENERATED_REPORT: 'Generated Report',
  EXPORTED_REPORT: 'Exported Report',
  LOADED_CASE: 'Loaded Case',
  RESET_CASE: 'Reset Case',
  ROLE_CHANGED: 'Changed Role',
  CASE_LOADED: 'Loaded Case',
  REPORT_GENERATED: 'Generated Report',
};
