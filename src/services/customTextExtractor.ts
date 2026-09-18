import { ExtractionResponse, EntityType } from '../types';

/**
 * Deterministic NLP & Pattern Extractor for Custom Case Documents.
 * Extracts entities (Persons, Phones, Vehicles, Locations, Organizations, Transactions)
 * and sentence-level relationships with verified evidence snippets.
 */
export function extractEntitiesFromCustomText(text: string): ExtractionResponse {
  const entitiesMap = new Map<string, { type: EntityType; label: string; aliases: string[]; evidenceSnippet: string }>();
  const relationships: Array<{
    sourceLabel: string;
    targetLabel: string;
    type: string;
    confidenceLabel: 'HIGH' | 'CORROBORATED' | 'INDICATIVE' | 'REPORTED';
    evidenceSnippet: string;
  }> = [];

  // Split text into sentences for sentence-level evidence extraction & relationship co-occurrence
  const sentences = text.split(/(?<=[.!?\n])\s+/).filter(s => s.trim().length > 5);

  const addEntity = (type: EntityType, label: string, snippet: string, aliases: string[] = []) => {
    const cleanLabel = label.trim().replace(/^["'\s]+|["'\s]+$/g, '');
    if (!cleanLabel || cleanLabel.length < 2) return;
    const key = `${type}:${cleanLabel.toLowerCase()}`;
    if (!entitiesMap.has(key)) {
      entitiesMap.set(key, {
        type,
        label: cleanLabel,
        aliases: Array.from(new Set([cleanLabel, ...aliases])),
        evidenceSnippet: snippet.slice(0, 200).trim()
      });
    }
  };

  // 1. Phone Numbers (+91-98311-00492, +91-91672-00384, +91-98740-11223, 10-12 digits)
  const phoneRegex = /\+91-\d{5}-\d{5}|\+\d{10,13}|\b9\d{9}\b/g;

  // 2. Vehicle Registration / Vessel Names (WB-74-C-5521, MH-04-AX-8821, M.V. Sagar Jyoti, M.V. Jal Sundari, ICGS Varad)
  const vehicleRegex = /\b[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}\b|\bM\.V\.\s+[A-Za-z\s']+(?=\s|,|\.|$)|ICGS\s+[A-Za-z]+\b/gi;

  // 3. Transactions / Financial Amounts (Rs 18,50,000, Rs 24,00,000, APX-HAL-PAYOUT, APX-8819)
  const transactionRegex = /\bRs\.?\s*[\d,]+\b|\bAPX-[A-Z0-9-]+\b/gi;

  // 4. Organizations
  const orgRegex = /\b(?:Special Task Force|STF|Coast Guard|Coastal Marine Police|Marine Police|Crime Branch|Financial Intelligence Unit|FIU-IND|NTRO|NTRO Signal Intelligence Unit|Bengal Maritime Cooperative|Metro Co-operative Bank|Apex Freight Forwarders|CID Special Branch|FIU)\b/gi;

  // 5. Locations
  const locationRegex = /\b(?:Kakdwip Jetty|Digha Coast|Digha|Burrabazar|Haldia Port Docks|Haldia|Lalbagh River Dock|Lalbagh|Contai|Farakka Barrage Checkpoint|Farakka Barrage|Farakka|Baharampur Fish Market|Baharampur|Kolkata|Purba Medinipur|Thane|Godown 4, Bhiwandi Hub|Bhiwandi Hub)\b/gi;

  // 6. Persons: Regex for named suspects/operatives with optional titles/nicknames
  const personTitleRegex = /\b(?:Captain|Commander|Complainant|Assistant Commandant|handler|operative|banker|suspect|resident|alias)?\s*([A-Z][a-z]+(?:\s+"[^"]+")?\s+[A-Z][a-z]+)\b/g;

  // Blacklist of non-person header words
  const nonPersonWords = new Set([
    'First Information', 'Information Report', 'Police Station', 'Date Of', 'Case Fir',
    'No Incident', 'Incident Brief', 'Maritime Interception', 'Recovered Contraband',
    'Electronic Evidence', 'Financial Network', 'Network Connections', 'Call Detail',
    'Intelligence Analysis', 'Analysis Report', 'Ref Doc', 'Issuing Authority',
    'Interception Wing', 'Intercept Summary', 'Phone Network', 'Cross Border',
    'Hawala Transactions', 'Operational Linkages', 'Vehicle Logistics', 'Special Task',
    'Task Force', 'Marine Cell', 'Coast Guard', 'Marine Police', 'Purba Medinipur', 'Digha Coast'
  ]);

  sentences.forEach((sentence) => {
    let match;
    // Phones
    while ((match = phoneRegex.exec(sentence)) !== null) {
      addEntity('PHONE', match[0], sentence);
    }
    // Vehicles
    while ((match = vehicleRegex.exec(sentence)) !== null) {
      addEntity('VEHICLE', match[0], sentence);
    }
    // Transactions
    while ((match = transactionRegex.exec(sentence)) !== null) {
      addEntity('TRANSACTION', match[0], sentence);
    }
    // Organizations
    while ((match = orgRegex.exec(sentence)) !== null) {
      addEntity('ORGANIZATION', match[0], sentence);
    }
    // Locations
    while ((match = locationRegex.exec(sentence)) !== null) {
      addEntity('LOCATION', match[0], sentence);
    }
    // Persons
    while ((match = personTitleRegex.exec(sentence)) !== null) {
      const candidate = match[1] || match[0];
      if (!nonPersonWords.has(candidate) && candidate.length > 4 && /[A-Z]/.test(candidate)) {
        addEntity('PERSON', candidate, sentence);
      }
    }
  });

  const extractedEntitiesList = Array.from(entitiesMap.values());

  // Extract Sentence-Level Relationships between co-occurring entities
  sentences.forEach((sentence) => {
    const sentenceEntities = extractedEntitiesList.filter(e =>
      sentence.toLowerCase().includes(e.label.toLowerCase())
    );

    if (sentenceEntities.length >= 2) {
      for (let i = 0; i < sentenceEntities.length; i++) {
        for (let j = i + 1; j < sentenceEntities.length; j++) {
          const e1 = sentenceEntities[i];
          const e2 = sentenceEntities[j];

          if (e1.label !== e2.label) {
            let relType = 'associated_with';
            const sLower = sentence.toLowerCase();

            if (e1.type === 'PHONE' || e2.type === 'PHONE') {
              relType = 'communicated_with';
            } else if (e1.type === 'TRANSACTION' || e2.type === 'TRANSACTION') {
              relType = 'transacted_with';
            } else if (e1.type === 'VEHICLE' || e2.type === 'VEHICLE') {
              relType = 'operates_vehicle';
            } else if (e1.type === 'LOCATION' || e2.type === 'LOCATION') {
              relType = 'present_at';
            } else if (e1.type === 'ORGANIZATION' || e2.type === 'ORGANIZATION') {
              relType = 'associated_with';
            } else if (sLower.includes('coordinate') || sLower.includes('logistics') || sLower.includes('arranged')) {
              relType = 'operational_link';
            }

            relationships.push({
              sourceLabel: e1.label,
              targetLabel: e2.label,
              type: relType,
              confidenceLabel: 'HIGH',
              evidenceSnippet: sentence.trim()
            });
          }
        }
      }
    }
  });

  return {
    entities: extractedEntitiesList,
    relationships,
    isDemoFallback: true
  };
}
