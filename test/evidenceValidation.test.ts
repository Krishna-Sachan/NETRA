import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizeEvidenceText,
  evidenceExistsInSource,
  validateExtractionResponse,
  validateInsightsResponse,
  VALID_ENTITY_TYPES,
  VALID_RELATIONSHIP_TYPES,
  VALID_CONFIDENCE_LABELS
} from '../src/utils/evidenceValidation';
import { SAMPLE_DOCUMENTS } from '../src/data/sampleDocuments';
import { SYNTHETIC_PREPARSED_DOCS } from '../src/data/syntheticFallbacks';
import { Entity, Relationship } from '../src/types';

describe('Evidence Validation and Extraction Pipeline', () => {
  const sampleDocumentText = `FIRST INFORMATION REPORT (Under Sec 154 Cr.P.C.)
Police Station: Crime Branch Anti-Extortion & Organized Crime Unit, Mumbai
Case FIR No: 142/2024 | Date of Occurrence: 14-Oct-2024 at 02:30 hrs

1. DETAILS OF INCIDENT & SEIZURE:
Acting upon actionable source intelligence, a tactical raid was executed at Godown 4, Bhiwandi Logistics Hub, Thane Rural. Upon cordoning the perimeter, officers intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821 loaded with concealed false-bottom consignment crates.

2. SUSPECT INTERCEPTION & VEHICULAR CUSTODY:
The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane, who claimed to be operating under direct freight forwarding instructions from Apex Freight Forwarders Pvt Ltd. Search of the vehicle yielded two mobile handsets, including primary burner device +91-98201-44719, which registered frequent incoming encrypted VoIP pings from an overseas IP gateway attributed to Tariq "Raza" Merchant.`;

  // Test A: exact evidence snippet → accepted
  it('A. exact evidence snippet is accepted', () => {
    const snippet = 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane';
    const exists = evidenceExistsInSource(sampleDocumentText, snippet);
    assert.strictEqual(exists, true);

    const validPayload = {
      entities: [
        {
          type: 'PERSON',
          label: 'Vikram "Vicky" Sharma',
          aliases: ['Vicky Sharma'],
          evidenceSnippet: snippet
        }
      ],
      relationships: [],
      caseSummary: 'Suspect vehicle intercepted.'
    };

    const result = validateExtractionResponse(sampleDocumentText, validPayload);
    assert.strictEqual(result.valid, true);
    if (result.valid) {
      assert.strictEqual(result.data.entities.length, 1);
      assert.strictEqual(result.data.entities[0].label, 'Vikram "Vicky" Sharma');
    }
  });

  // Test B: whitespace-normalized evidence snippet → accepted
  it('B. whitespace-normalized evidence snippet with line-breaks and smart quotes is accepted', () => {
    // Snippet with extra spaces, tabs, newlines, and smart quotes
    const rawSnippet = 'The vehicle   was driven by Vikram \u201CVicky\u201D Sharma, \n\t  a resident of Kalwa, Thane';
    const exists = evidenceExistsInSource(sampleDocumentText, rawSnippet);
    assert.strictEqual(exists, true);

    const validPayload = {
      entities: [
        {
          type: 'PERSON',
          label: 'Vikram "Vicky" Sharma',
          aliases: [],
          evidenceSnippet: rawSnippet
        }
      ],
      relationships: [],
      caseSummary: 'Test summary'
    };

    const result = validateExtractionResponse(sampleDocumentText, validPayload);
    assert.strictEqual(result.valid, true);
  });

  // Test C: altered/fabricated snippet → rejected
  it('C. altered or fabricated snippet is rejected', () => {
    const fabricatedSnippet = 'Vikram Sharma confessed to smuggling 50 kilograms of contraband gold across the border.';
    const exists = evidenceExistsInSource(sampleDocumentText, fabricatedSnippet);
    assert.strictEqual(exists, false);

    const invalidPayload = {
      entities: [
        {
          type: 'PERSON',
          label: 'Vikram "Vicky" Sharma',
          aliases: [],
          evidenceSnippet: fabricatedSnippet
        }
      ],
      relationships: [],
      caseSummary: 'Fabricated claim'
    };

    const result = validateExtractionResponse(sampleDocumentText, invalidPayload);
    assert.strictEqual(result.valid, false);
    if (!result.valid) {
      assert.match(result.error, /Extraction rejected: one or more AI evidence snippets could not be verified/i);
    }
  });

  // Test D: invalid entity type → rejected
  it('D. invalid entity type is rejected', () => {
    const validSnippet = 'tactical raid was executed at Godown 4, Bhiwandi Logistics Hub, Thane Rural.';
    const invalidPayload = {
      entities: [
        {
          type: 'CRIMINAL_SUSPECT', // NOT in the 7 allowed entity types
          label: 'Godown 4',
          aliases: [],
          evidenceSnippet: validSnippet
        }
      ],
      relationships: [],
      caseSummary: 'Test summary'
    };

    const result = validateExtractionResponse(sampleDocumentText, invalidPayload);
    assert.strictEqual(result.valid, false);
    if (!result.valid) {
      assert.match(result.error, /invalid entity type/i);
    }
  });

  // Test E: invalid relationship reference → rejected
  it('E. invalid relationship reference (entity not extracted) is rejected', () => {
    const snippet1 = 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane';
    const snippet2 = 'intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821';

    const payloadWithInvalidReference = {
      entities: [
        {
          type: 'PERSON',
          label: 'Vikram "Vicky" Sharma',
          aliases: [],
          evidenceSnippet: snippet1
        }
        // Notice: MH-04-AX-8821 entity was NOT extracted
      ],
      relationships: [
        {
          sourceLabel: 'Vikram "Vicky" Sharma',
          targetLabel: 'MH-04-AX-8821', // References unextracted entity
          type: 'operates_vehicle',
          confidenceLabel: 'HIGH',
          evidenceSnippet: snippet1
        }
      ],
      caseSummary: 'Test reference validation'
    };

    const result = validateExtractionResponse(sampleDocumentText, payloadWithInvalidReference);
    assert.strictEqual(result.valid, false);
    if (!result.valid) {
      assert.match(result.error, /references entity "MH-04-AX-8821" which was not found/i);
    }
  });

  // Test F: relationship with missing evidence → rejected
  it('F. relationship with missing or empty evidence snippet is rejected', () => {
    const snippet1 = 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane';
    const snippet2 = 'intercepted a dark blue Mahindra Scorpio bearing registration number MH-04-AX-8821';

    const payloadWithMissingRelEvidence = {
      entities: [
        {
          type: 'PERSON',
          label: 'Vikram "Vicky" Sharma',
          aliases: [],
          evidenceSnippet: snippet1
        },
        {
          type: 'VEHICLE',
          label: 'MH-04-AX-8821',
          aliases: [],
          evidenceSnippet: snippet2
        }
      ],
      relationships: [
        {
          sourceLabel: 'Vikram "Vicky" Sharma',
          targetLabel: 'MH-04-AX-8821',
          type: 'operates_vehicle',
          confidenceLabel: 'HIGH',
          evidenceSnippet: '   ' // empty evidence snippet
        }
      ],
      caseSummary: 'Missing evidence'
    };

    const result = validateExtractionResponse(sampleDocumentText, payloadWithMissingRelEvidence);
    assert.strictEqual(result.valid, false);
    if (!result.valid) {
      assert.match(result.error, /missing an evidence snippet/i);
    }
  });

  // Test G: Verify that all built-in demo fallback extractions have 100% verified evidence and valid structure
  it('G. all built-in demo fallback extractions pass validateExtractionResponse and evidence verification', () => {
    const docMap = new Map(SAMPLE_DOCUMENTS.map(d => [d.id, d]));

    const fallbackDocIds = Object.keys(SYNTHETIC_PREPARSED_DOCS);
    assert.strictEqual(fallbackDocIds.length, 4, 'Must have 4 fallback extractions');

    for (const docId of fallbackDocIds) {
      const doc = docMap.get(docId);
      assert.ok(doc, `Sample document ${docId} must exist in SAMPLE_DOCUMENTS`);

      const fallbackExtraction = SYNTHETIC_PREPARSED_DOCS[docId];
      assert.ok(fallbackExtraction, `Fallback extraction for ${docId} must exist`);

      // 1. Pass fallback extraction and doc.content into validateExtractionResponse
      const result = validateExtractionResponse(doc.content, fallbackExtraction);

      // 2. Assert validation succeeds
      assert.strictEqual(result.valid, true, `Validation must succeed for ${docId}: ${result.valid === false ? result.error : ''}`);

      if (result.valid) {
        // 3. Assert every entity evidenceSnippet exists in that document
        for (const ent of result.data.entities) {
          assert.strictEqual(
            evidenceExistsInSource(doc.content, ent.evidenceSnippet),
            true,
            `Entity "${ent.label}" evidenceSnippet in ${docId} must exist in document`
          );
          assert.ok(VALID_ENTITY_TYPES.includes(ent.type as any), `Entity type "${ent.type}" must be valid`);
        }

        // 4. Assert every relationship evidenceSnippet exists in that document
        // 5. Assert every relationship's sourceLabel and targetLabel resolve
        // 6. Assert every relationship type and confidence label is valid
        const entityLabels = new Set(result.data.entities.map(e => e.label.toLowerCase()));
        for (const ent of result.data.entities) {
          ent.aliases.forEach(a => entityLabels.add(a.toLowerCase()));
        }

        for (const rel of result.data.relationships) {
          assert.strictEqual(
            evidenceExistsInSource(doc.content, rel.evidenceSnippet),
            true,
            `Relationship ${rel.sourceLabel} -> ${rel.targetLabel} evidenceSnippet in ${docId} must exist in document`
          );
          assert.ok(
            VALID_RELATIONSHIP_TYPES.includes(rel.type as any),
            `Relationship type "${rel.type}" must be valid`
          );
          assert.ok(
            VALID_CONFIDENCE_LABELS.includes(rel.confidenceLabel as any),
            `Confidence label "${rel.confidenceLabel}" must be valid`
          );
          assert.ok(
            entityLabels.has(rel.sourceLabel.toLowerCase()),
            `Relationship sourceLabel "${rel.sourceLabel}" must resolve in ${docId}`
          );
          assert.ok(
            entityLabels.has(rel.targetLabel.toLowerCase()),
            `Relationship targetLabel "${rel.targetLabel}" must resolve in ${docId}`
          );
        }
      }
    }
  });
});

