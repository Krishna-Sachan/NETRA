/**
 * NETRA Phase 4 — Case Intelligence Report Service
 *
 * Generates structured reports from the application's CURRENT VERIFIED CASE DATA.
 * Does NOT use Gemini to invent report content.
 * Every statistic and reference derives from current application state.
 *
 * Service boundary: a future backend can generate server-side PDF/HTML reports.
 */

import {
  Entity,
  Relationship,
  CaseDocument,
  AIInsight,
  AnomalyFinding,
  NetworkXRayReport,
  UserRole,
} from '../types';
import { maskSensitiveField, isSensitiveEntityType, canViewSensitiveFields, maskSnippetSensitiveValues } from './accessPolicy';
import { compactHash } from './integrityService';

export interface ReportSection {
  id: string;
  title: string;
  content: string; // HTML content
}

export interface CaseIntelligenceReport {
  generatedAt: string;
  generatedByRole: UserRole;
  sections: ReportSection[];
}

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateCaseReport(params: {
  entities: Entity[];
  relationships: Relationship[];
  documents: CaseDocument[];
  insights: AIInsight[];
  anomalies: AnomalyFinding[];
  networkReport: NetworkXRayReport;
  role: UserRole;
}): CaseIntelligenceReport {
  const { entities, relationships, documents, insights, anomalies, networkReport, role } = params;
  const generatedAt = new Date().toISOString();

  const sections: ReportSection[] = [];

  // 1. Case Overview
  sections.push({
    id: 'case-overview',
    title: '1. Case Overview',
    content: `
      <p><strong>Report Generated:</strong> ${new Date(generatedAt).toLocaleString()}</p>
      <p><strong>Total Documents:</strong> ${documents.length}</p>
      <p><strong>Total Entities:</strong> ${entities.length}</p>
      <p><strong>Total Relationships:</strong> ${relationships.length}</p>
      <p><strong>Graph Density:</strong> ${(networkReport.graphDensity * 100).toFixed(1)}%</p>
      <p><strong>Entity Types:</strong> ${[...new Set(entities.map(e => e.type))].join(', ')}</p>
    `,
  });

  // 2. Document & Evidence Summary
  const docRows = documents.map(d => {
    const hash = d.sha256Hash ? compactHash(d.sha256Hash) : 'N/A';
    return `<tr>
      <td>${esc(d.id)}</td>
      <td>${esc(d.title)}</td>
      <td>${esc(d.type)}</td>
      <td>${esc(d.date)}</td>
      <td><code>${esc(hash)}</code></td>
    </tr>`;
  }).join('');

  sections.push({
    id: 'document-summary',
    title: '2. Document & Evidence Summary',
    content: `
      <table>
        <thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Date</th><th>Integrity</th></tr></thead>
        <tbody>${docRows}</tbody>
      </table>
    `,
  });

  // 3. Network Overview
  const typeCounts: Record<string, number> = {};
  entities.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const typeBreakdown = Object.entries(typeCounts).map(([t, c]) => `${t}: ${c}`).join(', ');

  sections.push({
    id: 'network-overview',
    title: '3. Network Overview',
    content: `
      <p><strong>Nodes:</strong> ${networkReport.totalNodes} | <strong>Edges:</strong> ${networkReport.totalEdges}</p>
      <p><strong>Entity Type Breakdown:</strong> ${esc(typeBreakdown)}</p>
      <p><strong>Communities Detected:</strong> ${networkReport.clusters.length}</p>
      <p><strong>Bridge Nodes:</strong> ${networkReport.bridges.length}</p>
      <p><strong>Isolated Entities:</strong> ${networkReport.isolatedEntities.length}</p>
    `,
  });

  // 4. Network Importance (top influencers)
  const influencerRows = networkReport.influencers.slice(0, 10).map(n => {
    const label = isSensitiveEntityType(n.type) ? maskSensitiveField(role, n.label, n.type) : n.label;
    return `<tr>
      <td>${esc(label)}</td>
      <td>${esc(n.type)}</td>
      <td>${n.degree}</td>
      <td>${n.betweenness.toFixed(4)}</td>
      <td>${n.networkImportanceReasons.map(r => esc(r)).join('; ')}</td>
    </tr>`;
  }).join('');

  sections.push({
    id: 'network-importance',
    title: '4. Network Importance',
    content: `
      <p>Top entities by structural network importance (betweenness centrality and degree):</p>
      <table>
        <thead><tr><th>Entity</th><th>Type</th><th>Degree</th><th>Betweenness</th><th>Reasons</th></tr></thead>
        <tbody>${influencerRows}</tbody>
      </table>
      <p class="disclaimer">Network importance reflects structural position, not determination of guilt.</p>
    `,
  });

  // 5. Community / Bridge Analysis
  const clusterInfo = networkReport.clusters.map(c => {
    const members = c.nodeIds.map(nid => {
      const ent = entities.find(e => e.id === nid);
      if (!ent) return nid;
      return isSensitiveEntityType(ent.type) ? maskSensitiveField(role, ent.label, ent.type) : ent.label;
    });
    return `<div class="cluster-block">
      <h4>Cluster ${c.id}: ${esc(c.name)}</h4>
      <p><strong>Members (${c.nodeIds.length}):</strong> ${members.map(m => esc(m)).join(', ')}</p>
      <p><strong>Internal Links:</strong> ${c.internalRelationshipsCount} | <strong>External Links:</strong> ${c.externalRelationshipsCount}</p>
      ${c.bridgeEntityIds.length > 0 ? `<p><strong>Bridge Entities:</strong> ${c.bridgeEntityIds.length}</p>` : ''}
    </div>`;
  }).join('');

  sections.push({
    id: 'community-bridge',
    title: '5. Community / Bridge Analysis',
    content: clusterInfo || '<p>No community clusters detected.</p>',
  });

  // 6. Detected Patterns / Anomalies
  const anomalyRows = anomalies.map(a => {
    const involvedLabels = a.involvedEntityIds.map(id => {
      const ent = entities.find(e => e.id === id);
      if (!ent) return id;
      return isSensitiveEntityType(ent.type) ? maskSensitiveField(role, ent.label, ent.type) : ent.label;
    });
    return `<div class="anomaly-block">
      <h4>[${esc(a.severity)}] ${esc(a.title)}</h4>
      <p><strong>Detector:</strong> ${esc(a.detectorType)} | <strong>Date:</strong> ${esc(a.date)}</p>
      <p><strong>Explanation:</strong> ${esc(a.explanation)}</p>
      <p><strong>Involved:</strong> ${involvedLabels.map(l => esc(l)).join(', ')}</p>
      <p><strong>Recommended Action:</strong> ${esc(a.recommendedAction)}</p>
    </div>`;
  }).join('');

  sections.push({
    id: 'anomalies',
    title: '6. Detected Patterns / Anomalies',
    content: anomalyRows || '<p>No anomalies detected.</p>',
  });

  // 7. Timeline Highlights
  const allDates = new Set<string>();
  entities.forEach(e => {
    e.evidence?.forEach(ev => { if (ev.date) allDates.add(ev.date); });
    if (e.metadata?.firstSeenDate) allDates.add(e.metadata.firstSeenDate);
  });
  relationships.forEach(r => r.evidence.forEach(ev => { if (ev.date) allDates.add(ev.date); }));
  documents.forEach(d => allDates.add(d.date));
  const sortedDates = [...allDates].sort();

  sections.push({
    id: 'timeline',
    title: '7. Timeline Highlights',
    content: `
      <p><strong>Date Range:</strong> ${sortedDates[0] || 'N/A'} to ${sortedDates[sortedDates.length - 1] || 'N/A'}</p>
      <p><strong>Distinct Dates in Evidence:</strong> ${sortedDates.length}</p>
      <ul>${sortedDates.slice(0, 20).map(d => `<li>${esc(d)}</li>`).join('')}</ul>
      ${sortedDates.length > 20 ? `<p>... and ${sortedDates.length - 20} more dates</p>` : ''}
    `,
  });

  // 8. Connection Analysis (summary of network paths - structural info)
  const relTypeCounts: Record<string, number> = {};
  relationships.forEach(r => { relTypeCounts[r.type] = (relTypeCounts[r.type] || 0) + 1; });
  const relBreakdown = Object.entries(relTypeCounts).map(([t, c]) => `<li>${esc(t.replace(/_/g, ' '))}: ${c}</li>`).join('');

  sections.push({
    id: 'connection-analysis',
    title: '8. Connection Analysis',
    content: `
      <p><strong>Relationship Type Distribution:</strong></p>
      <ul>${relBreakdown}</ul>
    `,
  });

  // 9. Evidence References
  const allEvidence: { owner: string; docId: string; snippet: string; date: string }[] = [];
  entities.forEach(e => {
    e.evidence?.forEach(ev => {
      const ownerLabel = isSensitiveEntityType(e.type) ? maskSensitiveField(role, e.label, e.type) : e.label;
      allEvidence.push({
        owner: ownerLabel,
        docId: ev.documentId,
        snippet: canViewSensitiveFields(role) ? ev.snippet : maskSnippetSensitiveValues(role, ev.snippet),
        date: ev.date || '',
      });
    });
  });

  const evidenceRows = allEvidence.slice(0, 30).map(ev =>
    `<tr><td>${esc(ev.owner)}</td><td>${esc(ev.docId)}</td><td>${esc(ev.snippet.substring(0, 120))}${ev.snippet.length > 120 ? '…' : ''}</td></tr>`
  ).join('');

  sections.push({
    id: 'evidence-refs',
    title: '9. Evidence References',
    content: `
      <p>Showing ${Math.min(allEvidence.length, 30)} of ${allEvidence.length} evidence records:</p>
      <table>
        <thead><tr><th>Owner</th><th>Document</th><th>Snippet</th></tr></thead>
        <tbody>${evidenceRows}</tbody>
      </table>
    `,
  });

  // 10. Document Integrity
  const integrityRows = documents.map(d => `<tr>
    <td>${esc(d.id)}</td>
    <td>${esc(d.title)}</td>
    <td><code>${d.sha256Hash ? esc(d.sha256Hash) : 'Not computed'}</code></td>
    <td>${esc(d.contentSource || 'SAMPLE_DATA')}</td>
  </tr>`).join('');

  sections.push({
    id: 'integrity',
    title: '10. Document Integrity',
    content: `
      <p>SHA-256 content-integrity fingerprints for ingested documents. A hash verifies content has not been modified; it does not prove authenticity.</p>
      <table>
        <thead><tr><th>ID</th><th>Title</th><th>SHA-256 Hash</th><th>Source</th></tr></thead>
        <tbody>${integrityRows}</tbody>
      </table>
    `,
  });

  // 11. AI-Generated Observations
  const insightBlocks = insights.map(ins => {
    const involved = ins.involvedEntityIds.map(id => {
      const ent = entities.find(e => e.id === id);
      if (!ent) return id;
      return isSensitiveEntityType(ent.type) ? maskSensitiveField(role, ent.label, ent.type) : ent.label;
    });
    return `<div class="insight-block">
      <h4>[${esc(ins.priorityLevel)}] ${esc(ins.title)}</h4>
      <p><strong>Category:</strong> ${esc(ins.category)}</p>
      <p><strong>Involved:</strong> ${involved.map(l => esc(l)).join(', ')}</p>
      <p><strong>Contributing Signals:</strong></p>
      <ul>${ins.contributingSignals.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>`;
  }).join('');

  sections.push({
    id: 'ai-observations',
    title: '11. AI-Generated Observations',
    content: `
      ${insightBlocks || '<p>No AI insights generated for this case.</p>'}
      <div class="disclaimer-block">
        <p><strong>All AI-generated observations require investigator validation.</strong></p>
        <p><strong>AI outputs are decision-support information and are not determinations of guilt.</strong></p>
      </div>
    `,
  });

  return { generatedAt, generatedByRole: role, sections };
}

