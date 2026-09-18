import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  findDuplicateEntities, 
  mergeEntities, 
  normalizeName, 
  normalizePhoneNumber,
  calculateLevenshteinSimilarity
} from '../src/services/entityResolution';
import { 
  analyzeNetworkXRay, 
  DEFAULT_NETWORK_ANALYSIS_CONFIG 
} from '../src/services/networkAnalysis';
import { 
  detectNetworkAnomalies, 
  ANOMALY_THRESHOLDS 
} from '../src/services/anomalyDetection';
import { 
  buildTimelineFromCase, 
  filterGraphByTimeWindow, 
  normalizeDate 
} from '../src/services/timelineService';
import { 
  generateEntityId, 
  generateRelationshipId, 
  generateAnomalyId, 
  generateDocumentId,
  generateMilestoneId,
  generateDeterministicId
} from '../src/services/idService';
import { Entity, Relationship, CaseDocument } from '../src/types';

describe('NETRA Phase 2.5: Intelligence Layer Correctness & Regression Tests', () => {

  // =========================================================================
  // TEST A: Deterministic Similarity Calculation
  // =========================================================================
  it('TEST A: Deterministic Similarity Calculation (No Probability Terminology)', () => {
    const e1: Entity = {
      id: 'ENT-TEST-A1',
      label: 'Devendra Kumar Sharma',
      type: 'PERSON',
      aliases: ['Dev Sharma'],
      evidence: [
        {
          documentId: 'DOC-101',
          date: '2024-10-10',
          snippet: 'Devendra Kumar Sharma phone +91 98200-11223'
        }
      ]
    };

    const e2: Entity = {
      id: 'ENT-TEST-A2',
      label: 'Devendra K. Sharma',
      type: 'PERSON',
      aliases: ['Dev Sharma'],
      evidence: [
        {
          documentId: 'DOC-102',
          date: '2024-10-12',
          snippet: 'Contact Devendra K. Sharma at 09820011223'
        }
      ]
    };

    const candidates = findDuplicateEntities([e1, e2]);
    assert.strictEqual(candidates.length, 1, 'Should identify candidate duplicates');

    const candidate = candidates[0];
    assert.strictEqual(typeof candidate.similarityScore, 'number', 'similarityScore must be a number');
    assert.ok(candidate.similarityScore > 0 && candidate.similarityScore <= 1.0, 'similarityScore must be between 0 and 1');
    assert.strictEqual(typeof candidate.similarityPercentage, 'number', 'similarityPercentage must be a number');
    assert.ok(candidate.similarityPercentage > 50, 'similarityPercentage must be > 50% for high match');
    assert.ok(Array.isArray(candidate.matchingFactors), 'matchingFactors must be an array');
    assert.ok(candidate.matchingFactors.length > 0, 'Should list matching factors');

    // Strict Negative Constraint: Verify result does NOT contain probability fields or wording
    const candidateRecord = candidate as any;
    assert.strictEqual(candidateRecord.mergeProbability, undefined, 'Must NOT contain mergeProbability');
    assert.strictEqual(candidateRecord.matchReasons, undefined, 'Must NOT contain matchReasons');
    assert.strictEqual(candidateRecord.probability, undefined, 'Must NOT contain probability field');

    const candidateStr = JSON.stringify(candidate).toLowerCase();
    assert.ok(!candidateStr.includes('probability'), 'Must not contain the word "probability" in output');
    assert.ok(!candidateStr.includes('guilt'), 'Must not contain "guilt"');
  });

  // =========================================================================
  // TEST B: Normalization
  // =========================================================================
  it('TEST B: Canonical Normalization of Phones and Names', () => {
    // Phone numbers with varying formatting
    const rawPhones = [
      '+91 98765 43210',
      '98765-43210',
      '09876543210',
      '+91-98765-43210',
      '  9876543210  '
    ];
    const normalizedPhones = rawPhones.map(p => normalizePhoneNumber(p));
    const targetCanonical = '9876543210';
    normalizedPhones.forEach(p => {
      assert.strictEqual(p, targetCanonical, `Phone ${p} did not match canonical ${targetCanonical}`);
    });

    // Names with punctuation, case differences, whitespace variations
    const rawNames = [
      'Vikram "Vicky" Sharma',
      'vikram   vicky  sharma',
      'Vikram (Vicky) Sharma.',
      'VIKRAM VICKY SHARMA'
    ];
    const normalizedNames = rawNames.map(n => normalizeName(n));
    const expectedName = 'vikram vicky sharma';
    normalizedNames.forEach(n => {
      assert.strictEqual(n, expectedName, `Name ${n} did not normalize to ${expectedName}`);
    });
  });

  // =========================================================================
  // TEST C: Merge Logic (Pure Function)
  // =========================================================================
  it('TEST C: Merge Logic (Pure Function, Deduplicated Citations, No Mutation)', () => {
    const originalEntities: Entity[] = [
      {
        id: 'ENT-SURVIVOR',
        label: 'Tariq Merchant',
        type: 'PERSON',
        aliases: ['Raza'],
        evidence: [
          { documentId: 'DOC-01', date: '2024-10-01', snippet: 'Evidence 1' }
        ]
      },
      {
        id: 'ENT-DUPLICATE',
        label: 'Tariq M.',
        type: 'PERSON',
        aliases: ['Tariq Bhai', 'Raza'], // 'Raza' is duplicate
        evidence: [
          { documentId: 'DOC-01', date: '2024-10-01', snippet: 'Evidence 1' }, // duplicate snippet
          { documentId: 'DOC-02', date: '2024-10-02', snippet: 'Evidence 2' }
        ]
      },
      {
        id: 'ENT-OTHER',
        label: 'Apex Logistics',
        type: 'ORGANIZATION',
        aliases: [],
        evidence: []
      }
    ];

    const originalRelationships: Relationship[] = [
      {
        id: 'REL-1',
        sourceId: 'ENT-DUPLICATE',
        targetId: 'ENT-OTHER',
        type: 'CONTROLS',
        confidenceLabel: 'HIGH',
        evidence: [{ documentId: 'DOC-01', date: '2024-10-01', snippet: 'Controls' }]
      }
    ];

    // Deep freeze original array snapshot
    const entitiesSnapshot = JSON.stringify(originalEntities);
    const relationshipsSnapshot = JSON.stringify(originalRelationships);

    const { updatedEntities, updatedRelationships, mergedEntity } = mergeEntities(
      'ENT-SURVIVOR',
      'ENT-DUPLICATE',
      originalEntities,
      originalRelationships
    );

    // Verify immutability of inputs
    assert.strictEqual(JSON.stringify(originalEntities), entitiesSnapshot, 'Original entities array must NOT be mutated');
    assert.strictEqual(JSON.stringify(originalRelationships), relationshipsSnapshot, 'Original relationships array must NOT be mutated');

    // Verify duplicate entity removed
    assert.strictEqual(updatedEntities.length, 2);
    assert.ok(!updatedEntities.some(e => e.id === 'ENT-DUPLICATE'), 'Duplicate entity must be removed');

    // Verify survivor entity contains combined aliases without duplicates
    assert.strictEqual(mergedEntity.id, 'ENT-SURVIVOR');
    assert.ok(mergedEntity.aliases.includes('Raza'));
    assert.ok(mergedEntity.aliases.includes('Tariq Bhai'));
    assert.strictEqual(mergedEntity.aliases.filter(a => a === 'Raza').length, 1, 'Aliases must be deduplicated');

    // Verify evidence citations deduplicated
    assert.strictEqual(mergedEntity.evidence?.length, 2, 'Evidence items must be combined and deduplicated');

    // Verify relationship points to survivor ID
    assert.strictEqual(updatedRelationships.length, 1);
    assert.strictEqual(updatedRelationships[0].sourceId, 'ENT-SURVIVOR');
  });

  // =========================================================================
  // TEST D: Degree Centrality (Undirected Graph)
  // =========================================================================
  it('TEST D: Degree Centrality on Undirected Graph (No in/out distinction)', () => {
    const entities: Entity[] = [
      { id: 'N1', label: 'Node 1', type: 'PERSON', aliases: [] },
      { id: 'N2', label: 'Node 2', type: 'PERSON', aliases: [] },
      { id: 'N3', label: 'Node 3', type: 'PERSON', aliases: [] },
      { id: 'N4', label: 'Node 4', type: 'PERSON', aliases: [] },
    ];

    // N1 is connected to N2, N3, N4 (Degree = 3)
    const relationships: Relationship[] = [
      { id: 'R1', sourceId: 'N1', targetId: 'N2', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R2', sourceId: 'N3', targetId: 'N1', type: 'COMMUNICATES_WITH', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R3', sourceId: 'N1', targetId: 'N4', type: 'MET_WITH', confidenceLabel: 'HIGH', evidence: [] },
    ];

    const report = analyzeNetworkXRay(entities, relationships);

    const m1 = report.metricsByNodeId['N1'];
    assert.strictEqual(m1.degree, 3, 'N1 degree must match adjacent edge count');

    // Ensure no inDegree / outDegree in metric object
    const m1Record = m1 as any;
    assert.strictEqual(m1Record.inDegree, undefined, 'inDegree must be removed');
    assert.strictEqual(m1Record.outDegree, undefined, 'outDegree must be removed');

    assert.strictEqual(report.metricsByNodeId['N2'].degree, 1);
    assert.strictEqual(report.metricsByNodeId['N3'].degree, 1);
    assert.strictEqual(report.metricsByNodeId['N4'].degree, 1);
  });

  // =========================================================================
  // TEST E: Betweenness Centrality
  // =========================================================================
  it('TEST E: Barbell/Bridge Graph Betweenness Centrality', () => {
    // Barbell graph: Clique A (A1, A2, A3) - Bridge (B) - Clique C (C1, C2, C3)
    const entities: Entity[] = [
      { id: 'A1', label: 'A1', type: 'PERSON', aliases: [] },
      { id: 'A2', label: 'A2', type: 'PERSON', aliases: [] },
      { id: 'A3', label: 'A3', type: 'PERSON', aliases: [] },
      { id: 'BRIDGE', label: 'Bridge Node', type: 'PERSON', aliases: [] },
      { id: 'C1', label: 'C1', type: 'PERSON', aliases: [] },
      { id: 'C2', label: 'C2', type: 'PERSON', aliases: [] },
      { id: 'C3', label: 'C3', type: 'PERSON', aliases: [] },
    ];

    const relationships: Relationship[] = [
      // Clique A
      { id: 'R-A1-A2', sourceId: 'A1', targetId: 'A2', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R-A2-A3', sourceId: 'A2', targetId: 'A3', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R-A1-A3', sourceId: 'A1', targetId: 'A3', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      // Connection to Bridge
      { id: 'R-A3-B', sourceId: 'A3', targetId: 'BRIDGE', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R-B-C1', sourceId: 'BRIDGE', targetId: 'C1', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      // Clique C
      { id: 'R-C1-C2', sourceId: 'C1', targetId: 'C2', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R-C2-C3', sourceId: 'C2', targetId: 'C3', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R-C1-C3', sourceId: 'C1', targetId: 'C3', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
    ];

    const report = analyzeNetworkXRay(entities, relationships);

    const bridgeMetric = report.metricsByNodeId['BRIDGE'];
    assert.ok(bridgeMetric, 'Bridge node must have metrics');

    // Bridge node must have the highest betweenness score
    entities.forEach(ent => {
      if (ent.id !== 'BRIDGE') {
        const otherScore = report.metricsByNodeId[ent.id].betweenness;
        assert.ok(
          bridgeMetric.betweenness > otherScore,
          `Bridge betweenness (${bridgeMetric.betweenness}) must exceed other node (${otherScore})`
        );
      }
    });

    // Percentile ranking should be 100 for top node
    assert.strictEqual(bridgeMetric.betweennessPercentile, 100, 'Top betweenness node must have 100th percentile');
  });

  // =========================================================================
  // TEST F: Community Detection
  // =========================================================================
  it('TEST F: Louvain Community Detection on Distinct Graph Sub-Clusters', () => {
    // Two completely disconnected triangles
    const entities: Entity[] = [
      { id: 'G1-1', label: 'Cluster 1 Node A', type: 'ORGANIZATION', aliases: [] },
      { id: 'G1-2', label: 'Cluster 1 Node B', type: 'ORGANIZATION', aliases: [] },
      { id: 'G1-3', label: 'Cluster 1 Node C', type: 'ORGANIZATION', aliases: [] },
      { id: 'G2-1', label: 'Cluster 2 Node A', type: 'PERSON', aliases: [] },
      { id: 'G2-2', label: 'Cluster 2 Node B', type: 'PERSON', aliases: [] },
      { id: 'G2-3', label: 'Cluster 2 Node C', type: 'PERSON', aliases: [] },
    ];

    const relationships: Relationship[] = [
      { id: 'R1', sourceId: 'G1-1', targetId: 'G1-2', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R2', sourceId: 'G1-2', targetId: 'G1-3', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R3', sourceId: 'G1-3', targetId: 'G1-1', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },

      { id: 'R4', sourceId: 'G2-1', targetId: 'G2-2', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R5', sourceId: 'G2-2', targetId: 'G2-3', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
      { id: 'R6', sourceId: 'G2-3', targetId: 'G2-1', type: 'ASSOCIATE_OF', confidenceLabel: 'HIGH', evidence: [] },
    ];

    const report = analyzeNetworkXRay(entities, relationships);
    assert.ok(report.clusters.length >= 2, 'Must detect at least 2 distinct clusters');

    const comm1 = report.metricsByNodeId['G1-1'].communityId;
    const comm2 = report.metricsByNodeId['G2-1'].communityId;
    assert.notStrictEqual(comm1, comm2, 'Distinct clusters must have distinct community IDs');
  });

  // =========================================================================
  // TEST G: Network Importance Formatting (Integrity Check)
  // =========================================================================
  it('TEST G: Network Importance Formatting & Absence of Guilt Labels', () => {
    const entities: Entity[] = [
      { 
        id: 'ENT-SUBJECT', 
        label: 'Subject Alpha', 
        type: 'PERSON', 
        aliases: [],
        evidence: [
          { documentId: 'DOC-1', date: '2024-10-01', snippet: 'Evidence 1' },
          { documentId: 'DOC-2', date: '2024-10-02', snippet: 'Evidence 2' }
        ]
      },
      { id: 'ENT-PEER', label: 'Peer Beta', type: 'PERSON', aliases: [] }
    ];

    const relationships: Relationship[] = [
      { id: 'REL-1', sourceId: 'ENT-SUBJECT', targetId: 'ENT-PEER', type: 'COMMUNICATES_WITH', confidenceLabel: 'HIGH', evidence: [] }
    ];

    const report = analyzeNetworkXRay(entities, relationships);
    const m = report.metricsByNodeId['ENT-SUBJECT'];
    assert.ok(m.networkImportanceReasons, 'networkImportanceReasons must exist');

    const reasonsJoined = m.networkImportanceReasons.join(' | ');

    // Must match exact format specifications
    assert.ok(reasonsJoined.includes('Degree = 1'), 'Must format "Degree = X"');
    assert.ok(reasonsJoined.includes('Betweenness percentile ='), 'Must format "Betweenness percentile = Y"');
    assert.ok(reasonsJoined.includes('Connected communities ='), 'Must format "Connected communities = Z"');
    assert.ok(reasonsJoined.includes('Document frequency = 2'), 'Must format "Document frequency = W"');

    // Strict prohibition: NEVER use Criminality Score, Criminal Risk, Suspect Score, Guilt Score
    const prohibitedTerms = [
      'criminality score',
      'criminal risk',
      'suspect score',
      'guilt score',
      'guilty'
    ];
    prohibitedTerms.forEach(term => {
      assert.ok(!reasonsJoined.toLowerCase().includes(term), `Forbidden term "${term}" found in output`);
    });
  });

  // =========================================================================
  // TEST H: Historical Baseline Exclusion (Strictly t < T)
  // =========================================================================
  it('TEST H: Historical Baseline Exclusion (Current & Subsequent Windows Excluded)', () => {
    const entId = 'ENT-TEST-H';
    const entities: Entity[] = [
      { id: entId, label: 'Target Entity', type: 'PERSON', aliases: [] }
    ];

    // Chronological dates:
    // 2024-10-01: 2 events (Baseline Window 1)
    // 2024-10-02: 2 events (Baseline Window 2)
    // 2024-10-03: 10 events (EVALUATED SPIKE WINDOW) -> Prior baseline is (2+2)/2 = 2.0. Deviation = 10 / 2.0 = 5.0x
    // 2024-10-04: 100 events (SUBSEQUENT WINDOW) -> Must NOT contaminate 2024-10-03 baseline!
    const relationships: Relationship[] = [
      // 2024-10-01
      { id: 'R1', sourceId: entId, targetId: 'X1', type: 'CALL', confidenceLabel: 'HIGH', evidence: [{ documentId: 'D1', date: '2024-10-01', snippet: 'Call 1' }] },
      { id: 'R2', sourceId: entId, targetId: 'X2', type: 'CALL', confidenceLabel: 'HIGH', evidence: [{ documentId: 'D1', date: '2024-10-01', snippet: 'Call 2' }] },
      // 2024-10-02
      { id: 'R3', sourceId: entId, targetId: 'X1', type: 'CALL', confidenceLabel: 'HIGH', evidence: [{ documentId: 'D1', date: '2024-10-02', snippet: 'Call 3' }] },
      { id: 'R4', sourceId: entId, targetId: 'X2', type: 'CALL', confidenceLabel: 'HIGH', evidence: [{ documentId: 'D1', date: '2024-10-02', snippet: 'Call 4' }] },
      // 2024-10-03 (10 calls)
      ...Array.from({ length: 10 }).map((_, i) => ({
        id: `R-SPIKE-${i}`,
        sourceId: entId,
        targetId: 'X1',
        type: 'CALL',
        confidenceLabel: 'HIGH' as const,
        evidence: [{ documentId: 'D2', date: '2024-10-03', snippet: `Spike Call ${i}` }]
      })),
      // 2024-10-04 (100 calls subsequent)
      ...Array.from({ length: 100 }).map((_, i) => ({
        id: `R-SUB-${i}`,
        sourceId: entId,
        targetId: 'X1',
        type: 'CALL',
        confidenceLabel: 'HIGH' as const,
        evidence: [{ documentId: 'D3', date: '2024-10-04', snippet: `Subsequent Call ${i}` }]
      }))
    ];

    const findings = detectNetworkAnomalies(entities, relationships);
    const spikeFinding = findings.find(f => f.date === '2024-10-03' && f.detectorType === 'INTERACTION_SPIKE');

    assert.ok(spikeFinding, 'Should detect spike on 2024-10-03');
    assert.strictEqual(spikeFinding.supportingData?.currentInteractions, 10);
    // Baseline strictly prior: (2 + 2) / 2 = 2.0
    assert.strictEqual(spikeFinding.supportingData?.historicalBaseline, 2.0, 'Historical baseline must be strictly 2.0 (prior to 2024-10-03)');
    assert.strictEqual(spikeFinding.supportingData?.deviationMultiplier, 5.0, 'Deviation must be 10 / 2.0 = 5.0x');
  });

  // =========================================================================
  // TEST I: Insufficient Data Handling
  // =========================================================================
  it('TEST I: Insufficient Historical Data Handling (No Fake Baseline)', () => {
    const entId = 'ENT-NEW';
    const entities: Entity[] = [
      { id: entId, label: 'First Day Suspect', type: 'PERSON', aliases: [] }
    ];

    // Entity only observed on a single date with 20 calls.
    // Since there are 0 prior observation windows, baseline CANNOT be established.
    const relationships: Relationship[] = Array.from({ length: 20 }).map((_, i) => ({
      id: `REL-${i}`,
      sourceId: entId,
      targetId: 'DEST',
      type: 'CALL',
      confidenceLabel: 'HIGH' as const,
      evidence: [{ documentId: 'DOC-1', date: '2024-10-01', snippet: `Call ${i}` }]
    }));

    const findings = detectNetworkAnomalies(entities, relationships);
    const spike = findings.find(f => f.involvedEntityIds.includes(entId) && f.detectorType === 'INTERACTION_SPIKE');

    assert.strictEqual(spike, undefined, 'Must NOT trigger an interaction spike when prior observation baseline is insufficient');
  });

  // =========================================================================
  // TEST J: Location Convergence (Deterministic Rule, No Artificial Baseline)
  // =========================================================================
  it('TEST J: Location Convergence (Deterministic Co-Presence, No Artificial 1.0 Baseline)', () => {
    const entities: Entity[] = [
      { id: 'LOC-SAFEHOUSE', label: 'Bhiwandi Hub Godown 4', type: 'LOCATION', aliases: [] },
      { id: 'P1', label: 'Vikram Sharma', type: 'PERSON', aliases: [] },
      { id: 'P2', label: 'Tariq Merchant', type: 'PERSON', aliases: [] },
    ];

    const relationships: Relationship[] = [
      { 
        id: 'R1', 
        sourceId: 'P1', 
        targetId: 'LOC-SAFEHOUSE', 
        type: 'LOCATED_AT', 
        confidenceLabel: 'HIGH',
        evidence: [
          { documentId: 'D1', date: '2024-10-10', snippet: 'Visited Bhiwandi Hub Godown 4' },
          { documentId: 'D2', date: '2024-10-14', snippet: 'Intercepted at Bhiwandi Hub Godown 4' }
        ]
      },
      { 
        id: 'R2', 
        sourceId: 'P2', 
        targetId: 'LOC-SAFEHOUSE', 
        type: 'LOCATED_AT', 
        confidenceLabel: 'HIGH',
        evidence: [
          { documentId: 'D1', date: '2024-10-10', snippet: 'Tracked to Bhiwandi Hub Godown 4' },
          { documentId: 'D2', date: '2024-10-14', snippet: 'Observed near Bhiwandi Hub Godown 4' }
        ]
      }
    ];

    const findings = detectNetworkAnomalies(entities, relationships);
    const converge = findings.find(f => f.detectorType === 'LOCATION_CONVERGENCE');

    assert.ok(converge, 'Should detect location convergence across 2 distinct dates');
    assert.strictEqual(converge.supportingData?.isBaselineAvailable, false, 'isBaselineAvailable must be false for deterministic rule');
    assert.strictEqual(converge.supportingData?.historicalBaseline, null, 'Must NOT manufacture an artificial 1.0 baseline');
    assert.strictEqual(converge.supportingData?.deviationMultiplier, null, 'Must NOT manufacture an artificial 4.0x multiplier');
    assert.ok(
      converge.supportingData?.insufficientBaselineReason?.includes('Deterministic co-presence rule'),
      'Must explicitly state deterministic co-presence rule'
    );
  });

  // =========================================================================
  // TEST K: ID Generation Integrity
  // =========================================================================
  it('TEST K: ID Generation Integrity (UUID, Prefixes, 1,000 Generation Uniqueness)', () => {
    const generated = new Set<string>();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      const entId = generateEntityId('PERSON');
      assert.ok(entId.startsWith('ENT-PERSON-'), 'Entity ID must have ENT-PERSON- prefix');
      assert.ok(!generated.has(entId), `Collision detected for ${entId}`);
      generated.add(entId);

      const relId = generateRelationshipId('COMMUNICATES_WITH');
      assert.ok(relId.startsWith('REL-COMMUNICATES_WITH-'), 'Rel ID must have prefix');
      assert.ok(!generated.has(relId), `Collision detected for ${relId}`);
      generated.add(relId);

      const anomId = generateAnomalyId('SPIKE');
      assert.ok(anomId.startsWith('ANOM-SPIKE-'), 'Anomaly ID must have prefix');
      assert.ok(!generated.has(anomId), `Collision detected for ${anomId}`);
      generated.add(anomId);

      const docId = generateDocumentId('FIR');
      assert.ok(docId.startsWith('DOC-FIR-'), 'Doc ID must have prefix');
      assert.ok(!generated.has(docId), `Collision detected for ${docId}`);
      generated.add(docId);

      const msId = generateMilestoneId('2024-10-14');
      assert.ok(msId.startsWith('TL-2024-10-14-'), 'Milestone ID must have prefix');
      assert.ok(!generated.has(msId), `Collision detected for ${msId}`);
      generated.add(msId);
    }

    assert.strictEqual(generated.size, count * 5, 'All 5,000 generated IDs must be strictly unique');
  });

  // =========================================================================
  // TEST L: Provenance Distinction
  // =========================================================================
  it('TEST L: Provenance Distinction (Derived Analysis vs Primary Evidence Citations)', () => {
    const entities: Entity[] = [
      { id: 'E1', label: 'E1', type: 'PERSON', aliases: [] },
      { id: 'E2', label: 'E2', type: 'PERSON', aliases: [] }
    ];

    const relationships: Relationship[] = [
      {
        id: 'R1',
        sourceId: 'E1',
        targetId: 'E2',
        type: 'COMMUNICATES_WITH',
        confidenceLabel: 'HIGH',
        evidence: [{ documentId: 'DOC-889', date: '2024-10-15', snippet: 'Transceiver call log' }]
      }
    ];

    const findings = detectNetworkAnomalies(entities, relationships);
    findings.forEach(f => {
      // Must contain source document citations
      assert.ok(f.supportingData?.sourceDocumentIds, 'Must provide sourceDocumentIds');
      // Must contain evidence snippet citations
      assert.ok(f.evidenceSnippets, 'Must provide evidence snippets');
      // Trigger rule or explanation must be explainable
      assert.ok(f.triggerRule.length > 0, 'Trigger rule must be explicit');
    });
  });

  // =========================================================================
  // TEST M: Generic Operation on Arbitrary Data
  // =========================================================================
  it('TEST M: Generic Operation on Purely Arbitrary Case Data', () => {
    // Generate completely arbitrary data with random names, IDs, dates
    const arbitraryEntities: Entity[] = [
      { id: 'RAND-001', label: 'Omega Transnational LLC', type: 'ORGANIZATION', aliases: ['Omega Corp'] },
      { id: 'RAND-002', label: 'Dr. Jane Roe', type: 'PERSON', aliases: ['J. Roe'] },
      { id: 'RAND-003', label: 'Warehouse Berth 9', type: 'LOCATION', aliases: [] },
      { id: 'RAND-004', label: 'Unlinked Observer', type: 'PERSON', aliases: [] },
    ];

    const arbitraryRelationships: Relationship[] = [
      {
        id: 'REL-RAND-1',
        sourceId: 'RAND-001',
        targetId: 'RAND-002',
        type: 'EMPLOYS',
        confidenceLabel: 'HIGH',
        evidence: [{ documentId: 'DOC-RANDOM-X', date: '2023-05-12', snippet: 'Employs Dr. Roe' }]
      },
      {
        id: 'REL-RAND-2',
        sourceId: 'RAND-002',
        targetId: 'RAND-003',
        type: 'OPERATES_AT',
        confidenceLabel: 'HIGH',
        evidence: [{ documentId: 'DOC-RANDOM-Y', date: '2023-05-14', snippet: 'Seen at Berth 9' }]
      }
    ];

    const arbitraryDocs: CaseDocument[] = [
      {
        id: 'DOC-RANDOM-X',
        title: 'Maritime Manifest 44',
        type: 'Surveillance',
        date: '2023-05-12',
        sourceAuthority: 'Coast Guard Intelligence',
        classification: 'CONFIDENTIAL',
        content: 'Omega Transnational LLC employs Dr. Jane Roe.',
        summary: 'Shipping log'
      }
    ];

    // 1. Entity Resolution
    const duplicates = findDuplicateEntities(arbitraryEntities);
    assert.ok(Array.isArray(duplicates));

    // 2. Network X-Ray
    const report = analyzeNetworkXRay(arbitraryEntities, arbitraryRelationships);
    assert.strictEqual(report.totalNodes, 4);
    assert.strictEqual(report.totalEdges, 2);
    assert.ok(report.isolatedEntities.some(e => e.id === 'RAND-004'), 'Must identify isolated node generically');

    // 3. Anomaly Radar
    const anomalies = detectNetworkAnomalies(arbitraryEntities, arbitraryRelationships);
    assert.ok(Array.isArray(anomalies));

    // 4. Timeline
    const milestones = buildTimelineFromCase(arbitraryDocs, arbitraryEntities, arbitraryRelationships);
    assert.ok(milestones.length >= 2, 'Should extract milestones from arbitrary documents & relationships');
    assert.strictEqual(milestones[0].date, '2023-05-12');
  });

  // =========================================================================
  // TEST N: Temporal Resolution Classification
  // =========================================================================
  it('TEST N: Temporal Resolution Classification (Temporally Resolved vs Date Unknown)', () => {
    const datedEntity: Entity = {
      id: 'ENT-DATED',
      label: 'Dated Person',
      type: 'PERSON',
      aliases: [],
      evidence: [{ documentId: 'DOC-1', date: '2024-10-10', snippet: 'Dated evidence' }]
    };

    const undatedEntity: Entity = {
      id: 'ENT-UNDATED',
      label: 'Undated Person',
      type: 'PERSON',
      aliases: [],
      evidence: [{ documentId: 'DOC-1', snippet: 'No date field here' }]
    };

    const allEntities = [datedEntity, undatedEntity];

    // Normalize dates
    const datedNorm = datedEntity.evidence?.map(e => normalizeDate(e.date)).filter(Boolean);
    const undatedNorm = undatedEntity.evidence?.map(e => normalizeDate(e.date)).filter(Boolean);

    assert.strictEqual(datedNorm?.length, 1);
    assert.strictEqual(datedNorm?.[0], '2024-10-10');
    assert.strictEqual(undatedNorm?.length, 0, 'Undated entity must yield 0 valid dates');

    // Filter by temporal cutoff before datedEntity date
    const { visibleEntities } = filterGraphByTimeWindow(allEntities, [], [], '2024-10-01');
    // Undated entity must remain preserved or categorized distinctly rather than fabricated
    assert.ok(visibleEntities.some(e => e.id === 'ENT-UNDATED'));
  });

});