describe('Network Insights Validation Pipeline', () => {
  const sampleEntities: Entity[] = [
    {
      id: 'ENT-PERS-001',
      type: 'PERSON',
      label: 'Vikram "Vicky" Sharma',
      aliases: ['Vicky Sharma'],
      evidence: [
        {
          documentId: 'DOC-FIR-142',
          snippet: 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane',
          confidence: 'HIGH'
        }
      ]
    },
    {
      id: 'ENT-PERS-002',
      type: 'PERSON',
      label: 'Subhash "Bhai" Nayak',
      aliases: ['Subhash Nayak'],
      evidence: [
        {
          documentId: 'DOC-CDR-88',
          snippet: 'port handling contractor Subhash "Bhai" Nayak.',
          confidence: 'HIGH'
        }
      ]
    }
  ];

  const sampleRelationships: Relationship[] = [
    {
      id: 'REL-001',
      sourceId: 'ENT-PERS-001',
      targetId: 'ENT-PERS-002',
      type: 'communicated_with',
      confidenceLabel: 'HIGH',
      evidence: [
        {
          documentId: 'DOC-CDR-88',
          snippet: '19 direct calls logged between +91-98201-44719 and Kolkata cellular node +91-97330-89102',
          confidence: 'HIGH'
        }
      ]
    }
  ];

  it('H. valid graph evidence citation is accepted and returns trusted evidence', () => {
    const validInsights = [
      {
        id: 'INSIGHT-01',
        title: 'Cross-Cluster Operational Bridge',
        category: 'CROSS_CLUSTER_BRIDGE',
        priorityLevel: 'HIGH_PRIORITY',
        contributingSignals: [
          'High betweenness centrality linking western transport and eastern stevedores',
          'Corroborated telephonic communications'
        ],
        involvedEntityIds: ['ENT-PERS-001', 'ENT-PERS-002'],
        evidenceSnippets: [
          {
            documentId: 'DOC-FIR-142',
            snippet: 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane'
          },
          {
            documentId: 'DOC-CDR-88',
            snippet: '19 direct calls logged between +91-98201-44719 and Kolkata cellular node +91-97330-89102'
          }
        ],
        recommendedInquiry: [
          'Issue Sec 91 Cr.P.C. requisition for subscriber KYC and tower dump verification'
        ]
      }
    ];

    const result = validateInsightsResponse(validInsights, sampleEntities, sampleRelationships);
    assert.strictEqual(result.valid, true);
    if (result.valid) {
      assert.strictEqual(result.data.length, 1);
      assert.strictEqual(result.data[0].evidenceSnippets.length, 2);
      // Ensure trusted evidence object is returned
      assert.strictEqual(result.data[0].evidenceSnippets[0].confidence, 'HIGH');
    }
  });

  it('I. fabricated insight evidence citation is rejected with controlled error', () => {
    const fabricatedInsights = [
      {
        id: 'INSIGHT-02',
        title: 'Fabricated Link Finding',
        category: 'FINANCIAL_CONDUIT',
        priorityLevel: 'ELEVATED',
        contributingSignals: ['Fabricated wire route without graph backing'],
        involvedEntityIds: ['ENT-PERS-001'],
        evidenceSnippets: [
          {
            documentId: 'DOC-FIR-142',
            snippet: 'Fabricated sentence about secret offshore Cayman bank accounts never mentioned in evidence.'
          }
        ],
        recommendedInquiry: ['Check accounts']
      }
    ];

    const result = validateInsightsResponse(fabricatedInsights, sampleEntities, sampleRelationships);
    assert.strictEqual(result.valid, false);
    if (result.valid === false) {
      assert.strictEqual(
        result.error,
        'Insight generation rejected: one or more AI evidence citations could not be verified against the case evidence.'
      );
      assert.strictEqual(result.code, 'UNVERIFIED_INSIGHT_EVIDENCE');
    }
  });

  it('J. unknown involvedEntityId is rejected', () => {
    const unknownEntityInsight = [
      {
        id: 'INSIGHT-03',
        title: 'Bridge with Non-Existent Entity',
        category: 'COMMUNICATION_HUB',
        priorityLevel: 'ROUTINE',
        contributingSignals: ['High call density'],
        involvedEntityIds: ['ENT-PERS-001', 'ENT-UNKNOWN-999'],
        evidenceSnippets: [
          {
            documentId: 'DOC-FIR-142',
            snippet: 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane'
          }
        ],
        recommendedInquiry: ['Verify unknown device']
      }
    ];

    const result = validateInsightsResponse(unknownEntityInsight, sampleEntities, sampleRelationships);
    assert.strictEqual(result.valid, false);
    if (result.valid === false) {
      assert.match(result.error, /references unknown involvedEntityId "ENT-UNKNOWN-999"/i);
      assert.strictEqual(result.code, 'UNKNOWN_INVOLVED_ENTITY_ID');
    }
  });

  it('K. invalid category or priorityLevel is rejected', () => {
    const invalidCategoryInsight = [
      {
        id: 'INSIGHT-04',
        title: 'Invalid Category Finding',
        category: 'ARBITRARY_SAAS_LABEL',
        priorityLevel: 'HIGH_PRIORITY',
        contributingSignals: ['Signal A'],
        involvedEntityIds: ['ENT-PERS-001'],
        evidenceSnippets: [
          {
            documentId: 'DOC-FIR-142',
            snippet: 'The vehicle was driven by Vikram "Vicky" Sharma, a resident of Kalwa, Thane'
          }
        ],
        recommendedInquiry: ['Inquiry step']
      }
    ];

    const result = validateInsightsResponse(invalidCategoryInsight, sampleEntities, sampleRelationships);
    assert.strictEqual(result.valid, false);
    if (result.valid === false) {
      assert.match(result.error, /has invalid category "ARBITRARY_SAAS_LABEL"/i);
    }
  });
});