/**
 * Renders the complete report as printable HTML.
 */
export function renderReportHTML(report: CaseIntelligenceReport): string {
  const sectionsHTML = report.sections.map(s => `
    <section class="report-section">
      <h2>${esc(s.title)}</h2>
      ${s.content}
    </section>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NETRA Case Intelligence Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #1a1a1a; max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1 { border-bottom: 3px solid #0e7490; padding-bottom: 0.5rem; color: #0e7490; }
    h2 { color: #164e63; margin-top: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem; }
    h4 { color: #334155; margin: 0.5rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.85rem; }
    th, td { border: 1px solid #cbd5e1; padding: 0.4rem 0.6rem; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    code { background: #f1f5f9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; word-break: break-all; }
    .disclaimer, .disclaimer-block p { color: #b91c1c; font-weight: 600; margin-top: 1rem; }
    .cluster-block, .anomaly-block, .insight-block { border-left: 3px solid #0e7490; padding-left: 1rem; margin: 0.8rem 0; }
    .report-meta { color: #64748b; font-size: 0.85rem; }
    @media print { body { padding: 1rem; } }
  </style>
</head>
<body>
  <h1>NETRA — Case Intelligence Report</h1>
  <p class="report-meta">Generated: ${new Date(report.generatedAt).toLocaleString()} | Role: ${esc(report.generatedByRole)}</p>
  <p class="report-meta">This report was generated from verified case data. It is decision-support material, not a legal determination.</p>
  ${sectionsHTML}
</body>
</html>`;
}
